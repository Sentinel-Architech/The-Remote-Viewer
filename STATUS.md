# TRV status — 2026-08-14

**SCAFFOLD.** No production security claims. No audit. No mainnet.

## Track A — Solana (`solana/`)

| Instruction | Role |
|-------------|------|
| initialize / set_vote_mint | Config + SPL vote mint |
| register_node / deactivate_node | Permanent node operator |
| **grant_subscription** | Authority sets `expires_at` (payment off-chain) |
| **refresh_entitlement** | `unlimited_comms` = active node **OR** unexpired sub |
| propose / vote / vote_with_token | Governance |
| execute_if_threshold | Pass flag if threshold met |

Accounts: Config, Proposal, VoteRecord, Node, **Subscription**, **Entitlement**.

Program id **PLACEHOLDER**. Not deployed. CI present.

## Parallel — EVM

Not Track A.

## Mobile — PARKED

## Path B founders: **0**

## Locked values — `docs/locked/` 15–21
