# The Remote Viewer — Native Stack Status

**Open Source** · **Native Stack 100%** · **No Blockchain Lock-in**

**Updated:** 2026-09-12  
**Authority:** [`docs/REALITY.md`](docs/REALITY.md) · [`docs/SCAFFOLD-HOLD.md`](docs/SCAFFOLD-HOLD.md)

---

## Live Products

| Product | Source | Status |
|---------|--------|--------|
| **Viewer Hub** | `apps/hub` | ⚠️ **HOST PARTIAL** — canon [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me) (`/` `/login` up; `/hub*` 404 until Re-Publish). Old host is not canonical. |
| **Command Deck** | `apps/command-deck` | ✅ **LIVE** — Synapse, God's Eye, Mesh Board, HUB |
| **Optical Air-Gap** | `optical-airgap/` | ✅ **PROVEN** — Path B, GrapheneOS verified |
| **Local Operator UI** | `apps/ui/` | ✅ **PROVEN** — `bash apps/ui/serve-ui.sh` |

---

## What Is Built (100% Native Stack)

✅ **Viewer Hub**
- TanStack Start (native TypeScript full-stack)
- Better Auth (open-source auth)
- PGLite/Neon (serverless postgres)
- Ed25519 keys (client-side, on-device)
- Red/Blue briefing UI
- Profile vault
- Daily watch
- Public card (`/v/$handle`)

✅ **Optical Air-Gap**
- age encryption
- Soliton LT compression
- QR code offline gate
- GrapheneOS verified
- Termux tested
- Vendor-locked CLI

✅ **Path B Posture Packs**
- USDC memo system (Solana testnet for signal only)
- Posture Lite (11 USDC memo)
- Posture Pack (25 USDC memo)
- No private key custody

---

## What Is NOT Built (Intentionally Held)

| Item | Reason | Status |
|------|--------|--------|
| **Solana Track A** — `trv_governance` | Needs external Anchor build host; not included | 🔴 **SCAFFOLD** |
| **EVM Contracts** — `contracts/` | Parallel scaffold, not active | 🔴 **HELD** |
| **Mobile (Expo)** — `apps/mobile` | Parked, not maintained | 🔴 **PARKED** |
| **Web (Vite)** — `apps/web` | Superseded by Hub; left as reference | 🔴 **LEGACY** |

**This is intentional.** We are 100% native stack + open-sourced. No blockchain smart contracts, no app-store clients, no legacy code in the live path.

---

## Economics

**Hub Pricing** (locked in `docs/VALUE.md`):
- $10/month or $50/year
- Yearly saves 46%
- Organization tier: $1,200/year
- 80/10/10 revenue split + 5% secondary

**Posture Packs** (testnet signal only):
- TRV Posture Lite: 11 USDC memo
- TRV Posture Pack: 25 USDC memo

---

## Developer Setup

### Live Viewer Hub

```bash
cd apps/hub
npm install
npm run dev
# http://localhost:3000
```

### Optical Air-Gap

```bash
bash modules/defense/integrity-pulse.sh
bash apps/ui/serve-ui.sh
# http://127.0.0.1:8765/
```

---

## What Must Not Be Contradicted

1. **`apps/hub` is the LIVE product.** Not `apps/web` or `apps/mobile`.
2. **Track A (Solana) is SCAFFOLD.** Not mainnet. Not audited. Requires external build host.
3. **No blockchain lock-in.** Hub runs without any chain. Testnet memos are signal only.
4. **100% open source.** Native TypeScript stack. Postgres. age encryption. GrapheneOS tested.
5. **No fake "LIVE ATO" claims.** This is a defense posture tool, not a FEDRAMP or certified product.
6. **Hub-to-live gap (#55):** `/hub/node` returns dark-path; republish from `apps/hub` needed to ship.

---

## Next Hard Gate

**Build infrastructure for native stack at scale:**
- [ ] GitHub Codespaces remote dev
- [ ] Containerized optical air-gap
- [ ] Wear OS companion (native Android)
- [ ] C2PA media signing

**Never:**
- Blockchain smart contract deployment
- Centralized authentication
- Closed-source dependencies
- App store release

---

## Links

- **Live:** [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me)
- **Docs:** [`docs/REALITY.md`](docs/REALITY.md)
- **Holdings:** [`docs/SCAFFOLD-HOLD.md`](docs/SCAFFOLD-HOLD.md)
- **License:** [LICENSE](LICENSE) — Open Source
