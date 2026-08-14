# The Remote Viewer (TRV) / The Sentinel

**Status authority:** [`docs/REALITY.md`](docs/REALITY.md) (2026-08-13).  
All other status claims are subordinate to that file.

**Historical note:** Unrelated to Technical Remote Viewing / PSI TECH / Ed Dames methodology.  
This project is a local-first software system for digital sovereignty.

**Solo-built · local-first · zero-custody · optical air-gap systems**

Path B Independent Completion is open to any builder who completes the published checklist on a machine they control and submits offline attestation.  
Recognition is currently originator-verified.  
External finishers: **0** as of 2026-08-13.  
Packs remain paid per item. No free catalog items.

**Builder guide:** [`docs/public/PATH-B-BUILDER.md`](docs/public/PATH-B-BUILDER.md)  
**Reproduce proven claims:** [`docs/REPRODUCE.md`](docs/REPRODUCE.md)  
**Review posture:** [`docs/public/REVIEW-AND-CONTRIBUTION.md`](docs/public/REVIEW-AND-CONTRIBUTION.md)

---

## Path B (Independent Completion)

| Path | Count | Notes |
|------|------:|-------|
| **Path A** — Personal invitation | **1** | Originator |
| **Path B** — Independent completion | **0** | Verified finishers only |
| **Total Founding Sovereign Viewers** | **1** | |

Path B earns Founding Member status + optional Integrity Verifier node.  
**Packs stay paid.** No free catalog items.

See [`docs/public/PATH-B-FINISHED.md`](docs/public/PATH-B-FINISHED.md) · [`docs/public/PATH-B-SUBMISSION.md`](docs/public/PATH-B-SUBMISSION.md) · locked docs 04 & 17.

---

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
- **Preview:** [htmlpreview — buy.html](https://htmlpreview.github.io/?https://github.com/Sentinel-Archetecht/The-Remote-Viewer/blob/TheRemoteViewer/digital-vending/buy.html)

### After you pay

1. Create an age identity on **your** device (`age-keygen`). Keep the secret.
2. Send the seller only: your **`age1…` public key** + **tx signature**.
3. Receive a `.trvl` file → decrypt locally.

Protocol: [`digital-vending/PROTOCOL.md`](digital-vending/PROTOCOL.md) · Buyer steps: [`docs/public/BUY.md`](docs/public/BUY.md)

---

**Local-first sovereign node** for GrapheneOS + Termux (and desktop Linux/macOS).

Not a cloud AI product. Not a live DePIN network. Not an always-on oracle.

**Working branch:** [`TheRemoteViewer`](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/tree/TheRemoteViewer)  
**Truth file:** [`docs/REALITY.md`](docs/REALITY.md) — PROVEN means ran on a real device under user control.  
**Reproduce:** [`docs/REPRODUCE.md`](docs/REPRODUCE.md) · [`docs/TEST.md`](docs/TEST.md)

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
| Path B recognition loop | **OPERATIONAL** | collect → attest → verify → issue → install |
| Community Pool gross visibility | **OPERATIONAL** | public Solana memo volume; no custody |
| Validated-node count + tips | **OPERATIONAL** | per identity path; no central registry |
| Defense / Hydra multi-head | **PROVEN** | seal + verifier + quarantine deliver gate |
| MoE Stage B (dense) | **PROVEN** | TinyLlama + Qwen2.5-Coder via llama.cpp |
| MoE Stage C (sparse) | **PROVEN** | TinyMixtral-4x248M-MoE load + generate |
| Contribution ledger | **PROVEN** | offline JSONL hash-chain + verifier weight |
| Local operator UI | **PROVEN** | `http://127.0.0.1:8765/` — copy-to-Termux console |
| Mobile client UI | **DEMONSTRATED** | Hub / Viewer Profile / Shop / Talk on-device 2026-08-13 |
| Public buy page | **OPEN** | `digital-vending/buy.html` + QR |
| Local RAG | **SCAFFOLD** | BM25 + TF-IDF + session memory + chat |
| Chain settlement | **NOT STARTED** | |

---

## 60-second paths

### Path B (Independent Completion)

```bash
bash modules/path-b-recognition/collect-proof.sh
bash modules/path-b-recognition/make-attestation.sh
# Transfer attestation → originator → receive founding-member-*.json
bash modules/path-b-recognition/install-founding.sh /path/to/founding-member-*.json
```

Full guide: [`docs/public/PATH-B-BUILDER.md`](docs/public/PATH-B-BUILDER.md)

### Phone (Termux)

```bash
pkg update && pkg install git python -y
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
```

### Operator UI

```bash
bash apps/ui/serve-ui.sh
# http://127.0.0.1:8765/
```

### Pool / Nodes

```bash
bash modules/pool/gross.sh
bash modules/nodes/count.sh
```

---

## Layout

```text
docs/public/PATH-B-BUILDER.md   Independent Completion guide
docs/public/PATH-B-FINISHED.md  FINISHED checklist
docs/REPRODUCE.md               Third-party verification bootstrap
docs/public/REVIEW-AND-CONTRIBUTION.md  Review posture
modules/path-b-recognition/     Recognition package
modules/pool/                   Community Pool gross visibility
modules/nodes/                  Validated-node count + tips
digital-vending/buy.html        Public storefront (Pay + QR)
optical-airgap/                 PROVEN transport
modules/defense/                Hydra multi-head (PROVEN)
modules/integrity-verifier/     First validator role (PROVEN)
apps/ui/                        Local operator console (PROVEN)
docs/REALITY.md                 Status authority
```

---

## What this is not

- No required cloud login  
- No public hosted EI endpoint  
- No live multi-operator DePIN  
- No free packs via Path B  
- Keys, GGUFs, personal notes, and ledger events stay on **your** device  

---

## License

See [LICENSE](LICENSE).
