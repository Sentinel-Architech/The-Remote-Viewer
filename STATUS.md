# TRV status — 2026-08-14

**SCAFFOLD.** No production security claims. No audit. No mainnet.

## Track A — Solana (`solana/`)

| Item | State |
|------|--------|
| Program | initialize, **register_node**, propose, **open vote** (VoteRecord), execute_if_threshold |
| Accounts | GovernanceConfig, Proposal, **VoteRecord**, **Node** |
| Program id | **PLACEHOLDER** — replace via `anchor keys list` |
| Tests | `tests/trv-governance.ts` (needs build host / CI) |
| CI | `.github/workflows/solana.yml` |
| Devnet/mainnet | **Not deployed** |
| Notes | Vote weight still caller-supplied. SPL / stake snapshot later. Node → unlimited-comms is product/off-chain later. |

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

- Local clone has solana scaffold; remote is source of truth for pushes from this side
- Phone push auth parked (no further tokens/keys)

## Path B founders: **0**

## Locked values

`docs/locked/` 15–21 (Freedom, deepfakes, conduct, leans, We the People, condense, cannabis).
