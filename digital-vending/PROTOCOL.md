# TRV Digital Vending Machine — Protocol

**Status:** Operating (Phase 4 frozen surface)  
**Proven:** GrapheneOS + Termux (see REALITY.md)  
**Authority:** This file + `catalog.json` + locked docs 04 / 17

---

## 0. Relation to network sub ($96)

| Product | What it is |
|---------|------------|
| **Catalog packs** (this protocol) | One-time USDC memo → TRVL delivery of a SKU |
| **Yearly network sub ($96)** | Unlimited human **comms** entitlement — `docs/VALUE.md` / `docs/PAYMENTS.md` |

Paying for a pack does **not** auto-grant network unlimited comms.  
Network sub does **not** waive catalog pack prices. Path B founding does **not** waive packs.

---

## 1. Design rules (non-negotiable)

1. **Payment ≠ delivery.** Payment is only a signal. Delivery is always age + Robust Soliton LT (TRVL).
2. **Seller never holds buyer identity.** Only the buyer’s public `age1…` is used; private key never leaves buyer device.
3. **No empty packs.** `log-sale.sh` and Integrity Verifier refuse empty-file sha256 / 0-byte frames.
4. **Catalog is truth.** `catalog.json` maps memo → SKU → payload.
5. **Packs stay paid.** Founding / Path B status does not waive catalog prices.
6. **Local log only.** `sales.log` under `$HOME/trv-deliver/`. No phone-home of sale content.
7. **Destroy = Restart.** Test keys in chat/screenshots are burned.

---

## 2. Rails

| Rail | Direction | Format |
|------|-----------|--------|
| Payment signal | Buyer → Seller | Solana USDC + **memo** |
| Recipient drop | Buyer → Seller | `$HOME/trv-deliver/<sig12>.recipient` → `age1…` |
| Delivery | Seller → Buyer | `.trvl` age + Soliton LT |
| Integrity | Anyone | `modules/integrity-verifier/` |
| Optical (optional) | Either | Same `.trvl` via QR/camera |

**Deferred:** SPL platform mint, cloud identity, auto-grant of $96 entitlement from pack payment.

---

## 3. Memo → SKU map

Source: `catalog.json` field `memo`.

| Memo | Catalog id | Price |
|------|------------|------:|
| `TRV-Posture-Lite` | `trv-posture-lite` | 11 USDC |
| `TRV-Posture-Pack` | `trv-posture-pack` | 25 USDC |
| `SENTINEL-ZK-01` | `sentinel-skill-zk-01` | manual / XMR |
| `TEST-HELLO` | `hello-sentinel-demo` | test only |

```bash
bash memo-to-sku.sh "TRV-Posture-Lite"
bash deliver-from-memo.sh "<memo>" "<sig>" [age1] [amount-hint]
```

---

## 4. State machine (one sale)

```text
[idle] → USDC+memo → [seen] → age1? → [deliver] → [ready] → [verified]
                      └ no age1 → [pending]
```

Exit codes (`auto-deliver.sh`): 0 ok · 2 pending age1 · 3 encrypt fail · 4 catalog problem.

---

## 5. Wire formats

- **USDC** mainnet · mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **To:** seller `SALES_ADDRESS` (README / buy.html)
- **Memo:** exact catalog string
- **Recipient:** one line `age1…`
- **Artifact:** `.trvl` · buyer: `cat delivery.trvl | bash buyer-receive.sh identity.txt`

Empty digest `e3b0c442…` **rejected**.

---

## 6. Seller / buyer commands

Seller: `seller-ops.sh`, `deliver-from-memo.sh`, `watch-termux.sh`  
Buyer: pay + memo → send `age1…` only → peel with local identity  
Integrity: `modules/integrity-verifier/attest.sh`

---

## 7. Not in this protocol

- On-chain refunds  
- Seller storage of buyer private keys  
- Merging pack payment into network $96 sub without explicit product design  

Related: `catalog.json`, `buy.html`, `docs/VALUE.md`, `docs/public/PRICING.md`.
