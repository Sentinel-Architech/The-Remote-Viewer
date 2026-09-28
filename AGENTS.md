# AGENTS.md – Instructions for AI Builders

This repository is structured so any capable AI can clone, build, and deploy without prior context.

## Primary Product

**Viewer Hub** = `apps/hub`  
Stack: TanStack Start + Vite + Better Auth + PGLite + React 19

```bash
cd apps/hub && npm install && npm run dev    # → http://localhost:8080
# Verify native stack: http://localhost:8080/hub/native
cd apps/hub && npm install && npm run build  # production
```

## Non-Negotiable Rules

1. **100% native stack** for the Hub. Do not make Solana or any chain required.
2. **Individual + enhanced/whole** dual-mode under the Sentinel Security Protocol (native MoE).
3. **Ultimate protection** = `sentinel-security-protocol/` (Mixture of Experts).
4. **Continuous open source** – see `.github/workflows/sentinel-continuous.yml`.
5. Solana is **optional only**.
6. **We the People.** This DApp is public infrastructure, not a private control plane.
7. **Zero back doors** — including for the Architect. No master key, no remote recovery, no operator override of Viewer keys.
8. **After it is live, the only allowed change is to do better.** Do not add custody, do not add a kill switch over the public, do not quietly take capability away. Fix, harden, and open more — that is the only path.

## Key Paths

| Path | Role |
|------|------|
| `apps/hub` | Live product – build and deploy this |
| `apps/hub/src/routes/hub/native.tsx` | **`/hub/native`** – identity + MoE security UI |
| `apps/hub/src/lib/native-stack.ts` | **Facade** – identity + security in one import |
| `apps/hub/src/lib/native-custody.ts` | Zero-custody guards |
| `apps/hub/src/providers/` | NativeIdentity + optional Solana |
| `apps/hub/src/components/native-stack/` | UI barrel |
| `sentinel-security-protocol/` | Systemwide native MoE backbone |
| `mcp-servers/trv-context/` | MCP tools |
| `BUILD-AND-DEPLOY.md` | One-shot steps |

## Preferred imports

```ts
import { evaluateHubSecurity, useNativeIdentity } from "@/lib/native-stack";
import { NativeDashboard } from "@/components/native-stack";
import { NativeIdentityProvider } from "@/providers";
```

## When Adding Features

- Prefer native modules over external SaaS.
- Keep Hub buildable with zero Solana packages.
- Preserve individual override in enforcement paths (Viewer over bot — never the reverse).
- Use `@/` path alias (maps to `apps/hub/src/*`).
- Do not introduce a privilege that the public cannot audit in this repository.

## Deploy

Deploy `apps/hub` to any Node host. No blockchain endpoint required for core operation.

## Success

`cd apps/hub && npm install && npm run build` succeeds and `/hub/native` renders → primary product is deployable.
