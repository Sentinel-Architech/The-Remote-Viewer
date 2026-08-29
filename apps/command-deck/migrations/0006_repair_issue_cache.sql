-- Public GitHub issue cache. Unowned: issue numbers and titles only.
create table if not exists repair_issue (
  repo        text not null,
  number      integer not null,
  title       text not null,
  body        text not null default '',
  url         text not null,
  labels      text not null default '[]',
  updated     text not null,
  fetched_at  timestamptz not null default now(),
  primary key (repo, number)
);
