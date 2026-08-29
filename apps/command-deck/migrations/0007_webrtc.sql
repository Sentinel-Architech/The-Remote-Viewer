-- WebRTC signaling roster. Unowned rendezvous only — no personal data.
create table if not exists webrtc_peers (
  room      text not null,
  peer_id   text not null,
  name      text not null default '',
  last_seen timestamptz not null default now(),
  primary key (room, peer_id)
);

create table if not exists webrtc_signals (
  id         bigserial primary key,
  room       text not null,
  to_peer    text not null,
  from_peer  text not null,
  kind       text not null,
  payload    jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists webrtc_signals_inbox
  on webrtc_signals (room, to_peer, id);
