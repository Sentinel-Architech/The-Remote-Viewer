# Path to live (get there)

Policy: [COMPETITIVE.md](COMPETITIVE.md). Execution order below.

## Phase 0 — Compile (now)

- [ ] Solana Anchor CI: **`anchor build` green**
- [ ] Commit `solana/Cargo.lock` from green run
- [ ] Artifacts: `.so` + IDL from CI

## Phase 1 — Devnet entitlement

Runbook: [`solana/DEVNET.md`](../solana/DEVNET.md)  
Smoke script: [`solana/scripts/smoke-entitlement.ts`](../solana/scripts/smoke-entitlement.ts)

- [ ] `anchor keys list` → real program id
- [ ] Deploy to **devnet**
- [ ] `initialize` → `grant_subscription` → `refresh_entitlement`
- [ ] `unlimited_comms == true` on test Viewer
- [ ] Practice `transfer_authority` on devnet

## Phase 2 — Money rails

- [ ] Collect **$96/year**
- [ ] Ops → `grant_subscription` ([PAYMENTS.md](PAYMENTS.md))
- [ ] Creator **95/5** settlement ≤7 days

## Phase 3 — Surface

- [ ] Graphene-capable client
- [ ] Signal tiers
- [ ] Integrity report entry
- [ ] Brand assets in `branding/`

## Phase 4 — Parity pressure

- [ ] Pool PDA + spend
- [ ] Viewer mail Phase A
- [ ] Free-tier abuse limits

## Phase 5 — Only then

- [ ] Audit discussion
- [ ] Mainnet decision
- [ ] PROVEN entitlement in REALITY.md

**Do not skip to Phase 5.**
