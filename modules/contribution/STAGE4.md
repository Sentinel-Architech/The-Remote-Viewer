# Stage 4 — Commitments & Claims (boundaries)

## What exists now

| Tool | Meaning |
|------|---------|
| `merkle-tip.sh` | Offline commitment to tip sha + event count |
| `claim.sh` | Local AR contribution claim JSON |

These are **device-local**. They do not talk to Solana, Ethereum, or any RPC.

## What “Merkle” means here today

The ledger is an **append-only hash chain** (Stage 2). The tip `sha` is the commitment root for the current history. A full binary Merkle tree over batches can replace this later without changing the claim shape (`tip_sha` / `commit`).

## AR claim semantics

- Utility / contribution attestation for *your* records
- **Not** an investment contract
- **Not** a deposit
- **Not** a mint
- `chain` and `txid` stay `null` until you deliberately add a publisher

See root `TOKENOMICS.md`.

## Optional L1 later (not implemented)

If you ever publish:

1. Export redacted summary (Stage 3) + tip commitment
2. Sign offline with device key
3. Submit only the commitment hash + metadata you accept as public
4. Keep events and secrets on device

Chain choice (Solana or otherwise) is a **deployment decision**, not a core dependency. Core remains optical + local ledger.

## Acceptance

Stage 4 scaffold is honest when:

- Claims refuse to build if `verify.sh` fails
- No RPC endpoints in these scripts
- Docs do not say “minted” or “on-chain” for local files
