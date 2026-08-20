alter table viewer_profiles add column if not exists hydra_address text;
alter table viewer_profiles add column if not exists federated_opt_in boolean not null default false;

create table if not exists hydra_reports (
  id serial primary key,
  reporter_address text not null,
  category text not null,
  summary text not null,
  evidence_hash text,
  include_coords boolean not null default false,
  lat double precision,
  lng double precision,
  region_hint text,
  status text not null default 'sealed',
  created_at timestamptz not null default now()
);
create index if not exists hydra_reports_addr_idx on hydra_reports (reporter_address, created_at desc);

create table if not exists hydra_receipts (
  user_id text not null,
  report_id int not null,
  created_at timestamptz not null default now(),
  primary key (user_id, report_id)
);

create table if not exists sentinel_memory (
  id serial primary key,
  user_id text not null,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists sentinel_memory_user_idx on sentinel_memory (user_id, id desc);

create table if not exists sentinel_lessons (
  id serial primary key,
  pattern text not null,
  counsel text not null,
  times int not null default 1,
  created_at timestamptz not null default now()
);
