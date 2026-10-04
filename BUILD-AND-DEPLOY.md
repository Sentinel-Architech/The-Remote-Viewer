# Build and Deploy – The Remote Viewer

**Goal:** Any AI or CI can clone this repository and produce a running deployment without tribal knowledge.

**Law:** `AGENTS.md` on branch `TheRemoteViewer`. Hub is 100% native. Solana is optional. Zero back doors, including for the Architect.

## Quick Start (Hub – primary product)

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer/apps/hub
npm install
npm run dev
# → http://localhost:8080
# Native stack: http://localhost:8080/hub/native
# Node + same custody: http://localhost:8080/hub/node
```

Production build:

```bash
cd apps/hub
npm install
npm run build
npm run preview
```

Do not document port 3000. `package.json` binds Vite to **8080**.

## Native routes (verify on the spot)

After `npm run dev`:

- **`/hub/native`** — `NativeIdentityProvider` + registration + MoE status
- **`/hub/node`** — same identity shell + local node runtime

Host publish can still lag git. Source having the route is not the same as the public host serving it.

## Native Modules on This Branch

| Path | Purpose |
|------|---------|
| `apps/hub/src/routes/hub/native.tsx` | Route `/hub/native` |
| `apps/hub/src/routes/hub/node.tsx` | Route `/hub/node` |
| `apps/hub/src/components/NodeNativeShell.tsx` | Shared zero-custody wrap |
| `apps/hub/src/providers/NativeIdentityProvider.tsx` | On-device Ed25519 |
| `apps/hub/src/lib/native-custody.ts` | No extractable keys / no private persist |
| `apps/hub/src/providers/SolanaProvider.tsx` | Optional passthrough |
| `apps/hub/src/lib/sentinel.ts` | Hub ↔ MoE bridge |
| `sentinel-security-protocol/` | MoE backbone |

## Design Constraints (do not violate)

1. 100% native stack for the Hub – no mandatory Solana.
2. Individual + enhanced/whole dual-mode under Sentinel Security Protocol (MoE).
3. Continuous open-source advancement via `.github/workflows/sentinel-continuous.yml`.
4. Solana is optional only.
5. After live: only improve. No new custody. No kill switch over the public.

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

Hub is a standard Vite + TanStack Start Node app. Deploy to any Node host. **No blockchain required.**

## Success Criteria

- [ ] `cd apps/hub && npm install && npm run build` succeeds
- [ ] Hub serves without Solana packages
- [ ] `/hub/native` renders registration + security status
- [ ] `/hub/node` mounts the same identity shell in source
- [ ] `sentinel-security-protocol` builds and smoke passes

See also: `AGENTS.md`
