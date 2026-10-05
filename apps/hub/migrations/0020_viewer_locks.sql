-- Viewer share codes, signup holds, and unset dust notes.
-- No seed, no passphrase, no Wi-Fi password, no mint address.

create table if not exists trv_signup_pending (
  email text primary key,
  code_hash text not null,
  code_iv text not null,
  code_cipher text not null,
  delivery text not null,
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists trv_signup_holds (
  user_id text primary key,
  email text not null,
  code_hash text not null,
  code_iv text not null,
  code_cipher text not null,
  delivery text not null,
  signature_handle text not null,
  written_down boolean not null default false,
  forms smallint,
  accepted_at timestamptz
);

create table if not exists trv_share_codes (
  code text primary key,
  owner_id text not null,
  signature_handle text not null,
  interests text not null default '',
  qr_style text not null,
  broadcast boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists trv_share_codes_owner_idx on trv_share_codes (owner_id, created_at desc);

create table if not exists trv_share_joins (
  code text not null,
  user_id text not null,
  joined_at timestamptz not null default now(),
  primary key (code, user_id)
);

create unique index if not exists trv_share_joins_user_idx on trv_share_joins (user_id);

create table if not exists trv_dust_notes (
  id text primary key,
  user_id text not null,
  code text not null,
  more_than_free boolean not null,
  amount_set boolean not null default false,
  on_chain boolean not null default false,
  created_at timestamptz not null default now()
);

alter table viewer_profiles add column if not exists grand_view_until timestamptz;
