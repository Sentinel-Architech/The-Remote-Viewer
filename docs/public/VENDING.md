# Digital vending (hybrid)

**Model:** free hobbyist path stays open. Two paid tiers (divide).  
**Primary rail:** **Phantom (Solana)**.

Pay once → get the ZIP. No custom installs per buyer.  
Prices are **per pack**, not per file.

---

## Lanes

| Lane | Cost | What you get |
|------|------|----------------|
| **Hobbyist (free)** | $0 | Public repo, dual-path README, all public docs |
| **TRV Posture Lite** | **9 USDC** | One small ZIP: POSTURE + Destroy=Restart |
| **TRV Posture Pack** | **19 USDC** | One full ZIP: install, security, Obtainium, threat model, etc. |
| **Card later (optional)** | Same SKUs | Stripe only if you ever want fiat |

Free never goes away. Paid = packaging + signal, not secret protocol material.

---

## Products

### Lite — 9 USDC
Impulse / core posture only.

### Pack — 19 USDC
Full builder map (same ballpark as the original single SKU). Lite sits under it.

### Automated build

```bash
chmod +x scripts/build-posture-pack.sh
./scripts/build-posture-pack.sh        # both
./scripts/build-posture-pack.sh lite
./scripts/build-posture-pack.sh full
```

Outputs (gitignored under `dist/`):

- `trv-posture-lite.zip`
- `trv-posture-pack.zip`

**CI:** workflow **Build Posture Pack** → download artifact.

---

## Checkout with Phantom

```text
NETWORK=Solana mainnet-beta
ADDRESS=HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv

Lite:  9 USDC   memo: TRV-Posture-Lite
Pack: 19 USDC   memo: TRV-Posture-Pack

CONTACT=X DM @_Archetecht  (send tx signature after payment)
```

**Buyer flow:** Phantom → Send USDC (or SOL ≈ amount) → memo → DM tx sig → you verify → send the matching ZIP.

Verify on [Solana Explorer](https://explorer.solana.com/) / Solscan. Deliver once. Log offline only.

### Fees (Solana / Phantom)

- Network fees are paid in **SOL**, not as a % of USDC. A normal USDC send is usually **well under $0.01**.
- Keep a little **SOL** in Phantom for fees (Phantom often suggests ~0.02 SOL on hand).
- **First send** of USDC to an address that has never held USDC can create an Associated Token Account (~0.002 SOL rent once, on the order of tens of cents depending on SOL price). Later sends are normal tiny fees.
- **Phantom gasless:** if you don’t have enough SOL, Phantom may still complete eligible sends by taking a small fee from the token you’re sending (for verified tokens, above a minimum size). That fee is shown in-app before you confirm; it is not a TRV charge.
- Raw transfer to the sales address has **no platform cut** from us — only Solana (and any Phantom gasless path if used).

---

## Operator checklist

- [x] Sales address published  
- [x] Lite + Pack builder  
- [x] Prices: **9** / **19** USDC (per pack)  
- [x] Fee / gasless note for buyers  
- [ ] Run builder; keep both ZIPs for delivery  
- [x] Contact: @_Archetecht  
- [ ] Test small self-pay  
- [ ] Optional: Solana Pay QR / X bio pin  

---

## What this is not

Not custody, not “scaffolds are secure,” not a subscription, not unpaid consulting, not $29-per-document.
