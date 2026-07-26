# TRV Shop Token Converter & Treasury (Locked)

**Status:** Locked — July 25, 2026 (split revised: creator + pool)  
**Chain:** Solana  
**Community Pool (public):** `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt`  
**Creator receive:** Private ops config only (not published in this repository)  
**Depends on:** `05-Membership-Benefits.md`, `14-Community-Pool.md`, Identity Layer discount rules  
**Does not alter:** Vault, Destroy = Restart semantics for identity, Class A data rules

---

## 1. Purpose

The **TRV Shop Token Converter** is the commerce settlement layer for native in-app purchases (digital goods, access, NFT-related fees where applicable). It:

1. Accepts user payment in supported **Solana assets** (SOL and allowlisted SPL tokens).
2. Converts / prices those assets into a **shop settlement unit** for the cart.
3. Applies **locked membership discounts** (identity-attested).
4. Routes **every purchase** according to the treasury split below.
5. Never takes custody of user identity keys, the Community Pool admin seed, or the creator wallet seed.

---

## 2. Supported Assets (Converter Input)

| Asset | Role | Notes |
|-------|------|--------|
| **SOL** | Primary settlement asset | Default path |
| **Allowlisted SPL tokens** | Optional alternate tender | Only tokens explicitly enabled in shop config; unknown tokens rejected |
| Fiat on-ramps | Out of scope unless added later | Must still settle under these routing rules or a new locked policy |

**Converter behavior**

- Display price in shop unit (product config).
- At checkout, compute required SOL (or SPL) using a documented oracle or fixed rate source; rate source visible before confirm.
- Show final amount before the user signs in Phantom (or compatible wallet).
- Failed conversion or transfer → no silent server-side crypto credit; retry or cancel only.

---

## 3. Treasury Addresses & Roles

| Role | Address / destination | Control | Public? |
|------|----------------------|---------|---------|
| **Community Pool** | `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` | Single admin (originator); Phantom | **Yes** — publishable |
| **Creator** | Solana address held in **private ops / deployment config only** | Originator / creator wallet | **No** — not committed to this repository |
| **User payer** | User’s own Phantom (or compatible) wallet | User | N/A |

There is **no separate ops/merchant bucket** in this revision. Net shop crypto after discounts splits only between **creator** and **Community Pool**.

**Identity burn does not move, claw back, or reassign any of these balances.**

### 3.1 Creator address privacy

- Full creator receive address is **not** stored in public locked docs or public client source that is meant to be scraped as the official “support” address.
- Implementation loads creator address from environment / private config at deploy time (e.g. `TRV_CREATOR_SOLANA_ADDRESS`).
- Support and marketing continue to point the **Community Pool** public address for voluntary community support.
- Prefix for ops recognition only (non-authoritative): addresses used for creator receive in this generation have been provisioned under Phantom Solana receive; the live value lives in private config.

---

## 4. Treasury Split (Every Purchase — Proceeds After Discounts)

Percentages apply to the **net amount actually received** after membership discounts (see §5), unless a line is marked non-discountable.

### 4.1 Default split (locked)

| Bucket | Share of net shop crypto proceeds | Destination |
|--------|-----------------------------------|-------------|
| **Creator** | **10%** | Private creator Solana address (ops config) |
| **Community Pool** | **90%** | `555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt` |

**Applies to every eligible purchase** routed through the TRV Shop Token Converter (memberships, native shop goods, eligible NFT mint price, etc.).

**Community Pool uses:** forum/community maintenance, NFT mint gas reserves, highest-tier gas-fee waiver funding, other costs allowed in `14-Community-Pool.md`.

**Creator share:** Originator compensation / creator treasury; not subject to user Destroy = Restart.

### 4.2 NFT mint–specific line items

| Component | Handling |
|-----------|----------|
| Mint **price** (shop) | Subject to discounts + **10% creator / 90% pool** split |
| **Network gas** | Paid by user **or** sponsored from Community Pool for highest paid tier |
| Gas waiver | Outflow from pool; does **not** change the 10/90 split on mint price |

### 4.3 Voluntary tips / donations to the pool

Optional “support the Community Pool” line items route **100%** to the public Community Pool address and are **not** subject to the 10% creator cut.

---

## 5. Discount Stack (Identity → Price → Treasury)

1. **List price**  
2. **Founding Sovereign 2.50%** on native shop lines if attested  
3. **Membership** pricing; **17.76% U.S. citizen** on membership SKUs if attested  
4. **No double-discount on the same line** (citizenship → membership lines only; Founding → shop/NFT lines only)  
5. Convert net total → SOL/SPL  
6. User signs  
7. Route **10% creator / 90% Community Pool**

---

## 6. Token Converter Flow (End-to-End)

```
[Cart + identity attestations]
        │
        ▼
[Price engine: list → discounts → net shop total]
        │
        ▼
[Token Converter: net total → SOL or allowlisted SPL]
        │
        ▼
[User confirms in Phantom / wallet adapter]
        │
        ├──► 10% → Creator address (from private config)
        └──► 90% → Community Pool 555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt
        │
        ▼
[Fulfill digital good / mint / membership on identity path]
```

Prefer one user transaction (or versioned transaction) paying both destinations.  
**No TRV server hot wallet** holding user funds between convert and pay.

---

## 7. Gas Waiver Logic (Highest Tier)

| Condition | Behavior |
|-----------|----------|
| Highest paid tier (including Founding lifetime) | Eligible for mint gas sponsored from **Community Pool** |
| Identity path burned | Entitlement ends |
| Pool insufficient | Fail gracefully; user may pay gas |

---

## 8. Accounting & Transparency

| Record | Surface |
|--------|---------|
| On-chain txs | Public on Solana explorers |
| Community Pool balance | Public at published address |
| Creator inflows | Visible on-chain to anyone who knows the address; **address itself not advertised** in public TRV docs |
| Minimal order id ↔ tx | Ops only; not a credential archive |

---

## 9. Security Boundaries

1. No creator or pool **seeds** in git, CI, or client binaries.  
2. Creator **address** may exist in private deploy config; still never ship seeds.  
3. Do not list the creator address in user-facing “donate / support” UI (that remains the Community Pool).  
4. Official **public** pool address only as in `14-Community-Pool.md`.  
5. Destroy = Restart clears entitlements; does not reverse settlements or touch creator/pool balances.

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
      "creatorPercent": 10,
      "communityPoolPercent": 90,
      "creatorAddressEnvVar": "TRV_CREATOR_SOLANA_ADDRESS",
      "creatorAddressPublic": false
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

Set `TRV_CREATOR_SOLANA_ADDRESS` in private environment only.

---

## 11. User-Facing Disclosure

**Checkout:**  
“Prices may be paid in SOL (or listed Solana tokens). Final amount is shown before you approve in your wallet. Net eligible shop crypto (after discounts) is split **10% creator / 90% Community Pool**. TRV never holds your wallet seed.”

**Community support:**  
“To support the community treasury directly, use the published Community Pool address. TRV will never ask for your seed phrase.”

**Pool (public):**  
`555y97LMoygGAWUWFngbprr5oMHFJsQqoFAbrHi5e8nt`

Do **not** publish the creator address in the same disclosure surfaces.

---

## 12. Relationship to Other Locked Documents

| Document | Relationship |
|----------|----------------|
| `14-Community-Pool.md` | Public pool address; receives **90%** of net shop crypto |
| `05` / `04` | Discount rates before split |
| `03` | Entitlements die with path; chain payouts do not reverse |

---

## 13. Final Statement

**Every eligible purchase: 10% creator (private address) · 90% Community Pool (public).**  
Voluntary pool gifts: 100% pool.  
Phantom signs; TRV does not custody seeds.  
Burn the path — not the treasury.
