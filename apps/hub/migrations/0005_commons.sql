-- Follows, adult unlocks, live, shop, presence, messages
alter table viewer_profiles add column if not exists is_public boolean not null default true;
alter table viewer_profiles add column if not exists radius_opt_in boolean not null default false;
alter table viewer_profiles add column if not exists lat double precision;
alter table viewer_profiles add column if not exists lng double precision;
alter table viewer_profiles add column if not exists watch_radius_mi int not null default 100;
alter table viewer_profiles add column if not exists shop_frame text;
alter table viewer_profiles add column if not exists shop_title text;
alter table viewer_profiles add column if not exists shop_chrome text;

alter table forum_posts add column if not exists rating text not null default 'standard';
alter table forum_posts add column if not exists price_credits int not null default 0;

create table if not exists follows (
  follower_id text not null,
  followee_id text not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);
create index if not exists follows_followee_idx on follows (followee_id);

create table if not exists content_unlocks (
  user_id text not null,
  post_id int not null,
  credits_paid int not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists shop_purchases (
  user_id text not null,
  item_id text not null,
  credits_paid int not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists live_sessions (
  id serial primary key,
  user_id text not null,
  title text not null,
  kind text not null,
  rating text not null default 'standard',
  price_credits int not null default 0,
  duration_min int not null,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  last_frame text,
  active boolean not null default true
);
create index if not exists live_sessions_active_idx on live_sessions (active, ends_at);

create table if not exists live_unlocks (
  user_id text not null,
  live_id int not null,
  credits_paid int not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, live_id)
);

create table if not exists messages (
  id serial primary key,
  from_id text not null,
  to_id text not null,
  kind text not null default 'text',
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_thread_idx on messages (from_id, to_id, id desc);
