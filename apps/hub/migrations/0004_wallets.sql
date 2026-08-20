-- Per-Viewer wallets, Stripe on-ramp records, referral trials
alter table viewer_profiles add column if not exists wallet_pubkey text;
alter table viewer_profiles add column if not exists phantom_pubkey text;
alter table viewer_profiles add column if not exists sol_micro bigint not null default 0;
alter table viewer_profiles add column if not exists trial_until timestamptz;

create table if not exists referrals (
  id serial primary key,
  referrer_id text not null,
  referee_id text not null unique,
  bonus_credits int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx on referrals (referrer_id);

create table if not exists stripe_onramps (
  id serial primary key,
  user_id text not null,
  session_id text,
  usd_cents int not null,
  dest text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists stripe_onramps_user_idx on stripe_onramps (user_id, created_at desc);
