# Build and Deploy – The Remote Viewer

**Goal:** Any AI or CI can clone this repository and produce a running deployment without tribal knowledge.

## Quick Start (Hub – primary product)

```bash
git clone -b feature/parallel-solana-wallet-mcp https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer/apps/hub
npm install
npm run dev
# → http://localhost:8080
```

Production build:

```bash
cd apps/hub
npm install
npm run build
npm run preview
```

## Native Modules Added on This Branch

| Path | Purpose | Build |
|------|---------|-------|
| `apps/hub/src/providers/NativeIdentityProvider.tsx` | On-device Ed25519 identity | Part of Hub |
| `apps/hub/src/providers/SolanaProvider.tsx` | Optional Solana passthrough | Part of Hub (no extra deps) |
| `apps/hub/src/lib/sentinel.ts` | Hub ↔ MoE bridge | Part of Hub |
| `apps/hub/src/components/*` | Registration, Security, Dashboard | Part of Hub |
| `sentinel-security-protocol/` | Native MoE security backbone | `cd sentinel-security-protocol && npm install && npm run build` |
| `mcp-servers/trv-context/` | MCP context server | `cd mcp-servers/trv-context && npm install && npm run dev` |
| `programs/trv_governance/` | Optional Solana program (scaffold) | Requires Anchor; not required for Hub |

## Design Constraints (do not violate)

1. 100% native stack for the Hub – no mandatory Solana or external chain.
2. Individual + enhanced/whole dual-mode under Sentinel Security Protocol (MoE).
3. Continuous open-source advancement via `.github/workflows/sentinel-continuous.yml`.
4. Solana is optional only.

## Wire Native Dashboard (optional integration step)

In any Hub route or layout that should surface the native stack:

```tsx
import { NativeIdentityProvider } from "@/providers/NativeIdentityProvider";
import { NativeDashboard } from "@/components/NativeDashboard";

export default function Page() {
  return (
    <NativeIdentityProvider>
      <NativeDashboard mode="individual" />
    </NativeIdentityProvider>
  );
}
```

Adjust the import alias (`@/`) to match the Hub’s existing `tsconfig` paths.

## Sentinel Security Protocol (standalone)

```bash
cd sentinel-security-protocol
npm install
npm run build
npx tsx src/__tests__/moe.smoke.ts
```

## MCP Context Server

```bash
cd mcp-servers/trv-context
npm install
npm run dev
```

Register in your agent MCP config pointing at `src/index.ts`.

## Deploy Targets

- **Vercel / Netlify / Railway / Fly / Docker:** Hub is a standard Vite + TanStack Start Node app.
- **Self-hosted:** `npm run build` then serve the output; or use the existing Containerfile patterns in the repo.
- **No blockchain required** for Hub deployment.

## CI

`.github/workflows/sentinel-continuous.yml` runs on push, PR, and daily schedule to keep open-source health checks alive.

## Success Criteria for “build on the spot”

- [ ] `cd apps/hub && npm install && npm run build` succeeds
- [ ] Hub serves without Solana packages installed
- [ ] `NativeIdentityProvider` and `NativeDashboard` import cleanly
- [ ] `sentinel-security-protocol` builds with `tsc`
- [ ] MCP server starts with `npm run dev`

If any step fails, prefer fixing the native stack over adding external dependencies.
