-- Real-time pulse leadership. Scope is local / national / globe. No personal names.
create table if not exists mesh_pulse (
  pubkey       text not null,
  short        text not null,
  scope        text not null,
  region       text not null,
  pulse_id     integer not null,
  pulse_score  integer not null default 0,
  seizes       integer not null default 0,
  posted_at    timestamptz not null default now(),
  primary key (pubkey, scope, pulse_id)
);

create index if not exists mesh_pulse_live_idx
  on mesh_pulse (scope, region, pulse_id, pulse_score desc, posted_at asc);
