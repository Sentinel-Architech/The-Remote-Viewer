# Path to live (get there)

Policy: competitive / pricing locked. Execution order below.

## Phase 0 — Compile

**Status: BLOCKED** — see [`CI-BLOCKER.md`](CI-BLOCKER.md).

SBF platform-tools Cargo (~1.84) cannot parse crates.io packages that require `edition2024`. Host Rust 1.85 does not replace nested SBF Cargo. Pin loops stopped 2026-08-14.

- [ ] Solana Anchor CI: **`anchor build` green** (needs build host or newer platform-tools)
- [ ] Commit `solana/Cargo.lock` from green run
- [ ] Artifacts: `.so` + IDL from CI

Scaffold: Anchor **0.32.1**, program present, not deployed.

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
- [ ] Ops → `grant_subscription`
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
