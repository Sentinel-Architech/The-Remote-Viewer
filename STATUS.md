# TRV status — 2026-08-14

**SCAFFOLD.** No production security claims. No audit. No mainnet.

## Track A — Solana (`solana/`)

| Item | State |
|------|--------|
| Program | initialize, propose, vote, execute_if_threshold |
| Program id | **PLACEHOLDER** — replace via `anchor keys list` |
| Tests | `tests/trv-governance.ts` (needs build host / CI) |
| CI | `.github/workflows/solana.yml` |
| Devnet/mainnet | **Not deployed** |

## Parallel — EVM (`contracts/`)

| Item | State |
|------|--------|
| TRVVotes + Governor + Timelock | Hardened threshold 1 ether |
| Tests | 9 passed on Pixel Anvil |
| CI | `.github/workflows/contracts-foundry.yml` |
| Role | Learning / parallel only — **not** Track A |

## Mobile (`apps/mobile/`)

Runtime **PARKED** (Expo Go no-go on GrapheneOS). Code remains in repo.

## Operator (Pixel 7)

- SSH ed25519 key generated; must be added to GitHub after password recovery
- Until pull: **GitHub remote is source of truth**

## Path B founders: **0**

## Locked values

`docs/locked/` 15–21 (Freedom, deepfakes, conduct, leans, We the People, condense, cannabis).
