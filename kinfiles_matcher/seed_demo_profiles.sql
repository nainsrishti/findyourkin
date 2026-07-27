-- ============================================================
-- Seed demo profiles for testing discover/matching.
-- Creates 6 fake auth users + fully-scored profiles across
-- Gurgaon / Delhi / Noida so discover has real matches to show.
-- These are test data only — safe to delete later.
-- ============================================================
create extension if not exists pgcrypto;

-- ── Fake auth users (never used to log in, just satisfy the FK) ─────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', 'a1111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'demo.ananya@findyourkin.test', crypt('not-a-real-password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a2222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'demo.kabir@findyourkin.test',  crypt('not-a-real-password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a3333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'demo.meera@findyourkin.test',  crypt('not-a-real-password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a4444444-4444-4444-8444-444444444444', 'authenticated', 'authenticated', 'demo.rohan@findyourkin.test',  crypt('not-a-real-password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a5555555-5555-4555-8555-555555555555', 'authenticated', 'authenticated', 'demo.ishita@findyourkin.test', crypt('not-a-real-password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a6666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'demo.aarav@findyourkin.test',  crypt('not-a-real-password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', '')
on conflict (id) do nothing;

-- ── Matching profiles ─────────────────────────────────────────────────
insert into profiles (
  id, display_name, age, occupation, bio, city, gender, gender_pref,
  budget_band, budget_idx, move_in_day, situation, traits, answers, importance, embedding
) values
(
  'a1111111-1111-4111-8111-111111111111', 'Ananya', 26, 'Product Designer',
  'Product designer who loves quiet mornings and weekend treks. Looking for a chill, communicative flatmate.',
  'gurgaon', 'female', '{any}', '18-25k', 3, 20675, 'seeker', '{}',
  '{"sleep":"11to1","guests":"weekly","home_energy":"flexible","wfh":"hybrid","stay":"1to2yr","partner":"occasional","cleanliness":"reasonable","budget":"18-25k","conflict":"direct","situation":"seeker","locality":["dlf-phase-1","sushant-lok"],"diet":"veg","kitchen":"okay_nonveg","smoke_tolerance":"ok","smokes_indoor":false,"pet_tolerance":"ok","has_pets":false,"dealbreakers":[]}'::jsonb,
  '{}'::jsonb,
  '[0.24155090466854237,0.16103393644569491,0.24155090466854237,0.16103393644569491,0.32206787289138983,0.16103393644569491,0.32206787289138983,0.36232635700281357,0.48310180933708474,0,0,0,0,0.48310180933708474,0]'::vector(15)
),
(
  'a2222222-2222-4222-8222-222222222222', 'Kabir', 27, 'Software Engineer',
  'Backend engineer, early riser, keep things tidy. WFH most days so I like a calm home base.',
  'gurgaon', 'male', '{any}', '18-25k', 3, 20675, 'seeker', '{}',
  '{"sleep":"before11","guests":"rarely","home_energy":"solitude","wfh":"mostly","stay":"longterm","partner":"never","cleanliness":"spotless","budget":"18-25k","conflict":"direct","situation":"seeker","locality":["golf-course-road","sector-29"],"diet":"nonveg","kitchen":"okay_nonveg","smoke_tolerance":"ok","smokes_indoor":false,"pet_tolerance":"ok","has_pets":false,"dealbreakers":[]}'::jsonb,
  '{}'::jsonb,
  '[0,0,0,0.29793556908954344,0.44690335363431516,0,0.44690335363431516,0.33517751522573636,0.44690335363431516,0,0,0,0,0.44690335363431516,0]'::vector(15)
),
(
  'a3333333-3333-4333-8333-333333333333', 'Meera', 24, 'UX Researcher',
  'UX researcher, plant mom, always up for a coffee run. Prefer a clean, veg-friendly kitchen.',
  'delhi', 'female', '{any}', '12-18k', 2, 20675, 'seeker', '{}',
  '{"sleep":"11to1","guests":"weekly","home_energy":"flexible","wfh":"hybrid","stay":"1to2yr","partner":"occasional","cleanliness":"reasonable","budget":"12-18k","conflict":"hints","situation":"seeker","locality":["hauz-khas","saket"],"diet":"veg","kitchen":"veg_only","smoke_tolerance":"no_indoor","smokes_indoor":false,"pet_tolerance":"ok","has_pets":false,"dealbreakers":[]}'::jsonb,
  '{}'::jsonb,
  '[0.2508726030021272,0.16724840200141813,0.2508726030021272,0.16724840200141813,0.33449680400283627,0.16724840200141813,0.33449680400283627,0.2508726030021272,0,0.5017452060042544,0,0,0,0.5017452060042544,0]'::vector(15)
),
(
  'a4444444-4444-4444-8444-444444444444', 'Rohan', 28, 'Marketing Manager',
  'Marketing manager, night owl, love hosting. Down to find a place together with the right person.',
  'delhi', 'male', '{any}', '18-25k', 3, 20675, 'cohunt', '{}',
  '{"sleep":"after1","guests":"often","home_energy":"enjoy","wfh":"never","stay":"short","partner":"frequent","cleanliness":"messy","budget":"18-25k","conflict":"wait","situation":"cohunt","locality":["vasant-kunj","dwarka"],"diet":"nonveg","kitchen":"okay_nonveg","smoke_tolerance":"ok","smokes_indoor":true,"pet_tolerance":"ok","has_pets":false,"dealbreakers":[]}'::jsonb,
  '{}'::jsonb,
  '[0.4282983661489498,0.28553224409929984,0.4282983661489498,0,0,0.28553224409929984,0,0.32122377461171236,0,0,0.4282983661489498,0,0,0,0.4282983661489498]'::vector(15)
),
(
  'a5555555-5555-4555-8555-555555555555', 'Ishita', 25, 'Data Analyst',
  'Data analyst, love a spotless kitchen and quiet evenings with a book.',
  'noida', 'female', '{any}', '12-18k', 2, 20675, 'seeker', '{}',
  '{"sleep":"before11","guests":"rarely","home_energy":"decompress","wfh":"hybrid","stay":"longterm","partner":"never","cleanliness":"spotless","budget":"12-18k","conflict":"direct","situation":"seeker","locality":["sector-62","indirapuram"],"diet":"veg","kitchen":"veg_only","smoke_tolerance":"no_indoor","smokes_indoor":false,"pet_tolerance":"none","has_pets":false,"dealbreakers":[]}'::jsonb,
  '{}'::jsonb,
  '[0,0,0.3380020947849059,0.15022315323773594,0.4506694597132078,0,0.4506694597132078,0.2253347298566039,0.4506694597132078,0,0,0,0,0.4506694597132078,0]'::vector(15)
),
(
  'a6666666-6666-4666-8666-666666666666', 'Aarav', 26, 'Startup Founder',
  'Startup founder working from home. Sociable, easygoing, always down for a movie night.',
  'noida', 'male', '{any}', '18-25k', 3, 20675, 'seeker', '{}',
  '{"sleep":"11to1","guests":"often","home_energy":"enjoy","wfh":"always","stay":"1to2yr","partner":"occasional","cleanliness":"reasonable","budget":"18-25k","conflict":"direct","situation":"seeker","locality":["sector-18","sector-137"],"diet":"nonveg","kitchen":"okay_nonveg","smoke_tolerance":"ok","smokes_indoor":false,"pet_tolerance":"ok","has_pets":true,"dealbreakers":[]}'::jsonb,
  '{}'::jsonb,
  '[0.1998889813958309,0.26651864186110785,0.3997779627916618,0.3997779627916618,0.26651864186110785,0.13325932093055393,0.26651864186110785,0.29983347209374633,0.3997779627916618,0,0,0,0,0.3997779627916618,0]'::vector(15)
)
on conflict (id) do nothing;
