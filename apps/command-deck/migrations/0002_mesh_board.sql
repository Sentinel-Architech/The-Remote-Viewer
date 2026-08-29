-- Combined dossier standings. Unowned: identified by local Viewer pubkey only.
create table if not exists mesh_board (
  pubkey      text primary key,
  short       text not null,
  rank_level  integer not null,
  rank_title  text not null,
  os_title    text not null,
  learned     integer not null default 0,
  xp          integer not null default 0,
  seizes      integer not null default 0,
  healed      integer not null default 0,
  cleared     integer not null default 0,
  watches     integer not null default 0,
  score       integer not null default 0,
  posted_at   timestamptz not null default now()
);

create index if not exists mesh_board_score_idx on mesh_board (score desc, seizes desc, posted_at asc);
