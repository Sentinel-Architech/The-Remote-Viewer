-- Signed-in X identities on the mesh. Writes are scoped to user_id.
create table if not exists mesh_social (
  user_id  text primary key,
  handle   text not null,
  pubkey   text not null,
  avatar   text,
  seen_at  timestamptz not null default now()
);

create index if not exists mesh_social_seen_idx on mesh_social (seen_at desc);
create index if not exists mesh_social_pubkey_idx on mesh_social (pubkey);
