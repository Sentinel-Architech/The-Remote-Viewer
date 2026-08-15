# Devnet runbook (Phase 1)

**Only after** `anchor build` is green on CI and you have a **build host** (not Termux).

## 1. Real program id

```bash
cd solana
anchor keys list
# Copy the pubkey for trv_governance
```

Update **both**:

- `programs/trv_governance/src/lib.rs` → `declare_id!("...")`
- `Anchor.toml` → `[programs.localnet]` and `[programs.devnet]`

Commit. Rebuild.

## 2. Cluster

```bash
solana config set --url https://api.devnet.solana.com
solana-keygen new -o ~/.config/solana/devnet.json   # if needed
solana airdrop 2 --keypair ~/.config/solana/devnet.json
```

Point `Anchor.toml` `[provider] wallet` at that keypair for deploy.

## 3. Deploy

```bash
anchor build
anchor deploy --provider.cluster devnet
```

Save program id + tx signature in `docs/public/COMMAND-LOG.md` (or STATUS).

## 4. Smoke (authority = deployer)

Order:

1. `initialize(threshold)`  
2. `register_node` (optional)  
3. `grant_subscription(expires_at)` for a test Viewer  
4. `refresh_entitlement`  
5. Read `Entitlement.unlimited_comms == true`  

Use `anchor test` against local validator first; then a small TS script against devnet.

## 5. Authority hygiene

- Deployer key ≠ long-term god key  
- Practice `transfer_authority` to a second key or multisig on **devnet**  
- See `docs/AUTHORITY.md`  

## 6. Do not

- Mainnet  
- Commit keypairs  
- Claim PROVEN entitlement in REALITY.md until this runbook has been executed on a machine you control  
