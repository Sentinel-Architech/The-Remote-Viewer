# TRV status — 2026-08-14

**SCAFFOLD.** No production security claims. No audit. No mainnet.

## Track A — Solana (`solana/`)

| Item | State |
|------|--------|
| Instruction surface | Complete for scaffold — see `solana/PROGRAM.md` |
| Tests | Written; **run on build host / CI only** |
| Program id | Scaffold pubkey (replace via `anchor keys list` before deploy) |
| Toolchain target | **Anchor 0.30.1 + Solana 1.18.26 + Rust 1.79** (official matrix) |
| CI | Aligned off Solana 2.0 mismatch; verify latest Actions run |
| Deploy | Not on devnet |
| Pixel | Source readable; **no Anchor build** |

## Parallel — EVM (`contracts/`)

| Item | State |
|------|--------|
| Governor + TRVVotes + Timelock | Hardened threshold 1 ether |
| Tests | **9/9 PASS on Pixel Anvil** (2026-08-14) |
| Role | Learning / parallel — not Track A |

## Monetization policy

See `docs/VALUE.md`.

- Unlimited human comms: **yearly sub ∨ active permanent node**
- All tiers can go live; lower tier = **weaker signal**
- Creator digital sales: **95% / 5%** community pool
- TRV-minted NFT sales: **90% / 10%** community pool
- Platform fee: **0%**

## Community pool

Spec: `docs/POOL-GOVERNANCE.md` — via `trv_governance`, integer `u64` + bps, phased vote/timelock. Not implemented in program yet.

## Safety (locked)

See `docs/locked/SAFETY.md`.

- CSAM (real or generative): zero tolerance → remove, ban, report authorities
- **Integrity report**: anonymous peer-facing report path
- **Area bulletin**: opt-in, official registry data only, coarse region, **not simulated**, no exact address
- Neutral UI names; accurate internal categories

## Mobile

**PARKED** (Expo Go no-go on GrapheneOS).

## Operator

See `docs/PIXEL-OPERATOR.md`.

## Path B founders: **0**

## Locked values

`docs/locked/` including SAFETY.md.
