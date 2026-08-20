alter table trv_nfts add column if not exists inspiration_data text;
alter table trv_nfts add column if not exists bundle_price int not null default 0;
alter table trv_nfts add column if not exists media_ref text;
alter table trv_nfts add column if not exists duration_sec int not null default 0;

alter table forum_posts add column if not exists media_kind text not null default 'text';
alter table forum_posts add column if not exists media_ref text;
alter table forum_posts add column if not exists duration_sec int not null default 0;

create table if not exists forum_comments (
  id serial primary key,
  post_id int not null,
  user_id text not null,
  body text not null default '',
  media_kind text not null default 'text',
  media_ref text,
  created_at timestamptz not null default now()
);
create index if not exists forum_comments_post_idx on forum_comments (post_id, id);

create table if not exists viewership (
  follower_id text not null,
  creator_id text not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, creator_id)
);

create table if not exists viewer_clips (
  id serial primary key,
  user_id text not null,
  title text not null,
  media_ref text not null,
  poster_data text,
  duration_sec int not null,
  created_at timestamptz not null default now()
);
create index if not exists viewer_clips_user_idx on viewer_clips (user_id, id desc);
