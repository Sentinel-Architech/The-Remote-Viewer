# The Remote Viewer (TRV) / The Sentinel

**New here or not technical?** → Start with **[START_HERE.md](START_HERE.md)**  
It is written for complete beginners (college freshman level).

**Status authority:** [`docs/REALITY.md`](docs/REALITY.md).  
**Working branch:** [`TheRemoteViewer`](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/tree/TheRemoteViewer)

**Brand:** Sentinel = protector of the core ([`branding/BRAND.md`](branding/BRAND.md)).  
Logo: `branding/sentinel-logo.png` · Hero: `branding/remote-viewer-hero.png` (upload masters if missing).

**Historical note:** Unrelated to Technical Remote Viewing / PSI TECH / Ed Dames methodology.  
This project is a local-first software system for digital sovereignty **plus** a hosted Viewer Hub.

**Solo-built · local-first node · zero-custody packs · optical air-gap · live Viewer Hub**

---

## Live Viewer Hub (hosted DApp)

**This is the product Remote Viewers use today. It is not a scaffold.**

| | |
|--|--|
| **Live** | [sentinelsecurityprotocol.grok.me](https://sentinelsecurityprotocol.grok.me) |
| **Source** | [`apps/hub`](apps/hub) |
| **Status** | **LIVE** as of 2026-08-20 |

Shipped on the hub:

- Sign-in (Google / X / email)
- Age + OFAC gate
- **Mandatory one-time briefing** — 12 stations, no skip, no close, seals `tutorial_at`
- Daily Watch — Viewers intercept hostile packets to defend The Sentinel, then claim TRV
- Dedicated profile vault (`/hub/profile`) — portrait, identity extras, finances, docs, live icon
- Public Viewer card (`/v/$handle`)
- Command, OS, live, people, make, rails, Citizen lock (on-device hash)
- **SENTINEL OS jack-in** — 3D neuron flight on Defend / OS. Scan, name, pulse. Catalog writes OS memory. A landed pulse counts as daily watch.

`apps/web` is the **old Vite scaffold**. Do not treat it as the product UI.

The hub is a **hosted** Viewer surface (Better Auth + Postgres). It does **not** replace the local-first optical / Path B node, and it is **not** company recovery of age keys. Destroy = Restart still holds on the local path.

---

## Track A — Solana governance (SCAFFOLD)

On-chain entitlement, nodes, open voting, VALUE splits — **not mainnet, not audited.**

| Item | Location |
|------|----------|
| Program | `solana/programs/trv_governance` |
| Instruction index | [`solana/PROGRAM.md`](solana/PROGRAM.md) |
| Toolchain | Anchor **0.30.1** · Solana **1.18.x** · Rust **1.79** · CI only |
| Pixel | Client/reader — **no** Anchor SBF build |
| VALUE splits | Digital **80/10/10** · NFT primary **80/10/10** · secondary **5%** creator |
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
| **Viewer Hub DApp** | **LIVE** — [`apps/hub`](apps/hub) · briefing · daily watch · SENTINEL OS jack-in (source; live after republish) · profile vault |
| Optical air-gap | PROVEN (see REALITY) |
| Digital vending Path B | PROVEN |
| Solana `trv_governance` | **SCAFFOLD** — CI build gate |
| Mobile Expo client | PARKED on Graphene |
| EVM parallel | Learning; 9/9 on Pixel Anvil |

---

## 60-second paths

### Viewer Hub

```bash
cd apps/hub
npm install
npm run dev
# http://127.0.0.1:8080/
```

Hosted: [sentinelsecurityprotocol.grok.me](https://sentinelsecurityprotocol.grok.me)

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

### Operator UI (local)

```bash
bash apps/ui/serve-ui.sh
# http://127.0.0.1:8765/
```

---

## What this is not

- No company-held key recovery. Lose the age secret → start over (intentional).
- No required cloud login for the **local-first node / optical path**.
- The **hosted Viewer Hub** does use accounts. That is a separate surface, documented in [`apps/hub`](apps/hub).
- No public hosted EI endpoint — local models stay on **your** device.
- No free packs via Path B.
- Keys, GGUFs, personal notes on the local path stay on **your** device.
- Solana governance is **not** live. Saying the hub is live is not saying the chain is live.

## License

See [LICENSE](LICENSE).
