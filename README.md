# The Remote Viewer — 100% Native Stack, Open Source

**Local-first. Defense-grade. No blockchain required.**

| | |
|--|--|
| **Starting-tech fund** | [gofund.me/1ffd2c150](https://gofund.me/1ffd2c150) |
| **Live X** | [@TRV_Architech](https://x.com/TRV_Architech) |
| **Canon (glass)** | [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me) — glass until payday Build + Re-Publish prove LIVE |
| **Technology** | TypeScript (TanStack Start) + PostgreSQL + Better Auth + age |
| **License** | Open Source (MIT) |
| **Working Branch** | `TheRemoteViewer` |

> Honest glass: do **not** treat the DApp as LIVE/PROVEN until payday Build + Re-Publish prove it on the canon host. Optical air-gap and local Hub remain the defend-grade path.

---

## What You Get

### Live Viewer Hub

**100% native stack. No chain dependency.**

```bash
cd apps/hub
npm install && npm run dev
# → http://localhost:3000
# TanStack Start + Better Auth + PGLite
```

**Features:**
- ✅ Citizen registration (on-device Ed25519)
- ✅ Daily watch (briefing + intercepts)
- ✅ Profile vault (encrypted notes)
- ✅ Public card (`/v/$handle`)
- ✅ SENTINEL OS jack-in (Command Deck integration)
- ✅ Red/Blue lens (bias detection)

### Optical Air-Gap (PROVEN)

**Defend-grade encryption. Works offline.**

```bash
bash modules/defense/integrity-pulse.sh
bash apps/ui/serve-ui.sh
# → http://127.0.0.1:8765/
# age + Soliton LT + QR offline
```

**Verified on:**
- ✅ GrapheneOS (reference)
- ✅ Termux (Pixel-class Android)
- ✅ Local macOS/Linux

### Command Deck (LIVE)

**Synapse + God's Eye + Mesh Board + HUB**

Located in `apps/command-deck/`. Control briefing, watch intercepts, manage posture.

---

## Open Source + Native Stack

**No blockchain lock-in.**

```
apps/hub/
  ├── TanStack Start (open-source SSR)
  ├── Better Auth (MIT open-source auth)
  ├── React + TypeScript
  └── PGLite/Neon (postgres, portable)

optical-airgap/
  ├── age encryption (open spec)
  ├── Soliton LT (compression)
  ├── QR offline (paulmillr/qr)
  └── CLI (bash + cargo, vendored)
```

**All MIT or Apache-2.0 licensed.** Fork freely. Run on your infrastructure.

See [docs/NATIVE-STACK.md](docs/NATIVE-STACK.md) for full tech breakdown.

---

## Quick Start

### 1. Run the Hub Locally

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer/apps/hub
npm install
npm run dev
```

### 2. Verify Optical Air-Gap

```bash
bash optical-airgap/modules/defense/integrity-pulse.sh
```

### 3. Deploy Hub to Your Infrastructure

```bash
# Option A: Vercel (serverless)
npm run deploy

# Option B: Docker (self-hosted)
docker build -t trv-hub .
docker run -p 3000:3000 trv-hub

# Option C: Railway, Render, fly.io
# Any Node.js host works
```

---

## What's NOT Included (Intentional)

| Item | Why | Path |
|------|-----|------|
| **Solana Track A** | Needs external build host | 🔴 SCAFFOLD |
| **EVM Contracts** | Not active | 🔴 HELD |
| **Mobile (Expo)** | Parked; use web | 🔴 PARKED |
| **Apps/Web (Vite)** | Superseded by Hub | 🔴 LEGACY |

**This is by design.** We ship what works. Solana governance is testnet-only and requires external Anchor infrastructure. Fork us and add it if you need it.

---

## Economics (Locked)

**Viewer Hub Subscription:**
- $10/month or $96/year (20% savings)
- Organization tier: $1,200/year
- 80/10/10 revenue split
- Self-hosted version: Run your own, no licensing fees

**Posture Packs** (testnet signals):
- TRV Posture Lite: 11 USDC memo
- TRV Posture Pack: 25 USDC memo

See [`docs/VALUE.md`](docs/VALUE.md).

---

## Resilience & Observability

| Doc | Purpose |
|-----|---------|
| [`docs/ERROR-BOUNDARY.md`](docs/ERROR-BOUNDARY.md) | Runtime error isolation for the Command Deck |
| [`docs/SENTRY.md`](docs/SENTRY.md) | Optional Sentry error tracking setup |
| [`docs/SANDBOX-JSX-NOTE.md`](docs/SANDBOX-JSX-NOTE.md) | Sandbox parse-error recovery notes |
| [`docs/CHAOS-ENGINEERING.md`](docs/CHAOS-ENGINEERING.md) | Chaos engineering practices + first experiment |

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [`STATUS.md`](STATUS.md) | What's LIVE, what's HELD, current state |
| [`docs/REALITY.md`](docs/REALITY.md) | Ground truth (all contradictions resolved) |
| [`docs/SCAFFOLD-HOLD.md`](docs/SCAFFOLD-HOLD.md) | Why Solana/EVM/Mobile are not shipped |
| [`docs/NATIVE-STACK.md`](docs/NATIVE-STACK.md) | Open source tech stack + roadmap |
| [`apps/README.md`](apps/README.md) | Client applications breakdown |
| [`optical-airgap/README.md`](optical-airgap/README.md) | Encryption + air-gap design |
| [`docs/ERROR-BOUNDARY.md`](docs/ERROR-BOUNDARY.md) | Runtime error isolation |
| [`docs/SENTRY.md`](docs/SENTRY.md) | Optional Sentry setup |
| [`docs/SANDBOX-JSX-NOTE.md`](docs/SANDBOX-JSX-NOTE.md) | Sandbox recovery notes |
| [`docs/CHAOS-ENGINEERING.md`](docs/CHAOS-ENGINEERING.md) | Chaos engineering + first experiment |

---

## License

**MIT License.** Use, modify, distribute freely. See [LICENSE](LICENSE).

---

## Fork & Deploy

```bash
# Clone your copy
git clone https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer

# Make it yours
git remote set-url origin https://github.com/YOUR-ORG/your-viewer.git
git push -u origin TheRemoteViewer

# Deploy native stack
cd apps/hub
npm install && npm run build
# Deploy to your Node host (Railway, Vercel, self-hosted)
```

**No licensing restrictions. No blocked forks. 100% open source.**

---

## Support

- **Issues:** [GitHub Issues](https://github.com/Sentinel-Architech/The-Remote-Viewer/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Sentinel-Architech/The-Remote-Viewer/discussions)
- **Security:** [SECURITY.md](SECURITY.md)

---

**Built in the open. Owned by you. No blockchain required.**
