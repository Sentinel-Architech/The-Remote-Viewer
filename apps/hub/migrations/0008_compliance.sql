alter table viewer_profiles add column if not exists age_ok boolean not null default false;
alter table viewer_profiles add column if not exists ofac_ok boolean not null default false;
alter table viewer_profiles add column if not exists ui_theme text;

create table if not exists ncii_flags (
  id serial primary key,
  post_id int,
  reporter_address text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table forum_posts add column if not exists ncii_sealed boolean not null default false;
