-- 48-hour self-serve Verified trial for outside viewership (organic / DApp).
-- Distinct from referral ad-free trial (trial_until). One paid trial per node.
alter table viewer_profiles add column if not exists paid_trial_until timestamptz;
alter table viewer_profiles add column if not exists paid_trial_plan text;
alter table viewer_profiles add column if not exists paid_trial_used boolean not null default false;

create index if not exists viewer_profiles_public_idx
  on viewer_profiles (is_public, created_at desc)
  where is_public = true;
