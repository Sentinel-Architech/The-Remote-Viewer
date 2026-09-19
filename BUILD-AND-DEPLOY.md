# Build and Deploy – The Remote Viewer

**Goal:** Any AI or CI can clone this repository and produce a running deployment without tribal knowledge.

## Quick Start (Hub – primary product)

```bash
git clone -b feature/parallel-solana-wallet-mcp https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer/apps/hub
npm install
npm run dev
# → http://localhost:8080
# Native stack page: http://localhost:8080/hub/native
```

Production build:

```bash
cd apps/hub
npm install
npm run build
npm run preview
```

## Native route (verify on the spot)

After `npm run dev`, open **`/hub/native`**.

That route mounts:

- `NativeIdentityProvider`
- `CitizenRegistration` (on-device Ed25519)
- `SecurityStatus` (native MoE decision)
- `ContinuityBadge`

No Solana packages required.

## Native Modules on This Branch

| Path | Purpose |
|------|---------|
| `apps/hub/src/routes/hub/native.tsx` | Live route `/hub/native` |
| `apps/hub/src/providers/NativeIdentityProvider.tsx` | On-device identity |
| `apps/hub/src/providers/SolanaProvider.tsx` | Optional passthrough |
| `apps/hub/src/lib/sentinel.ts` | Hub ↔ MoE bridge |
| `apps/hub/src/components/NativeDashboard.tsx` | Composed UI |
| `sentinel-security-protocol/` | MoE backbone |
| `mcp-servers/trv-context/` | MCP server |

## Design Constraints (do not violate)

1. 100% native stack for the Hub – no mandatory Solana.
2. Individual + enhanced/whole dual-mode under Sentinel Security Protocol (MoE).
3. Continuous open-source advancement via `.github/workflows/sentinel-continuous.yml`.
4. Solana is optional only.

## Sentinel Security Protocol (standalone)

```bash
cd sentinel-security-protocol
npm install
npm run build
npm run smoke
```

## MCP Context Server

```bash
cd mcp-servers/trv-context
npm install
npm run dev
```

## Deploy Targets

Hub is a standard Vite + TanStack Start Node app. Deploy to Vercel, Railway, Fly, Docker, or any Node host. **No blockchain required.**

## Success Criteria

- [ ] `cd apps/hub && npm install && npm run build` succeeds
- [ ] Hub serves without Solana packages
- [ ] `/hub/native` renders registration + security status
- [ ] `sentinel-security-protocol` builds and smoke passes

See also: `AGENTS.md`
