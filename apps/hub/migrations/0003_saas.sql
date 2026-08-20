-- SaaS: People vs Company editions, native TRV credit conversion, invoices, orgs
alter table viewer_profiles add column if not exists edition text not null default 'people';
alter table viewer_profiles add column if not exists plan_id text not null default 'initiate';
alter table viewer_profiles add column if not exists plan_renews_at timestamptz;
alter table viewer_profiles add column if not exists org_id int;
alter table viewer_profiles add column if not exists billing_interval text not null default 'month';

create table if not exists trv_orgs (
  id serial primary key,
  name text not null,
  slug text not null unique,
  owner_id text not null,
  plan_id text not null default 'squad',
  seats int not null default 5,
  created_at timestamptz not null default now()
);
create index if not exists trv_orgs_owner_idx on trv_orgs (owner_id);

create table if not exists org_members (
  org_id int not null references trv_orgs(id) on delete cascade,
  user_id text not null,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists org_members_user_idx on org_members (user_id);

create table if not exists saas_invoices (
  id serial primary key,
  user_id text not null,
  org_id int,
  plan_id text not null,
  usd_cents int not null,
  credits int not null,
  kind text not null,
  memo text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists saas_invoices_user_idx on saas_invoices (user_id, created_at desc);

create table if not exists credit_ledger (
  id serial primary key,
  user_id text not null,
  usd_cents int not null,
  credits int not null,
  rail text not null,
  created_at timestamptz not null default now()
);
create index if not exists credit_ledger_user_idx on credit_ledger (user_id, created_at desc);
