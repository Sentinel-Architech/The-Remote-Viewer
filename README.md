# The Remote Viewer (TRV) / The Sentinel

## Buy packs (public)

**USDC on Solana · age-encrypted TRVL delivery · zero platform custody**

| Pack | Price | Memo |
|------|------:|------|
| **TRV Posture Lite** | 11 USDC | `TRV-Posture-Lite` |
| **TRV Posture Pack** | 25 USDC | `TRV-Posture-Pack` |
| ZK Membership Skill | Manual / XMR | `SENTINEL-ZK-01` |

**Sales address:** `HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv`

### Storefront (Pay + QR)

- **In-repo:** [`digital-vending/buy.html`](digital-vending/buy.html)
- **Preview in browser:** [htmlpreview — buy.html](https://htmlpreview.github.io/?https://github.com/Sentinel-Archetecht/The-Remote-Viewer/blob/TheRemoteViewer/digital-vending/buy.html)
- **jsDelivr:** [buy.html via CDN](https://cdn.jsdelivr.net/gh/Sentinel-Archetecht/The-Remote-Viewer@TheRemoteViewer/digital-vending/buy.html)

### After you pay

1. Create an age identity on **your** device (`age-keygen`). Keep the secret.
2. Send the seller only: your **`age1…` public key** + **tx signature**.
3. Receive a `.trvl` file → decrypt locally:
   ```bash
   cat sale.trvl | bash buyer-receive.sh /path/to/your-identity.txt
   ```

Protocol: [`digital-vending/PROTOCOL.md`](digital-vending/PROTOCOL.md) · Buyer steps: [`docs/public/BUY.md`](docs/public/BUY.md)

---

## Viewer count

| Path | Count | Notes |
|------|------:|-------|
| **Path A** — Personal invitation | **1** | Originator |
| **Path B** — Independent completion | **0** | Verified finishers only |
| **Total Founding Sovereign Viewers** | **1** | |

Path B earns Founding Member status + optional Integrity Verifier node. **Packs stay paid per item.**  
See [`docs/locked/04-Founding-Sovereign-Viewer.md`](docs/locked/04-Founding-Sovereign-Viewer.md) and [`docs/locked/17-Validator-Node-First-Role.md`](docs/locked/17-Validator-Node-First-Role.md).

---

**Local-first sovereign node** for GrapheneOS + Termux (and desktop Linux/macOS).

Not a cloud AI product. Not a live DePIN network. Not an always-on oracle.

**Working branch:** [`TheRemoteViewer`](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/tree/TheRemoteViewer)  
**Truth file:** [`docs/REALITY.md`](docs/REALITY.md) — PROVEN means ran on a real device under user control.  
**Reproduce:** [`docs/TEST.md`](docs/TEST.md)

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh    # Hydra multi-head
bash scripts/chat.sh                       # local assistant (after llama.cpp + weights optional)
```

---

## Status (2026-08-13)

| Capability | Status | Notes |
|------------|--------|-------|
| Optical air-gap | **PROVEN** | age → Soliton LT → peel → decrypt |
| Digital vending (Path B) | **PROVEN** | Solana USDC memo → TRVL deliver on-device |
| Integrity Verifier (first node role) | **PROVEN** | contribution + sales.log attestation |
| Defense / Hydra multi-head | **PROVEN** | seal + verifier + quarantine deliver gate |
| MoE Stage B (dense) | **PROVEN** | TinyLlama + Qwen2.5-Coder via llama.cpp |
| MoE Stage C (sparse) | **PROVEN** | TinyMixtral-4x248M-MoE load + generate |
| Contribution ledger | **PROVEN** | offline JSONL hash-chain + verifier weight |
| Local operator UI | **PROVEN** | `http://127.0.0.1:8765/` — copy-to-Termux console |
| Mobile client UI | **DEMONSTRATED** | Hub / Viewer Profile / Shop (TRV credits + Solana + NFT + Aurora) / Talk / Field claim on-device 2026-08-13 |
| Public buy page | **OPEN** | `digital-vending/buy.html` + QR |
| Local RAG | **SCAFFOLD** | BM25 + TF-IDF + session memory + chat |
| Chain settlement | **NOT STARTED** | |

---

## 60-second paths

### Phone (Termux)

```bash
pkg update && pkg install git python -y
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
bash modules/rag/seed-trv-docs.sh
bash scripts/chat.sh
```

### Integrity Verifier (Path B option)

```bash
bash modules/integrity-verifier/verify-contribution.sh
bash modules/integrity-verifier/verify-sales.sh
bash modules/integrity-verifier/attest.sh
bash modules/integrity-verifier/record-weight.sh pass "note"
```

### Operator UI

```bash
bash apps/ui/serve-ui.sh
# http://127.0.0.1:8765/
```

---

## Layout

```text
digital-vending/buy.html     Public storefront (Pay + QR)
digital-vending/PROTOCOL.md  Vending machine protocol
docs/public/BUY.md           Buyer-facing steps
optical-airgap/              PROVEN transport
modules/defense/             Hydra multi-head (PROVEN)
modules/integrity-verifier/  First validator role (PROVEN)
apps/ui/                     Local operator console (PROVEN)
apps/mobile/                 Mobile client (Hub/Profile/Shop/Talk demonstrated)
docs/REALITY.md              Status authority
docs/TEST.md                 How others verify
```

---

## What this is not

- No required cloud login  
- No public hosted EI endpoint  
- No live multi-operator DePIN  
- Keys, GGUFs, personal notes, and ledger events stay on **your** device  

---

## License

See [LICENSE](LICENSE).
