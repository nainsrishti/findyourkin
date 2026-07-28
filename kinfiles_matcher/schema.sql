-- ============================================================
-- findyourKin — Supabase schema. Run in the SQL editor.
-- ============================================================
create extension if not exists vector;

-- ── Profiles ────────────────────────────────────────────────
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,

  -- Display-only fields — shown on cards/profile, never scored.
  age           smallint,
  occupation    text,
  bio           text,
  photo_url     text,
  flat_photos   text[] not null default '{}', -- only meaningful when situation = 'host'

  -- Hard-filter columns get their OWN typed columns (fast, indexable).
  city          text not null,               -- 'gurgaon' | 'delhi' | 'noida' | 'other'
  locality      text,                        -- normalised sector/locality code
  gender        text not null,               -- 'male' | 'female' | 'nonbinary'
  gender_pref   text[] not null default '{any}',
  budget_band   text not null,               -- 'u8k'|'8-12k'|'12-18k'|'18-25k'|'25k+'
  budget_idx    smallint not null,           -- 0..4, precomputed for range queries
  move_in_day   int not null,                -- epoch day, for window overlap
  situation     text not null,               -- 'host' | 'seeker' | 'cohunt'

  -- Everything the scorer reads stays in JSONB → change questions, no migration.
  answers       jsonb not null default '{}'::jsonb,
  importance    jsonb not null default '{}'::jsonb,
  traits        text[] not null default '{}',-- observable traits others filter on

  embedding     vector(15),                  -- must match toVector() length
  is_active     boolean default true,
  created_at    timestamptz default now()
);

create index on profiles using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index profiles_filter_idx on profiles (is_active, city, budget_idx, move_in_day);

-- ── Interactions: drives "already seen" + your future ML labels ─────────
create type interaction_kind as enum ('pass', 'like', 'match', 'blocked');
create table interactions (
  id bigserial primary key,
  actor_id  uuid not null references profiles(id) on delete cascade,
  target_id uuid not null references profiles(id) on delete cascade,
  kind interaction_kind not null,
  shown_score real,                          -- LOG THIS. It's your training data.
  created_at timestamptz default now(),
  unique (actor_id, target_id)
);
create index interactions_actor_idx on interactions (actor_id);

-- ── Messages: direct chat between any two profiles ──────────────────────
-- Kept simple on purpose — no separate "conversations" table. A thread is
-- just "all rows where I'm sender or receiver of this other person",
-- grouped in the app layer. Chat is available as soon as you see someone
-- on discover — no match/like gate.
create table messages (
  id          bigserial primary key,
  sender_id   uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 2000),
  created_at  timestamptz default now(),
  read_at     timestamptz
);
create index messages_sender_idx   on messages (sender_id, created_at);
create index messages_receiver_idx on messages (receiver_id, created_at);

alter table messages enable row level security;
create policy "send messages as self" on messages for insert with check (auth.uid() = sender_id);
create policy "read own messages"     on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "mark received as read" on messages for update
  using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

-- Enable realtime so chat updates live without polling.
alter publication supabase_realtime add table messages;

-- ── Contact info: phone number, kept OUT of profiles on purpose ─────────
-- profiles.select is world-readable (any active row, by anyone signed in) —
-- fine for name/photo/bio, not fine for a phone number. This table's RLS
-- only lets a person read their OWN row; the founder can still see every
-- row via the Supabase dashboard / Table editor, which uses the service
-- role and bypasses RLS entirely. That's the intended access pattern:
-- private from other app users, visible to you for outreach.
create table contact_info (
  id           uuid primary key references profiles(id) on delete cascade,
  phone_number text not null,
  created_at   timestamptz default now()
);
alter table contact_info enable row level security;
create policy "insert own contact info" on contact_info for insert with check (auth.uid() = id);
create policy "read own contact info"   on contact_info for select using (auth.uid() = id);
create policy "edit own contact info"   on contact_info for update using (auth.uid() = id);

-- ── Reports: safety/moderation, private to the founder ──────────────────
-- No select policy for regular users — reports are write-only from the
-- app's side. Review them via the Supabase dashboard Table editor (service
-- role bypasses RLS), same access pattern as contact_info.
create table reports (
  id          bigserial primary key,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_id uuid not null references profiles(id) on delete cascade,
  reason      text not null,
  note        text,
  created_at  timestamptz default now()
);
alter table reports enable row level security;
create policy "insert own reports" on reports for insert with check (auth.uid() = reporter_id);

-- ── Stage 1: coarse hard filters + ANN shortlist, in Postgres ───────────
-- Cheap high-selectivity cuts here (city, budget, gender, move-in, situation,
-- already-seen). The fiddly asymmetric ones (diet/kitchen, smoking, pets,
-- dealbreakers) are re-checked exactly in TypeScript — SQL just shrinks 100k→200.
create or replace function candidate_pool(viewer uuid, pool_size int default 200)
returns table (
  id uuid, answers jsonb, importance jsonb, traits text[],
  city text, gender text, gender_pref text[], budget_band text,
  situation text, move_in_day int, ann_distance real,
  display_name text, age smallint, occupation text, bio text, photo_url text,
  flat_photos text[]
)
language sql stable as $$
  with me as (select * from profiles where id = viewer)
  select p.id, p.answers, p.importance, p.traits,
         p.city, p.gender, p.gender_pref, p.budget_band,
         p.situation, p.move_in_day,
         (p.embedding <=> me.embedding)::real as ann_distance,
         p.display_name, p.age, p.occupation, p.bio, p.photo_url, p.flat_photos
  from profiles p, me
  where p.id <> me.id
    and p.is_active
    and p.city = me.city                                   -- same NCR city
    and abs(p.budget_idx - me.budget_idx) <= 1             -- adjacent bands only
    and abs(p.move_in_day - me.move_in_day) <= 45          -- move-in window
    and not (p.situation = 'host' and me.situation = 'host') -- impossible combo
    -- mutual gender preference
    and (me.gender_pref @> array['any'] or me.gender_pref @> array[p.gender])
    and (p.gender_pref  @> array['any'] or p.gender_pref  @> array[me.gender])
    -- not already acted on, and not blocked-by
    and not exists (select 1 from interactions i
                    where i.actor_id = me.id and i.target_id = p.id)
    and not exists (select 1 from interactions i
                    where i.actor_id = p.id and i.target_id = me.id and i.kind = 'blocked')
  order by p.embedding <=> me.embedding
  limit pool_size;
$$;

-- ── RLS ─────────────────────────────────────────────────────
alter table profiles     enable row level security;
alter table interactions enable row level security;
create policy "read active profiles" on profiles for select using (is_active);
create policy "insert own profile"   on profiles for insert with check (auth.uid() = id);
create policy "edit own profile"     on profiles for update using (auth.uid() = id);
create policy "own interactions"     on interactions for all using (auth.uid() = actor_id);

-- ── Storage: profile photos ────────────────────────────────
-- Uploaded to path "<user id>/<filename>" — the folder-name check below is
-- what enforces "you can only write into your own folder".
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── Storage: flat photos (hosts only) ──────────────────────────
insert into storage.buckets (id, name, public)
values ('flat-photos', 'flat-photos', true)
on conflict (id) do nothing;

create policy "flat photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'flat-photos');

create policy "users upload their own flat photos"
  on storage.objects for insert
  with check (bucket_id = 'flat-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users update their own flat photos"
  on storage.objects for update
  using (bucket_id = 'flat-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own flat photos"
  on storage.objects for delete
  using (bucket_id = 'flat-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── Demo/seed profiles for local testing — see seed_demo_profiles.sql ───
