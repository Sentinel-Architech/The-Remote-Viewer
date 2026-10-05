-- Passkey credentials for the native WebAuthn flow.
-- The public key and credential id are stored. No biometric template is stored.
-- A seed phrase is not a column.

create table if not exists viewer_passkey (
  id text primary key,
  user_id text not null references "user" ("id") on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  counter integer not null default 0,
  created_at timestamptz not null default current_timestamp
);

create index if not exists viewer_passkey_user_id_idx on viewer_passkey (user_id);
