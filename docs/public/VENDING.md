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

Lite:  9 USDC   memo: TRV-Posture-Lite
Pack: 19 USDC   memo: TRV-Posture-Pack

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
| **2 — Hosted checkout** | Pay link + email/download after pay | Host ZIP once on a private URL | Medium (Helio / MoonPay Commerce) |
| **3 — Full watcher** | Detect memo + amount → email/Telegram one-time link | Run a small always-on process | Higher |

### Level 1 — Notify (recommended next)

Watch the sales wallet; get a ping so you don’t miss a sale.

Options:

- **Helius** webhooks (Solana-native) → Discord / your HTTPS endpoint  
- **Solscan / explorer** push if you enable address alerts  
- Local: `scripts/watch-sales-notify.sh` pattern (poll RPC, print new sigs)

You still attach the ZIP from **The Remote Viewer shop** folder — but you know the second money lands.

### Level 2 — Helio / MoonPay Commerce Pay Link

No-code Solana checkout:

1. Create product “TRV Posture Lite” @ 9 USDC and “TRV Posture Pack” @ 19 USDC  
2. Set payout wallet = sales address (or linked Helio wallet)  
3. Success page / email with download link to a **private** host of the ZIP  

Buyer never needs to DM a tx sig. Tradeoff: third-party checkout (Helio is under MoonPay Commerce).

### Level 3 — Full auto (sovereign path)

Rough pipeline:

1. **Ingest:** Helius/Alchemy webhook or RPC subscription on the USDC ATA for the sales address  
2. **Parse:** amount + memo (`TRV-Posture-Lite` / `TRV-Posture-Pack`) + signature  
3. **Fulfill:** email buyer (if they left an address) **or** Telegram to you with a one-time signed download URL  
4. **Host files:** private object storage or self-hosted static files with expiring tokens — **never** commit ZIPs to public git if you want scarcity  

Requires: always-on host, secrets for webhook verify, and a place the ZIP lives that isn’t the public repo.

Stub / notes: `scripts/watch-sales-notify.example.sh`

### What we will not automate

- Posting private keys or pack files into public CI logs  
- Auto-DM on X (no stable official API for that as a hobby flow)  
- Trusting memo alone without amount checks  

---

## Operator checklist

- [x] Sales address published  
- [x] Lite + Pack builder  
- [x] Prices: **9** / **19** USDC  
- [x] Fee / gasless note  
- [x] Packs downloaded to device (“The Remote Viewer shop”)  
- [ ] Test small self-pay  
- [ ] Level 1 notify (optional)  
- [ ] Level 2 Helio links (optional)  
- [ ] Level 3 full auto (later)  

---

## What this is not

Not custody, not “scaffolds are secure,” not a subscription, not unpaid consulting.
