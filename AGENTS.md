# AGENTS.md – Instructions for AI Builders

This repository is structured so any capable AI can clone, build, and deploy without prior context.

## Primary Product

**Viewer Hub** = `apps/hub`  
Stack: TanStack Start + Vite + Better Auth + PGLite + React 19  
Native identity and Sentinel Security components live under `apps/hub/src/`.

```bash
cd apps/hub && npm install && npm run dev    # develop
cd apps/hub && npm install && npm run build  # production
```

## Non-Negotiable Rules

1. **100% native stack** for the Hub. Do not make Solana or any chain required.
2. **Individual + enhanced/whole** dual-mode under the Sentinel Security Protocol (native MoE).
3. **Ultimate protection** = `sentinel-security-protocol/` (Mixture of Experts). Do not replace with a cloud model as the backbone.
4. **Continuous open source** – prefer public, auditable changes. See `.github/workflows/sentinel-continuous.yml`.
5. Solana (`programs/trv_governance`, wallet adapters) is **optional only**.

## Key Paths

| Path | Role |
|------|------|
| `apps/hub` | Live product – build and deploy this |
| `apps/hub/src/providers/NativeIdentityProvider.tsx` | On-device Ed25519 identity |
| `apps/hub/src/components/NativeDashboard.tsx` | Composed native UI |
| `apps/hub/src/lib/sentinel.ts` | Hub bridge to MoE security |
| `sentinel-security-protocol/` | Systemwide native MoE security backbone |
| `mcp-servers/trv-context/` | MCP tools for agents |
| `docs/DUAL-MODE-SOVEREIGNTY.md` | Dual-mode design law |
| `docs/SENTINEL-CONTINUOUS-OPEN-SOURCE.md` | Continuous update design |
| `BUILD-AND-DEPLOY.md` | One-shot build/deploy steps |

## When Adding Features

- Prefer extending native modules over introducing external SaaS.
- Keep Hub buildable with zero Solana packages installed.
- Run or mirror the smoke test in `sentinel-security-protocol` when changing security logic.
- Preserve individual override rights in any enforcement path.

## Deploy

Hub is a standard Node/Vite app. Deploy `apps/hub` to Vercel, Railway, Fly, Docker, or any Node host. No blockchain endpoint is required for core operation.

## Success

If `cd apps/hub && npm install && npm run build` succeeds and the Hub serves, the primary product is deployable.
