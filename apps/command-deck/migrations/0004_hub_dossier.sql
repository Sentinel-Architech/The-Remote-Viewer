-- One Remote Viewer HUB. Dossier is keyed by sovereign pubkey (Ed25519).
-- Pair tickets are short-lived wraps of the seed; never store the seed itself.
create table if not exists hub_dossier (
  pubkey      text primary key,
  seq         bigint not null default 0,
  xp          integer not null default 0,
  seizes      integer not null default 0,
  healed      integer not null default 0,
  cleared     integer not null default 0,
  watches     integer not null default 0,
  learned     text not null default '{}',
  sig         text not null default '',
  updated_at  timestamptz not null default now()
);

create table if not exists hub_pair (
  pin         text primary key,
  wrap        text not null,
  pubkey      text not null,
  expires_at  timestamptz not null
);

create index if not exists hub_pair_exp_idx on hub_pair (expires_at);
