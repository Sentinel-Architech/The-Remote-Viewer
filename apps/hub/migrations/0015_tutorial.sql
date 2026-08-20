-- One-time Viewer briefing. Null means the hub stays locked on the map.
alter table viewer_profiles add column if not exists tutorial_at timestamptz;
