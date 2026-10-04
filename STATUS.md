# The Remote Viewer — Native Stack Status

**Open Source** · **Native Stack 100%** · **No Blockchain Lock-in**

**Updated:** 2026-09-27  
**Authority:** [`AGENTS.md`](AGENTS.md) · [`docs/REALITY.md`](docs/REALITY.md) · [`docs/SCAFFOLD-HOLD.md`](docs/SCAFFOLD-HOLD.md)

---

## Live Products

| Product | Source | Status |
|---------|--------|--------|
| **Viewer Hub** | `apps/hub` | ⚠️ **HOST PARTIAL** — canon [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me) (`/` `/login` up; `/hub*` may 404 until Re-Publish). Git is the truth log. |
| **Command Deck** | `apps/command-deck` | Treat as separate surface. Do not use it to contradict Hub native law. |
| **Optical Air-Gap** | `optical-airgap/` | ✅ **PROVEN** — Path B, GrapheneOS verified |
| **Local Operator UI** | `apps/ui/` | ✅ **PROVEN** — `bash apps/ui/serve-ui.sh` |

---

## What Is Built (100% Native Stack)

✅ **Viewer Hub** (`apps/hub`, branch `TheRemoteViewer`)
- TanStack Start + Vite on **port 8080** (`npm run dev`)
- Better Auth + PGLite
- On-device Ed25519 via Web Crypto; private key non-extractable in IndexedDB
- `/hub/native` registration + prove-signature
- `/hub/node` in **source** wrapped with the same custody shell (`NodeNativeShell`)
- Solana provider exists and is **optional only**

✅ **Optical Air-Gap** — age + Soliton LT. Not rewritten from the Hub.

---

## What Is NOT Built (Intentionally Held)

| Item | Reason | Status |
|------|--------|--------|
| **Solana Track A** — `trv_governance` | Needs external Anchor build host | 🔴 **SCAFFOLD** |
| **EVM Contracts** — `contracts/` | Parallel scaffold, not active | 🔴 **HELD** |
| **Mobile (Expo)** — `apps/mobile` | Parked | 🔴 **PARKED** |
| **Web (Vite)** — `apps/web` | Superseded by Hub | 🔴 **LEGACY** |

---

## Economics

**Hub Pricing** (locked in `docs/VALUE.md` / issue #67):
- $10/month or **$50/year**
- Organization tier: $1,200/year

---

## Developer Setup

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer/apps/hub
npm install
npm run dev
# http://localhost:8080
# http://localhost:8080/hub/native
# http://localhost:8080/hub/node
```

---

## What Must Not Be Contradicted

1. **`apps/hub` is the product path.** Not `apps/web` or `apps/mobile`.
2. **Track A (Solana) is SCAFFOLD.** Not mainnet. Hub runs with zero chain packages required.
3. **Zero back doors**, including for the Architect. No master key. No remote recovery.
4. **We the People.** After live, the only option is to do better.
5. **No fake LIVE ATO / FEDRAMP.**
6. **Git vs host:** `/hub/node` in source ≠ automatically live on grok.me until republish.
7. **Port is 8080**, not 3000.
8. **Optical air-gap stays PROVEN** and is not rewritten from Hub edits.

---

## Links

- **Canon host:** [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me)
- **Law:** [`AGENTS.md`](AGENTS.md)
- **License:** [LICENSE](LICENSE)
