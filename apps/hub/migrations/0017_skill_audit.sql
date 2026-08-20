-- Skill audit: doctrine + edge + live helm scores per Sentinel OS agent.
alter table viewer_profiles add column if not exists last_skill_audit_at timestamptz;
alter table viewer_profiles add column if not exists last_skill_audit_score int;

create table if not exists skill_audit_runs (
  id serial primary key,
  user_id text not null,
  helm text not null,
  overall int not null,
  created_at timestamptz not null default now()
);
create index if not exists skill_audit_runs_user_idx on skill_audit_runs (user_id, created_at desc);

create table if not exists skill_audit_results (
  id serial primary key,
  run_id int not null references skill_audit_runs(id) on delete cascade,
  user_id text not null,
  agent_id text not null,
  skill_id text not null,
  score int not null,
  par int not null,
  verdict text not null,
  doctrine int not null,
  edge int,
  live int,
  evidence text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists skill_audit_results_run_idx on skill_audit_results (run_id);
create index if not exists skill_audit_results_user_idx on skill_audit_results (user_id, created_at desc);
