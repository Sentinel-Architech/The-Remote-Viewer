# Digital vending (hybrid)

**Model:** free hobbyist path stays open. One paid digital product.  
**Primary rail:** **Phantom (Solana)** — not Stripe.

This is a **vending machine**, not a consulting desk: pay once → get the files. No custom installs per buyer.

---

## Lanes

| Lane | Cost | What you get |
|------|------|----------------|
| **Hobbyist (free)** | $0 | Public repo, README dual-path, `docs/public/*`, scaffolds |
| **TRV Posture Pack (paid)** | **~$19 USD** in **USDC** (preferred) or SOL | Curated pack: posture checklist, secrets hygiene, install notes, builder bridge |
| **Card later (optional)** | Same SKU | Stripe only if you ever want fiat — not required |

Free never goes away. Paid is for people who want a tight pack instead of digging the whole tree.

---

## Product: TRV Posture Pack

**Name:** TRV Posture Pack  
**Price target:** **19 USDC** (or SOL ≈ $19 at send time)  
**Format:** single ZIP  
**Delivery:** after payment confirmed on-chain (seller sends the download link)

### Suggested pack contents

1. POSTURE one-pager  
2. Secrets hygiene checklist  
3. Hobbyist → Builder reading order  
4. Install-anywhere / Obtainium notes  
5. Honest status (scaffold ≠ secure)  

No private keys, seeds, or live secrets in the pack.

---

## Checkout with Phantom

### Live pay details

```text
NETWORK=Solana mainnet-beta
ASSET=USDC (preferred) or SOL
AMOUNT=19 USDC   # or SOL equivalent ≈ $19
ADDRESS=HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv
MEMO=TRV-Posture-Pack
CONTACT=X DM @_Archetecht  (send tx signature after payment)
```

**Buyer flow:**

1. Open Phantom → Send  
2. USDC (or SOL) → address above  
3. Amount ≈ $19  
4. Optional memo: `TRV-Posture-Pack`  
5. DM **@_Archetecht** on X with the **transaction signature**  
6. Seller verifies on [Solana Explorer](https://explorer.solana.com/) / Solscan → sends ZIP link  

### Verify payment (seller)

- Confirm: to the sales address, amount, recent timestamp  
- Deliver once  
- Log offline: `date | tx sig | delivered?` (not in public git)

### Delivery options

- Private download URL  
- DM / email the ZIP  
- Time-limited link  

---

## Slightly more automatic (optional later)

| Tool | Role |
|------|------|
| **Solana Pay** transfer request URL/QR | Buyer scans; Phantom fills amount + dest |
| **Helio / similar** | Crypto checkout pages that speak Phantom |
| **Card (Stripe)** | Only if you want fiat later |

None required for sale #1.

---

## Operator checklist

- [x] Sales address published  
- [ ] Pack ZIP built (no secrets)  
- [x] Address + price in README / this doc  
- [x] Contact path (X DM @_Archetecht)  
- [ ] Test: small self-transfer, practice verify + deliver  
- [ ] Optional: Solana Pay QR  
- [ ] Optional: pin pay block on X bio  

---

## What this is not

- Not custodial recovery  
- Not “scaffolds are production secure”  
- Not a subscription  
- Not unpaid custom consulting inside the $19  

Support stays issues/community. The pack is documentation density.
