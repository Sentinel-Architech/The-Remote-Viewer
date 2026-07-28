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
| **TRV Posture Lite** | **11 USDC** | One small ZIP: POSTURE + Destroy=Restart |
| **TRV Posture Pack** | **25 USDC** | One full ZIP: install, security, Obtainium, threat model, etc. |
| **Card later (optional)** | Same SKUs | Stripe / Helio when those rails work |

Free never goes away. Paid = packaging + signal, not secret protocol material.

---

## Products

### Lite — 11 USDC
Impulse / core posture only.

### Pack — 25 USDC
Full builder map. Lite sits under it.

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

## Checkout with Phantom (manual delivery — live now)

```text
NETWORK=Solana mainnet-beta
ADDRESS=HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv

Lite:  11 USDC   memo: TRV-Posture-Lite
Pack:  25 USDC   memo: TRV-Posture-Pack

CONTACT=X DM @_Archetecht  (send tx signature after payment)
```

**Buyer flow:** Phantom → Send USDC → memo → DM tx sig → you verify → send matching ZIP.

### Fees (Solana / Phantom)

- Network fees in **SOL**, not a % of USDC (usually under a cent).
- Keep a little SOL on hand (~0.02 SOL suggested by Phantom).
- First USDC receive can create an ATA (~0.002 SOL rent once).
- **Phantom gasless** may take a small fee from the token if short on SOL (shown in-app; not a TRV charge).

---

## Automated delivery (payout / fulfill flow)

“Payout” here means **money in → product out**. Three levels:

| Level | What automates | You still do | Effort |
|-------|----------------|--------------|--------|
| **0 — Manual** (current) | Nothing | Verify tx + DM ZIP | Zero infra |
| **1 — Notify** | Alert when USDC hits the sales address | Still send the ZIP | Low |
| **2 — Hosted checkout** | Pay link + email/download after pay | Host ZIP once | Medium (Helio / MoonPay Commerce) |
| **3 — Full watcher** | Detect memo + amount → one-time link | Always-on process | Higher |

Helio Pay Links targeted at **11** / **25** when that dashboard cooperates.

Stub: `scripts/watch-sales-notify.example.sh`

---

## Operator checklist

- [x] Sales address published  
- [x] Lite + Pack builder  
- [x] Prices: **11** / **25** USDC  
- [x] Fee / gasless note  
- [x] Packs on device (“The Remote Viewer shop”)  
- [ ] Test small self-pay  
- [ ] Level 1 notify (optional)  
- [ ] Level 2 Helio links (optional)  

---

## What this is not

Not custody, not “scaffolds are secure,” not a subscription, not unpaid consulting.
