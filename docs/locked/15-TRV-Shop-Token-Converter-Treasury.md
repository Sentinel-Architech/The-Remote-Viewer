# TRV Shop Token Converter & Treasury (Locked)

**Status:** Locked — July 25, 2026 (split revised same day)  
**Chain:** Solana  
**Community Pool:** `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` (Phantom / single admin)  
**Depends on:** `05-Membership-Benefits.md`, `14-Community-Pool.md`, Identity Layer discount rules  
**Does not alter:** Vault, Destroy = Restart semantics for identity, Class A data rules

---

## 1. Purpose

The **TRV Shop Token Converter** is the commerce settlement layer for native in-app purchases (digital goods, access, NFT-related fees where applicable). It:

1. Accepts user payment in supported **Solana assets** (SOL and allowlisted SPL tokens).
2. Converts / prices those assets into a **shop settlement unit** for the cart.
3. Applies **locked membership discounts** (identity-attested).
4. Routes proceeds according to the **treasury split** below — including the mandatory Community Pool share.
5. Never takes custody of user identity keys or the Community Pool admin seed.

---

## 2. Supported Assets (Converter Input)

| Asset | Role | Notes |
|-------|------|--------|
| **SOL** | Primary settlement asset | Default path |
| **Allowlisted SPL tokens** | Optional alternate tender | Only tokens explicitly enabled in shop config; unknown tokens rejected |
| Fiat on-ramps | Out of scope for this document unless added later | If added, must still settle into Solana routing rules or a separate locked policy |

**Converter behavior**

- Display price in shop unit (e.g. USD-equivalent or SOL-denominated list price — product config).
- At checkout, compute required SOL (or SPL) amount using a **documented oracle or fixed rate source** (implementation chooses; rate source must be visible to the user before confirm).
- Slippage / rate refresh: show final amount before the user signs in Phantom (or compatible wallet).
- Failed conversion or failed transfer → **no** silent server-side balance credit of crypto; retry or cancel only.

---

## 3. Treasury Addresses & Roles

| Role | Address / destination | Control |
|------|----------------------|---------|
| **Community Pool** | `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` | Single admin (originator); Phantom |
| **Primary merchant / ops receive** (shop remainder) | Configured merchant Solana address (set at launch; may equal pool only if intentionally combined) | Single admin or designated ops wallet |
| **User payer** | User’s own Phantom (or compatible) wallet | User |

Until a separate merchant address is published, **all automated shop crypto proceeds may route to the Community Pool address**, with internal accounting for “pool share” vs “ops share” recorded off-chain for admin bookkeeping. Prefer splitting on-chain when a second receive address is locked.

**Identity burn does not move, claw back, or reassign any of these balances.**

---

## 4. Treasury Split (Proceeds After Discounts)

All percentages below apply to the **net amount actually received** after membership discounts are applied (see §5), unless a line item is marked non-discountable.

### 4.1 Default split (locked policy targets)

| Bucket | Share of net shop crypto proceeds | Destination |
|--------|-----------------------------------|-------------|
| **Community Pool** | **60%** | `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` |
| **Ops / merchant** | **40%** | Merchant receive address (or pool with off-chain ops ledger if not yet split) |

**Community Pool uses (from this inflow):** forum/community maintenance, NFT mint gas reserves, highest-tier gas-fee waiver funding, other costs explicitly allowed in `14-Community-Pool.md`.

### 4.2 NFT mint–specific line items

When the cart includes a **native NFT mint**:

| Component | Handling |
|-----------|----------|
| Mint **price** (creator/shop) | Subject to shop discounts + default treasury split |
| **Network gas / prioritization fees** | Paid by user **or** waived/sponsored from Community Pool for **highest paid tier** per loyalty rules |
| Gas waiver | Does **not** reduce Community Pool *percentage* on the mint price; waiver is an **outflow** from the pool when executed |

### 4.3 Voluntary tips / donations

Optional “support the pool” line items route **100%** to the Community Pool address and are not subject to the 60/40 split.

---

## 5. Discount Stack (Identity → Price → Treasury)

Order of operations at checkout:

1. **List price** (shop unit).  
2. Apply **Founding Sovereign Viewer 2.50%** native TRV shop discount if attestation present (`05-Membership-Benefits.md`).  
3. Apply **membership tier** pricing if the SKU is a membership product; apply **17.76% U.S. citizen** discount on membership SKUs when ZK/citizenship attestation is present.  
4. **Stacking rule (locked):**  
   - Founding 2.50% applies to **native shop** goods (including eligible NFTs).  
   - 17.76% applies to **membership** products.  
   - If both could apply to the same line, apply citizenship discount only to membership lines and Founding shop discount only to shop/NFT lines — **do not double-discount the same line** unless a future locked revision says otherwise.  
5. Convert discounted total to SOL/SPL via Token Converter.  
6. User signs payment.  
7. Route net received funds per §4.

Discounts are **identity-layer** (attestations). They are not implemented by asking the Community Pool to “refund” identity burns.

---

## 6. Token Converter Flow (End-to-End)

```
[Cart + identity attestations]
        │
        ▼
[Price engine: list → discounts → net shop total]
        │
        ▼
[Token Converter: net total → SOL or allowlisted SPL amount]
        │
        ▼
[User confirms in Phantom / wallet adapter]
        │
        ├──► Transfer Community Pool share (60%) → 555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt
        └──► Transfer ops share (40%) → merchant address (or temporary all-to-pool + ledger)
        │
        ▼
[Fulfill digital good / queue mint / membership entitlement on identity path]
```

**Atomicity preference:** Prefer a single user transaction (or versioned transaction) that pays both destinations when on-chain split is enabled. If only one destination is live, pay pool address and record ops share off-chain until split addresses are both active.

**No TRV server hot wallet for user funds.** TRV does not hold user SOL between “convert” and “pay.”

---

## 7. Gas Waiver Logic (Highest Tier)

| Condition | Behavior |
|-----------|----------|
| User holds **highest paid tier** (including Founding lifetime highest tier) | Eligible for **mint gas fee waived** per policy |
| Funding source | Community Pool (admin or designated relayer sponsors gas) |
| Identity path burned | Entitlement ends; no residual claim on pool |
| Pool insufficient | Waiver may fail gracefully; user can pay gas themselves; no forced debt |

---

## 8. Accounting & Transparency

| Record | Retention / surface |
|--------|---------------------|
| On-chain tx signatures | Public on Solana explorers |
| Minimal shop order id ↔ tx signature | Ops systems; not Class A identity archive |
| Authorization that discount was applied | Minimal auth result per Identity retention (R3), not full credential |
| Pool balance | Visible on-chain at pool address |

Publish explorer link for the Community Pool in UI where transparency is shown.

---

## 9. Security Boundaries

1. **No admin seed** in app, CI, or server for automatic “pool spend.” Outflows that require pool keys are admin-signed or use a future locked relayer key.  
2. **No user seed** collected by TRV Shop.  
3. **Allowlist** SPL tokens aggressively; reject unknown mints.  
4. **Official pool address** only as in `14-Community-Pool.md` / this file.  
5. Converter oracle manipulation: prefer conservative quotes, short quote TTL, user-visible final amount.  
6. Destroy = Restart clears shop **entitlements** on that identity path; it does not reverse completed on-chain settlements.

---

## 10. Config Surface (Implementation)

```json
{
  "communityPool": {
    "chain": "solana",
    "address": "555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt",
    "walletLabel": "Phantom",
    "controlModel": "single_admin",
    "identityBurnAffectsPool": false
  },
  "trvShop": {
    "tokenConverter": {
      "primaryAsset": "SOL",
      "allowlistedSplMints": [],
      "quoteTtlSeconds": 30
    },
    "treasurySplit": {
      "communityPoolPercent": 60,
      "opsPercent": 40,
      "merchantAddress": null
    },
    "discounts": {
      "foundingShopPercent": 2.5,
      "usCitizenMembershipPercent": 17.76,
      "doubleDiscountSameLine": false
    },
    "gasWaiver": {
      "highestTierMintGasSponsoredFromPool": true
    }
  }
}
```

`merchantAddress: null` means temporary **all proceeds to Community Pool** with off-chain ops ledger until a merchant address is locked in a doc revision.

---

## 11. User-Facing Disclosure (Shop / Converter)

**Checkout:**  
“Prices may be paid in SOL (or listed Solana tokens). Final amount is shown before you approve in your wallet. 60% of net eligible shop crypto (after discounts) is routed to the TRV Community Pool for maintenance and mint infrastructure; 40% is ops. TRV never holds your wallet seed.”

**Discounts:**  
“Membership and Founding discounts apply only when your verified attestations are present. They attach to your identity path and end if that path is destroyed.”

**Pool:**  
“Community Pool address (Solana): 555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt”

---

## 12. Relationship to Other Locked Documents

| Document | Relationship |
|----------|----------------|
| `14-Community-Pool.md` | Canonical pool address and admin model; this doc defines **shop converter routing into** that pool |
| `05-Membership-Benefits.md` | Discount rates and identity proof requirements |
| `04-Founding-Sovereign-Viewer.md` | Lifetime highest tier + 2.50% shop discount |
| `03-Destroy-Equals-Restart.md` | Entitlements die with path; chain settlements do not reverse |
| `11` / `12` | Minimal order metadata retention; no credential archives |

---

## 13. Final Statement

**Token Converter prices and collects. Treasury split funds the pool and ops. Identity only proves discounts. Phantom signs; TRV does not custody seeds.**

Community Pool: `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt`  
Default net split: **60% pool / 40% ops**  
Burn the path — not the treasury.
