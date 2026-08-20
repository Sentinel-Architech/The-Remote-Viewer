alter table viewer_profiles add column if not exists last_watch_on date;
alter table viewer_profiles add column if not exists watch_streak int not null default 0;

create table if not exists watch_claims (
  user_id text not null,
  day date not null,
  credits int not null,
  streak int not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);
