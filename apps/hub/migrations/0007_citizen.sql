-- US Citizen lock: one-way hash only. No ID image is stored on the server.
alter table viewer_profiles add column if not exists citizen_at timestamptz;
alter table viewer_profiles add column if not exists citizen_hash text;
alter table viewer_profiles add column if not exists id_type text;
alter table viewer_profiles add column if not exists id_state text;
alter table viewer_profiles add column if not exists liveness_score int;

create unique index if not exists viewer_profiles_citizen_hash_idx
  on viewer_profiles (citizen_hash)
  where citizen_hash is not null;
