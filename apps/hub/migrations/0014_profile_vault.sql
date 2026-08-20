-- Dedicated Viewer profile: portraits, public card extras, private docs vault
alter table viewer_profiles add column if not exists avatar_data text;
alter table viewer_profiles add column if not exists cover_data text;
alter table viewer_profiles add column if not exists location_label text not null default '';
alter table viewer_profiles add column if not exists craft text not null default '';
alter table viewer_profiles add column if not exists website text not null default '';
alter table viewer_profiles add column if not exists status_line text not null default '';
alter table viewer_profiles add column if not exists links_json text not null default '[]';

create table if not exists viewer_docs (
  id serial primary key,
  user_id text not null,
  title text not null,
  kind text not null default 'note',
  mime text not null default 'text/plain',
  body text not null default '',
  bytes int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists viewer_docs_user_idx on viewer_docs (user_id, id desc);
