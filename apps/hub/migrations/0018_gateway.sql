-- Token Gateway v0 — SIM teaching ledger. Not mainnet. Not cash.
-- Pivot is gateway_drops.status = spent. Do not unspend after pivot.

create table if not exists gateway_drops (
  drop_id      text primary key,
  region       text not null default 'sim',
  lat          double precision not null,
  lon          double precision not null,
  radius_m     int not null default 40,
  amount       int not null default 1 check (amount > 0),
  exp          timestamptz not null,
  status       text not null default 'open'
               check (status in ('open', 'reserved', 'spent', 'expired')),
  reserved_by  text,
  reserved_exp timestamptz,
  spent_by     text,
  spent_at     timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists gateway_drops_status_exp_idx
  on gateway_drops (status, exp);

create table if not exists gateway_challenges (
  id           text primary key,
  user_id      text not null,
  drop_id      text not null references gateway_drops (drop_id),
  exp          timestamptz not null,
  consumed_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists gateway_challenges_user_idx
  on gateway_challenges (user_id, created_at desc);

create table if not exists gateway_seizes (
  drop_id      text primary key references gateway_drops (drop_id),
  user_id      text not null,
  nonce        text not null unique,
  challenge    text not null,
  lat_bucket   int not null,
  lon_bucket   int not null,
  sig          text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists gateway_seizes_user_idx
  on gateway_seizes (user_id, created_at desc);

create table if not exists gateway_ledger (
  id           bigserial primary key,
  user_id      text not null,
  drop_id      text not null unique,
  delta        int not null,
  reason       text not null,
  created_at   timestamptz not null default now()
);
create index if not exists gateway_ledger_user_idx
  on gateway_ledger (user_id, created_at desc);

create table if not exists gateway_outbox (
  id           bigserial primary key,
  topic        text not null,
  drop_id      text not null unique,
  user_id      text not null,
  payload      text not null default '',
  status       text not null default 'pending'
               check (status in ('pending', 'sent', 'dead')),
  attempts     int not null default 0,
  last_error   text,
  created_at   timestamptz not null default now(),
  sent_at      timestamptz
);
