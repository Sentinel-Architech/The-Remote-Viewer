# The Remote Viewer (TRV) / The Sentinel

**New here or not technical?** → Start with **[START_HERE.md](START_HERE.md)**  
It is written for complete beginners (college freshman level).

**Status authority:** [`docs/REALITY.md`](docs/REALITY.md).  
**Working branch:** [`TheRemoteViewer`](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/tree/TheRemoteViewer)

**Brand:** Sentinel = protector of the core ([`branding/BRAND.md`](branding/BRAND.md)).  
Logo: `branding/sentinel-logo.png` · Hero: `branding/remote-viewer-hero.png` (upload masters if missing).

**Historical note:** Unrelated to Technical Remote Viewing / PSI TECH / Ed Dames methodology.  
This project is a local-first software system for digital sovereignty.

**Solo-built · local-first · zero-custody · optical air-gap systems**

---

## Track A — Solana governance (SCAFFOLD)

On-chain entitlement, nodes, open voting, VALUE splits — **not mainnet, not audited.**

| Item | Location |
|------|----------|
| Program | `solana/programs/trv_governance` |
| Instruction index | [`solana/PROGRAM.md`](solana/PROGRAM.md) |
| Toolchain | Anchor **0.30.1** · Solana **1.18.x** · Rust **1.79** · CI only |
| Pixel | Client/reader — **no** Anchor SBF build |
| VALUE splits | Digital **95/5** · NFT primary **90/10** · secondary **5%** creator |
| Pool governance | [`docs/POOL-GOVERNANCE.md`](docs/POOL-GOVERNANCE.md) |
| Payments → sub | [`docs/PAYMENTS.md`](docs/PAYMENTS.md) |
| Authority keys | [`docs/AUTHORITY.md`](docs/AUTHORITY.md) |
| Identity recovery | [`docs/IDENTITY.md`](docs/IDENTITY.md) |
| Safety (locked) | [`docs/locked/SAFETY.md`](docs/locked/SAFETY.md) |

```bash
# Build host / CI only — not Termux
cd solana && npm install && anchor build && anchor test
```

---

## Path B (Independent Completion)

| Path | Count | Notes |
|------|------:|-------|
| **Path A** — Personal invitation | **1** | Originator |
| **Path B** — Independent completion | **0** | Verified finishers only |
| **Total Founding Sovereign Viewers** | **1** | |

Path B Independent Completion is open to any builder who completes the published checklist on a machine they control and submits offline attestation.  
Recognition is currently originator-verified.  
**Packs remain paid per item.** No free catalog items.

**Builder guide:** [`docs/public/PATH-B-BUILDER.md`](docs/public/PATH-B-BUILDER.md)  
**Reproduce:** [`docs/REPRODUCE.md`](docs/REPRODUCE.md)  
**Threat model:** [`docs/security/threat-model.md`](docs/security/threat-model.md)

---

## Buy packs (public)

**USDC on Solana · age-encrypted TRVL delivery · zero platform custody**

| Pack | Price | Memo |
|------|------:|------|
| **TRV Posture Lite** | 11 USDC | `TRV-Posture-Lite` |
| **TRV Posture Pack** | 25 USDC | `TRV-Posture-Pack` |
| ZK Membership Skill | Manual / XMR | `SENTINEL-ZK-01` |

**Sales address:** `HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv`

- **In-repo:** [`digital-vending/buy.html`](digital-vending/buy.html)
- Protocol: [`digital-vending/PROTOCOL.md`](digital-vending/PROTOCOL.md) · [`docs/public/BUY.md`](docs/public/BUY.md)

### After you pay

1. Create an age identity on **your** device (`age-keygen`). Keep the secret.
2. Send the seller only: your **`age1…` public key** + **tx signature**.
3. Receive a `.trvl` file → decrypt locally.

---

## Local node (GrapheneOS + Termux / desktop)

Not a cloud AI product. Not a live DePIN network. Not an always-on oracle.

**Truth file:** [`docs/REALITY.md`](docs/REALITY.md) — PROVEN means ran on a real device under user control.

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
bash scripts/chat.sh
```

---

## Status snapshot

Prefer [`docs/REALITY.md`](docs/REALITY.md) and [`STATUS.md`](STATUS.md) over any chat claim.

| Capability | Notes |
|------------|--------|
| Optical air-gap | PROVEN (see REALITY) |
| Digital vending Path B | PROVEN |
| Solana `trv_governance` | **SCAFFOLD** — CI build gate |
| Mobile Expo client | PARKED on Graphene |
| EVM parallel | Learning; 9/9 on Pixel Anvil |

---

## 60-second paths

### Path B

```bash
bash modules/path-b-recognition/collect-proof.sh
bash modules/path-b-recognition/make-attestation.sh
bash modules/path-b-recognition/install-founding.sh /path/to/founding-member-*.json
```

### Phone (Termux)

```bash
pkg update && pkg install git python age -y
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
```

### Operator UI

```bash
bash apps/ui/serve-ui.sh
# http://127.0.0.1:8765/
```

---

## What this is not

- No required cloud login  
- No public hosted EI endpoint  
- No free packs via Path B  
- Keys, GGUFs, personal notes stay on **your** device  

## License

See [LICENSE](LICENSE).
