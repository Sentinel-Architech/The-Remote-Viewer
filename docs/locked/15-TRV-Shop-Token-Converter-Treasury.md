# TRV Shop Token Converter & Treasury (Locked)

**Status:** Locked — 2026-08-16 (originator revision: exact 50/50, creator address published, zero simulation)  
**Chain:** Solana  
**Community Pool (public):** `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt`  
**Creator receive (public):** `9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG`  
**Depends on:** `05-Membership-Benefits.md`, `14-Community-Pool.md`, Identity Layer discount rules  
**Does not alter:** Vault, Destroy = Restart semantics for identity, Class A data rules

---

## 1. Purpose

The **TRV Shop Token Converter** is the commerce settlement layer for native in-app purchases (digital goods, access, NFT-related fees where applicable). It:

1. Accepts user payment in SOL (primary path).
2. Applies any locked membership discounts (identity-attested).
3. Routes **every purchase** according to the treasury split below.
4. Never takes custody of user identity keys, the Community Pool admin seed, or the creator wallet seed.
5. **Zero simulation**: credits are granted only after a real, confirmed on-chain transfer. Simulation is forbidden once the first real purchase is PROVEN.

---

## 2. Supported Assets

| Asset | Role | Notes |
|-------|------|--------|
| **SOL** | Primary and currently only settlement asset | Live path |
| **Allowlisted SPL tokens** | Deferred | Not implemented until PROVEN SOL path exists |

---

## 3. Treasury Addresses & Roles

| Role | Address | Control | Public? |
|------|---------|---------|---------|
| **Community Pool** | `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` | Originator | Yes |
| **Creator** | `9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG` | Originator | Yes (published 2026-08-16) |
| **User payer** | User’s own wallet | User | N/A |

Identity burn does not move, claw back, or reassign any of these balances.

---

## 4. Treasury Split (Every Purchase — Proceeds After Discounts)

### 4.1 Default split (locked 2026-08-16)

| Bucket | Share | Destination |
|--------|-------|-------------|
| **Creator** | **50%** | `9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG` |
| **Community Pool** | **50%** | `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` |

Exact integer split: `creatorLamports = Math.floor(total / 2)`, remainder to pool.  
No residual. No default preference.

Prior splits (10/90, 75/25) are fully superseded.

### 4.2 Voluntary tips / donations

100 % to Community Pool. Not subject to the creator share.

---

## 5. Zero-Simulation Rule

- Credits may be granted **only** after `confirmTransaction` succeeds for a dual-transfer that matches the 50/50 rule.
- No local-only credit grant, no mock signatures, no demo success path in the public build.
- Once the first real mainnet purchase is confirmed and credits are issued from that signature, the simulation window is permanently closed.

---

## 6. User-Facing Disclosure

“50 % creator / 50 % Community Pool — SOL only. Credits granted only after confirmed on-chain transfer. Zero simulation.”
