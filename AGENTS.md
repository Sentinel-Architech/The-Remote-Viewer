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

## Key Paths

| Path | Role |
|------|------|
| `apps/hub` | Live product – build and deploy this |
| `apps/hub/src/routes/hub/native.tsx` | **`/hub/native`** – identity + MoE security UI |
| `apps/hub/src/providers/NativeIdentityProvider.tsx` | On-device Ed25519 |
| `apps/hub/src/components/NativeDashboard.tsx` | Composed native UI |
| `apps/hub/src/lib/sentinel.ts` | Hub bridge to MoE |
| `sentinel-security-protocol/` | Systemwide native MoE backbone |
| `mcp-servers/trv-context/` | MCP tools |
| `BUILD-AND-DEPLOY.md` | One-shot steps |
| `docs/DUAL-MODE-SOVEREIGNTY.md` | Dual-mode law |

## When Adding Features

- Prefer native modules over external SaaS.
- Keep Hub buildable with zero Solana packages.
- Preserve individual override in enforcement paths.
- Use `@/` path alias (maps to `apps/hub/src/*`).

## Deploy

Deploy `apps/hub` to any Node host. No blockchain endpoint required for core operation.

## Success

`cd apps/hub && npm install && npm run build` succeeds and `/hub/native` renders → primary product is deployable.
