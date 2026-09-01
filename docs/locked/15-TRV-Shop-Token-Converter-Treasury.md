# TRV Shop Token Converter & Treasury (Locked)

**Status:** Locked — 2026-08-16 (originator revision: exact 50/50, creator address published, zero simulation)  
**Public TRV_POOL revised:** 2026-08-31 — X Money [@Archtecht](https://x.com/Archtecht)  
**Chain (legacy SOL path):** Solana  
**Creator receive (public):** `9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG`  
**Depends on:** `05-Membership-Benefits.md`, `14-Community-Pool.md`, Identity Layer discount rules  
**Does not alter:** Vault, Destroy = Restart semantics for identity, Class A data rules

---

## 1. Purpose

The **TRV Shop Token Converter** is the commerce settlement layer for native in-app purchases (digital goods, access, NFT-related fees where applicable). It:

1. Accepts user payment on the public rail (**X Money @Archtecht**) or the legacy SOL path.
2. Applies any locked membership discounts (identity-attested).
3. Routes **every purchase** according to the treasury split below.
4. Never takes custody of user identity keys, the Community Pool admin seed, or the creator wallet seed.
5. **Zero simulation**: credits are granted only after a real, confirmed transfer. Simulation is forbidden once the first real purchase is PROVEN.

---

## 2. Supported Assets

| Asset | Role | Notes |
|-------|------|--------|
| **X Money** | Public TRV_POOL rail | Handle `@Archtecht` |
| **SOL** | Legacy settlement path | Still used by `shop-boot.js` dual-transfer |
| **Allowlisted SPL tokens** | Deferred | Not implemented until PROVEN SOL path exists |

---

## 3. Treasury Addresses & Roles

| Role | Address | Control | Public? |
|------|---------|---------|---------|
| **TRV_POOL (public)** | `@Archtecht` (X Money) | Originator | Yes |
| **Legacy Solana sink** | `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` | Originator | Implementation only |
| **Creator** | `9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG` | Originator | Yes (published 2026-08-16) |
| **User payer** | User’s own wallet / X account | User | N/A |

Identity burn does not move, claw back, or reassign any of these balances.

---

## 4. Treasury Split (Every Purchase — Proceeds After Discounts)

### 4.1 Default split (locked 2026-08-16)

| Bucket | Share | Destination |
|--------|-------|-------------|
| **Creator** | **50%** | `9XhGDthCvcDz3tLfTgXRLXx1W48fM5oQtrFTRot3yLYG` |
| **Community Pool / TRV_POOL** | **50%** | Public: `@Archtecht`. Legacy SOL sink only when the old dual-transfer path runs. |

Exact integer split on the SOL path: `creatorLamports = Math.floor(total / 2)`, remainder to sink.  
No residual. No default preference.

Prior splits (10/90, 75/25) are fully superseded.

### 4.2 Voluntary tips / donations

100 % to TRV_POOL (`@Archtecht`). Not subject to the creator share.

---

## 5. Zero-Simulation Rule

- Credits may be granted **only** after a confirmed X Money payment or `confirmTransaction` on the legacy SOL path.
- No local-only credit grant, no mock signatures, no demo success path in the public build.
- Once the first real purchase is confirmed and credits are issued from that proof, the simulation window is permanently closed.

---

## 6. User-Facing Disclosure

“TRV_POOL is @Archtecht on X Money. 50 % creator / 50 % pool. Credits granted only after confirmed payment. Zero simulation.”
