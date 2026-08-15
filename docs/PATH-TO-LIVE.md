# Path to live

Locks: [`LOCKED-INDEX.md`](LOCKED-INDEX.md) · Client: [`locked/CLIENT-SURFACE.md`](locked/CLIENT-SURFACE.md) · Caps: [`locked/ANDROID-CAPABILITIES.md`](locked/ANDROID-CAPABILITIES.md)

## Phase 0 — Compile

**BLOCKED only on toolchain** ([CI-BLOCKER.md](CI-BLOCKER.md)) — product rules are not blocked.

- [ ] `anchor build` green (host with platform-tools Cargo ≥ 1.85)
- [ ] Commit `solana/Cargo.lock`
- [ ] CI artifacts: `.so` + IDL

## Phase 1 — Devnet entitlement

- [ ] Deploy + initialize + grant + refresh
- [ ] `unlimited_comms == true` on test Viewer
- [ ] Practice authority transfer on devnet

## Phase 2 — Money rails

- [ ] Collect **$96/year**
- [ ] Ops → `grant_subscription`
- [ ] Creator **95/5** settlement ≤7 days (0% platform)

## Phase 3 — Surface (strength without gate)

- [ ] **Web/PWA** — any modern phone enters
- [ ] **Android** shell + `clients/android-cap` `mapTier()`
- [ ] Honest signal by tier
- [ ] Graphene **T2** paths as upgrade
- [ ] Integrity UI on every tier that ships UI
- [ ] Brand: Sentinel logo + Remote Viewer hero
- [ ] iOS only under full E2E rules

## Phase 4 — Network pressure

- [ ] Pool PDA + governed spend
- [ ] Viewer mail Phase A (TRV domain plan)
- [ ] Free-tier abuse limits
- [ ] Node → unlimited comms (chain-verified)

## Phase 5 — Mainnet gate

- [ ] Audit discussion
- [ ] Mainnet decision
- [ ] PROVEN entitlement line in REALITY.md

**No skipping to Phase 5.**
