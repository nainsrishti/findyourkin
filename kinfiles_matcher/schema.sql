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

-- ── Stage 1: coarse hard filters + ANN shortlist, in Postgres ───────────
-- Cheap high-selectivity cuts here (city, budget, gender, move-in, situation,
-- already-seen). The fiddly asymmetric ones (diet/kitchen, smoking, pets,
-- dealbreakers) are re-checked exactly in TypeScript — SQL just shrinks 100k→200.
create or replace function candidate_pool(viewer uuid, pool_size int default 200)
returns table (
  id uuid, answers jsonb, importance jsonb, traits text[],
  city text, gender text, gender_pref text[], budget_band text,
  situation text, move_in_day int, ann_distance real,
  display_name text, age smallint, occupation text, bio text, photo_url text
)
language sql stable as $$
  with me as (select * from profiles where id = viewer)
  select p.id, p.answers, p.importance, p.traits,
         p.city, p.gender, p.gender_pref, p.budget_band,
         p.situation, p.move_in_day,
         (p.embedding <=> me.embedding)::real as ann_distance,
         p.display_name, p.age, p.occupation, p.bio, p.photo_url
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
