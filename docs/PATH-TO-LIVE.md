# Path to live (get there)

Client policy: [`locked/CLIENT-SURFACE.md`](locked/CLIENT-SURFACE.md).  
CI blocker: [`CI-BLOCKER.md`](CI-BLOCKER.md).

## Phase 0 — Compile

**Status: BLOCKED** — SBF Cargo ~1.84 vs crates.io `edition2024`.

- [ ] `anchor build` green (build host or newer platform-tools)
- [ ] Commit `solana/Cargo.lock` from green run
- [ ] Artifacts: `.so` + IDL

Scaffold: Anchor **0.32.1**.

## Phase 1 — Devnet entitlement

- [ ] Deploy + `initialize` → `grant_subscription` → `refresh_entitlement`
- [ ] `unlimited_comms == true` on test Viewer

## Phase 2 — Money rails

- [ ] Collect **$96/year**
- [ ] Ops → `grant_subscription`
- [ ] Creator **95/5** settlement ≤7 days

## Phase 3 — Surface (any capable phone)

Graphene is a **tier**, not a gate. See CLIENT-SURFACE.

- [ ] **Web/PWA baseline** — any modern phone browser can enter
- [ ] **Android app** with capability detection (camera/mic/storage → T0/T1)
- [ ] Signal tiers by device potential (weaker signal OK on lower tiers)
- [ ] Graphene / Termux paths as **T2** enhancements (optical, local AI)
- [ ] Integrity report entry (all tiers that can ship UI)
- [ ] Brand assets in `branding/`
- [ ] iOS only when E2E rules are met without silent compromise

## Phase 4 — Parity pressure

- [ ] Pool PDA + spend
- [ ] Viewer mail Phase A
- [ ] Free-tier abuse limits
- [ ] Node path → unlimited comms (any device that can host)

## Phase 5 — Only then

- [ ] Audit discussion
- [ ] Mainnet decision
- [ ] PROVEN entitlement in REALITY.md

**Do not skip to Phase 5.**
