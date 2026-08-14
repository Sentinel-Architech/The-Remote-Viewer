# TRV status — 2026-08-14

**SCAFFOLD.** No production security claims. No audit. No mainnet.

## Track A — Solana (`solana/`)

| Item | State |
|------|--------|
| Program | initialize, **set_vote_mint**, register_node, **deactivate_node**, propose, vote, **vote_with_token**, execute_if_threshold |
| Accounts | GovernanceConfig (+ vote_mint), Proposal, VoteRecord, Node |
| Program id | **PLACEHOLDER** |
| Tests | Manual `vote()` path covered; SPL path needs mint fixture on build host |
| CI | `.github/workflows/solana.yml` |
| Devnet/mainnet | **Not deployed** |

**Vote weight:** `vote_with_token` uses SPL token account amount (mint must match config). Manual `vote(weight)` remains for scaffold tests.

**Nodes:** register / deactivate. Unlimited-comms reward still product/off-chain.

## Parallel — EVM (`contracts/`)

Hardened Governor scaffold; not Track A.

## Mobile

**PARKED.**

## Path B founders: **0**

## Locked values

`docs/locked/` 15–21.
