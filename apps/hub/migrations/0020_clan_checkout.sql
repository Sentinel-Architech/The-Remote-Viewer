-- Native clan / node TRV receipts. Signatures are public. Seeds are not stored.
create table if not exists clan_checkout_receipts (
  id serial primary key,
  user_id text not null,
  plan_id text not null,
  nonce text not null unique,
  credits int not null,
  wallet_pubkey text not null,
  node_pubkey text not null,
  message text not null,
  wallet_sig text not null,
  node_sig text not null,
  created_at timestamptz not null default now()
);
create index if not exists clan_checkout_user_idx on clan_checkout_receipts (user_id, created_at desc);
