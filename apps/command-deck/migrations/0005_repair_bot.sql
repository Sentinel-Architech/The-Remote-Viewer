-- Sentinel Repair Bot log. Unowned: public GitHub issue numbers only, no personal data.
create table if not exists repair_run (
  repo        text not null,
  number      integer not null,
  title       text not null,
  url         text not null,
  verdict     text not null,
  severity    text not null,
  summary     text not null,
  plan        text not null default '[]',
  patch       text not null default '',
  files       text not null default '[]',
  status      text not null default 'diagnosed',
  created_at  timestamptz not null default now(),
  primary key (repo, number)
);

create table if not exists repair_quota (
  hour_key  text primary key,
  count     integer not null default 0
);
