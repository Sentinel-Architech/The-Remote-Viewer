-- The Remote Viewer — viewer nodes, native ledger, forum, defense memory
create table if not exists viewer_profiles (
  user_id text primary key,
  handle text not null unique,
  display_name text not null default '',
  bio text not null default '',
  manifesto text not null default '',
  tier text not null default 'initiate',
  native_security boolean not null default false,
  verified_at timestamptz,
  neuron_stage int not null default 0,
  xp int not null default 0,
  sentinel_health int not null default 100,
  sentinel_autonomy int not null default 0,
  pulse_radius int not null default 1,
  auto_intercept int not null default 0,
  extra_neurons int not null default 0,
  credits int not null default 500,
  referral_handle text,
  created_at timestamptz not null default now()
);
create unique index if not exists viewer_profiles_handle_idx on viewer_profiles (handle);

create table if not exists migrations_paste (
  id serial primary key,
  user_id text not null,
  source_platform text not null,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists migrations_paste_user_idx on migrations_paste (user_id);

create table if not exists trv_nfts (
  id serial primary key,
  user_id text not null,
  title text not null,
  kind text not null,
  image_data text not null,
  listed boolean not null default false,
  price_credits int not null default 0,
  minted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists trv_nfts_user_id_idx on trv_nfts (user_id);
create index if not exists trv_nfts_listed_idx on trv_nfts (listed) where listed = true;

create table if not exists nft_sales (
  id serial primary key,
  nft_id int not null,
  seller_id text not null,
  buyer_id text not null,
  amount int not null,
  fee int not null,
  created_at timestamptz not null default now()
);
create index if not exists nft_sales_seller_idx on nft_sales (seller_id);

create table if not exists forum_posts (
  id serial primary key,
  user_id text not null,
  title text not null,
  body text not null,
  nft_id int,
  created_at timestamptz not null default now()
);
create index if not exists forum_posts_created_idx on forum_posts (created_at desc);

create table if not exists defense_log (
  id serial primary key,
  user_id text not null,
  attack_type text not null,
  outcome text not null,
  xp_gain int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists defense_log_user_idx on defense_log (user_id, created_at desc);

create table if not exists moe_events (
  id serial primary key,
  user_id text not null,
  kind text not null,
  summary text not null,
  created_at timestamptz not null default now()
);
create index if not exists moe_events_user_idx on moe_events (user_id, created_at desc);
