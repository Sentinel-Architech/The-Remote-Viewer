alter table viewer_profiles add column if not exists honeypot_armed boolean not null default false;

create table if not exists honeypot_events (
  id serial primary key,
  user_id text,
  lure text not null,
  kind text not null,
  outcome text not null default 'blocked',
  lesson text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists honeypot_events_user_idx on honeypot_events (user_id, id desc);
