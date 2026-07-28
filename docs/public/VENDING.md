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
**Delivery:** after payment confirmed on-chain (you send the download link)

### Suggested pack contents

1. POSTURE one-pager  
2. Secrets hygiene checklist  
3. Hobbyist → Builder reading order  
4. Install-anywhere / Obtainium notes  
5. Honest status (scaffold ≠ secure)  

No private keys, seeds, or live secrets in the pack.

---

## Checkout with Phantom (day-one method)

### 1. Sales wallet (important)

- Create a **dedicated** Phantom account/address for sales (not your main bag).  
- Write down the recovery phrase offline; never put it in git or Discord.

### 2. Publish pay instructions

Replace the placeholders below with your real sales address:

```text
NETWORK=Solana mainnet-beta
ASSET=USDC (preferred) or SOL
AMOUNT=19 USDC   # or SOL equivalent ≈ $19
ADDRESS=YOUR_SOLANA_SALES_ADDRESS_HERE
MEMO=TRV-Posture-Pack
```

**Buyer flow:**

1. Open Phantom → Send  
2. USDC (or SOL) → your sales address  
3. Amount ≈ $19  
4. Optional memo: `TRV-Posture-Pack`  
5. Message you (X DM / email you publish) with **tx signature**  
6. You verify on a Solana explorer → send the ZIP link  

That’s enough for the first sales. No Stripe account.

### 3. Verify payment

- [Solana Explorer](https://explorer.solana.com/) or Solscan  
- Confirm: to your address, amount, recent timestamp  
- Then deliver once — don’t resend the same link forever in public threads  

### 4. Delivery

- Private download URL, or  
- Email / DM the ZIP, or  
- Time-limited link (Dropbox, private host, etc.)  

Keep a simple log offline: `date | tx sig | delivered?` — not in the public repo.

---

## Slightly more automatic (optional later)

| Tool | Role |
|------|------|
| **Solana Pay** transfer request URL/QR | Buyer scans; Phantom fills amount + dest |
| **Helio / similar** | Crypto checkout pages that speak Phantom |
| **BTCPay-style self-host** | If you expand beyond Solana |

None of these are required for sale #1.

---

## Placeholders (fill when ready)

```text
SOLANA_SALES_ADDRESS=REPLACE_ME
PRICE=19 USDC
CONTACT_FOR_DELIVERY=REPLACE_ME   # e.g. X handle or email
PACK_FILE=trv-posture-pack.zip    # kept off public git if you want scarcity
```

Until `SOLANA_SALES_ADDRESS` is real, the machine is designed but not powered.

---

## Operator checklist

- [ ] Dedicated Phantom sales address  
- [ ] Pack ZIP built (no secrets)  
- [ ] Address + price published (README / this doc / X bio)  
- [ ] Contact path for tx sig → delivery  
- [ ] Test: send $1 to yourself, practice verify + “deliver”  
- [ ] Optional: Solana Pay QR  
- [ ] Optional: Stripe later for card users  

---

## What this is not

- Not custodial recovery  
- Not “scaffolds are production secure”  
- Not a subscription  
- Not unpaid custom consulting inside the $19  

Support stays issues/community. The pack is documentation density.
