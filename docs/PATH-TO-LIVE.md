# Path to live (get there)

Policy already aims to win the fee sheet ([COMPETITIVE.md](COMPETITIVE.md)). This is the **execution order**.

## Phase 0 — Compile (now)

- [ ] Solana Anchor CI: **`anchor build` green**
- [ ] Commit `solana/Cargo.lock` from green run
- [ ] Artifacts: `.so` + IDL uploaded from CI

## Phase 1 — Devnet entitlement

- [ ] Build host: `anchor keys list` → real `declare_id!` + `Anchor.toml`
- [ ] `anchor test` hard-green (no soft fail)
- [ ] Deploy `trv_governance` to **devnet**
- [ ] Manual: `initialize` → `grant_subscription` → `refresh_entitlement`
- [ ] Multisig plan for authority ([AUTHORITY.md](AUTHORITY.md))

## Phase 2 — Money rails

- [ ] Collect **$96/year** (USDC or card) off-chain
- [ ] Ops calls `grant_subscription` ([PAYMENTS.md](PAYMENTS.md))
- [ ] Creator digital sale path with **95/5** accounting
- [ ] Settlement ≤7 days visible to creator

## Phase 3 — Surface

- [ ] Client path that works on Graphene (no Expo-Go dependency)
- [ ] Signal tiers enforced in discovery
- [ ] Integrity report entry point ([locked/SAFETY.md](locked/SAFETY.md))
- [ ] Brand assets in `branding/`

## Phase 4 — Parity pressure

- [ ] Pool PDA + governed spend
- [ ] Viewer mail Phase A (domain + alias)
- [ ] Secondary NFT royalty on-chain if minting live
- [ ] Load / abuse limits on free tier

## Phase 5 — Only then

- [ ] External audit discussion
- [ ] Mainnet deploy decision
- [ ] Public “PROVEN” entitlement claims in REALITY.md

**Do not skip to Phase 5.** Winning docs without Phase 0–2 is cosplay.
