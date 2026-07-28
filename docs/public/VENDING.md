# Digital vending (hybrid)

**Model:** free hobbyist path stays open. One paid digital product. Optional crypto rail later.

This is a **vending machine**, not a consulting desk: pay once → get the files. No custom installs per buyer.

---

## Lanes

| Lane | Cost | What you get |
|------|------|----------------|
| **Hobbyist (free)** | $0 | Public repo, README dual-path, `docs/public/*`, scaffolds |
| **TRV Posture Pack (paid)** | **$19** (starter price) | Curated pack: posture checklist, secrets hygiene, install notes, “start honest” builder notes |
| **Crypto (optional later)** | Same SKU | Same pack via BTCPay / lightning when you add a second rail |

Free never goes away. Paid is for people who want a tight, ordered pack instead of digging the whole tree.

---

## Product: TRV Posture Pack

**Name:** TRV Posture Pack  
**Price:** $19 USD (change anytime in Stripe)  
**Format:** single ZIP (or PDF + short text files)  
**Delivery:** instant after payment (success page or email link)

### Suggested contents (build this ZIP)

1. **POSTURE one-pager** — what we refuse (custody, fake recovery, Integrity-as-gate)
2. **Secrets hygiene checklist** — git, device, CI, allowlists
3. **Hobbyist → Builder bridge** — ordered reading list (`POSTURE` → Destroy=Restart → install policy)
4. **Install-anywhere notes** — Obtainium / sideload posture without claiming a finished APK
5. **Honest status** — scaffold ≠ secure (copy aligned with README)

Do **not** put private keys, seeds, or real `.env` samples with secrets in the pack.

### Pack location (your machine / private storage)

- Build the ZIP offline.
- Host download on: private URL, Stripe-hosted file, or a **private** GitHub Release asset.
- Public repo should only hold *this* doc and the buy link — not the paid file itself if you want scarcity.

---

## Checkout (Stripe Payment Link)

### One-time setup

1. Create a [Stripe](https://stripe.com) account.
2. **Products** → Add product  
   - Name: `TRV Posture Pack`  
   - Price: `$19` one-time  
3. **Payment link** → create for that price.  
4. Set **After payment** → redirect to your success URL (below).  
5. Paste the payment link into the placeholders in this repo (README + this file).

### Placeholders (replace when live)

```text
STRIPE_PAYMENT_LINK=https://buy.stripe.com/REPLACE_ME
SUCCESS_URL=https://YOUR_DOMAIN_OR_PAGES/thanks
DOWNLOAD_URL=https://REPLACE_ME/trv-posture-pack.zip
```

Until those are real, the machine is **designed but not powered**.

### Success page (minimal)

After payment, user should see:

- “Payment received”
- One download button / link to the ZIP
- Link back to the public repo (hobbyist path)
- No account required

You can host success as:

- Stripe’s built-in confirmation + link in the product description, or  
- A single static HTML page on GitHub Pages / any host, or  
- A route under `apps/web` later

---

## Crypto rail (later, not day one)

When you want the sovereign signal:

1. Same ZIP / same price target  
2. BTCPay Server or a published lightning/on-chain address  
3. Manual or webhook fulfillment until volume justifies automation  

Do not block the first sale on crypto infrastructure.

---

## Operator checklist

- [ ] Write pack files (no secrets)
- [ ] Zip and store privately
- [ ] Stripe product + Payment Link
- [ ] Success / download path works in a test payment
- [ ] Put live link in README “Packs” section
- [ ] Optional: pin link on X bio
- [ ] Optional: crypto address for the same SKU

---

## What this is not

- Not a subscription (yet)
- Not custodial recovery or “we hold your keys”
- Not a promise that scaffolds are production-secure
- Not support-heavy custom consulting baked into the $19

Support stays community/issues. The pack is documentation density, not a private Slack seat.
