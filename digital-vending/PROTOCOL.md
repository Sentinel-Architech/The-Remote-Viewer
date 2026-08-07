# TRV Digital Vending Machine — Protocol

**Status:** Operating (Phase 4 frozen surface)  
**Proven:** GrapheneOS + Termux, 2026-08-07  
**Authority:** This file + `catalog.json` + locked docs 04 / 17

---

## 1. Design rules (non-negotiable)

1. **Payment ≠ delivery.** Payment is only a signal. Delivery is always age + Robust Soliton LT (TRVL).
2. **Seller never holds buyer identity.** Only the buyer’s public `age1…` is used; private key never leaves buyer device.
3. **No empty packs.** `log-sale.sh` and Integrity Verifier refuse empty-file sha256 / 0-byte frames.
4. **Catalog is truth.** `catalog.json` maps memo → SKU → payload. No hardcoded SKU lists in new code.
5. **Packs stay paid.** Founding / Path B status does not waive catalog prices.
6. **Local log only.** `sales.log` is append-only under `$HOME/trv-deliver/`. No phone-home of sale content.
7. **Destroy = Restart.** Test keys that appear in chat or screenshots are burned.

---

## 2. Rails

| Rail | Direction | Format |
|------|-----------|--------|
| Payment signal | Buyer → Seller | Solana USDC transfer + **memo** string |
| Recipient drop | Buyer → Seller | File: `$HOME/trv-deliver/<sig12>.recipient` containing `age1…` |
| Delivery | Seller → Buyer | `.trvl` = age ciphertext framed as Soliton LT (TRVL1) |
| Integrity | Anyone | `modules/integrity-verifier/` attestation over contribution + sales.log |
| Optical (optional) | Either | Same `.trvl` frames via QR / camera path |

**Deferred:** SPL TRV mint, platform custody, cloud identity.

---

## 3. Memo → SKU map

Source: `catalog.json` field `memo` (substring match on-chain).

| Memo (exact in Phantom) | Catalog id | Price |
|-------------------------|------------|-------|
| `TRV-Posture-Lite` | `trv-posture-lite` | 11 USDC |
| `TRV-Posture-Pack` | `trv-posture-pack` | 25 USDC |
| `SENTINEL-ZK-01` | `sentinel-skill-zk-01` | manual / XMR |
| `TEST-HELLO` | `hello-sentinel-demo` | test only |

Tools:

```bash
bash memo-to-sku.sh "TRV-Posture-Lite"
bash deliver-from-memo.sh "<memo>" "<sig>" [age1] [amount-hint]
```

Watcher uses the same map via `memo-to-sku.sh`.

---

## 4. State machine (one sale)

```text
[idle]
   │  USDC + memo lands on SALES_ADDRESS
   ▼
[seen]  watcher records sig, maps memo → catalog_id
   │
   ├─ age1 already in <sig12>.recipient ──► [deliver]
   │
   └─ no age1 ──► write <sig12>_<id>.PENDING ──► [pending]
                                                      │
                         buyer drops age1 ────────────┘
                                                      ▼
[deliver]  age encrypt payload → Soliton LT → .trvl
   │       log-sale.sh appends sha256 + bytes
   │       write *_dm.txt handoff note
   ▼
[ready]  buyer peels + decrypts with their identity only
   │
   ▼
[verified]  optional: Integrity Verifier overall_ok=1
```

Exit codes (`auto-deliver.sh`):

| Code | Meaning |
|------|---------|
| 0 | Frames + DM written |
| 2 | Missing/invalid age1 → PENDING |
| 3 | Encrypt/stream failed |
| 4 | Catalog/payload problem |

---

## 5. Wire formats

### Payment
- Chain: Solana mainnet
- Token: USDC (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)
- To: seller `SALES_ADDRESS`
- Memo: exact catalog memo string (case-sensitive)

### Recipient drop
```text
$HOME/trv-deliver/<first-12-chars-of-sig>.recipient
```
Single line: `age1…` (Bech32). No spaces, no quotes.

### Delivery artifact
```text
$HOME/trv-deliver/<prefix>_<catalog-id>.trvl
```
or timestamped `trv-posture-lite-YYYYMMDDHHMM.trvl` for manual deliver.

Contents: age ciphertext of payload, framed as TRVL1 Soliton LT. Buyer runs:

```bash
cat frames.trvl | bash buyer-receive.sh /path/to/identity.txt
```

### sales.log line
```text
ISO8601Z  id=<catalog-id>  [note]  frames=<file>  sha256=<hex>  bytes=<n>
```
Empty-file digest `e3b0c442…` is **rejected** at log and at verify.

---

## 6. Seller commands (canonical)

```bash
# Manual
bash seller-ops.sh deliver <catalog-id> 'age1...'
bash seller-ops.sh status

# From memo + sig
bash deliver-from-memo.sh "TRV-Posture-Lite" "<sig>" "age1..." 11

# Watcher (Path B automation)
export SALES_ADDRESS='HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv'
bash watch-termux.sh          # phone, best-effort
# or bash watch-sales-notify-v2.sh

# Integrity
bash ../modules/integrity-verifier/attest.sh
```

---

## 7. Buyer commands (canonical)

1. Pay USDC + memo via Phantom (or Solana Pay link in `buy.html`).
2. `age-keygen -o identity.txt` — keep secret; send **public** `age1…` only.
3. After `.trvl` received:

```bash
cat delivery.trvl | bash buyer-receive.sh identity.txt
```

4. Burn identity if it was exposed.

---

## 8. Integrity Verifier (optional node role)

Path B Founding Members may run:

```bash
bash modules/integrity-verifier/verify-contribution.sh
bash modules/integrity-verifier/verify-sales.sh
bash modules/integrity-verifier/attest.sh
bash modules/integrity-verifier/record-weight.sh pass|fail "note"
```

Constraints: locked doc `17-Validator-Node-First-Role.md` (no custody, no yield, no free packs, offline-capable).

---

## 9. What is not in this protocol

- Refunds / chargebacks on-chain (handle off-protocol)
- Seller-side storage of buyer private keys
- Automatic price changes without catalog + Phase 4 unfreeze
- Required VPS (phone watcher is best-effort only)

---

## 10. Related files

| File | Role |
|------|------|
| `catalog.json` | SKU + memo + payload paths |
| `AUTO-SOLANA.md` | Watcher ops |
| `PRODUCT.md` | Phase 4 product surface |
| `buy.html` | Static Solana Pay entry |
| `docs/TEST.md` §4 | Reproducible e2e |
| `docs/locked/04-…` | Founding paths |
| `docs/locked/17-…` | First validator role |
