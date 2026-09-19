# Parallel Tracks – Build-Ready

**PR:** https://github.com/Sentinel-Architech/The-Remote-Viewer/pull/102  

## For any AI or CI

1. Read `AGENTS.md`
2. Read `BUILD-AND-DEPLOY.md`
3. Primary deploy target: `apps/hub` → `npm install && npm run build`

## Design Laws

1. Individual + enhanced/whole under ultimate native MoE protection.
2. Sentinel continuously advances GitHub and The Remote Viewer in open source.
3. 100% native stack. Offline-capable. Solana optional. Override always available.

## Corrections already applied

- Circular import eliminated
- SolanaProvider has zero hard dependencies
- NativeIdentity resilient key generation
- Package exports and scripts fixed for drop-in builds

## Modules on this branch

| Module | Ready |
|--------|--------|
| Hub native identity + dashboard + security UI | Yes |
| Sentinel Security Protocol (MoE) | Yes – build + smoke |
| MCP context server | Yes |
| Continuous CI workflow | Yes |
| Optional Solana scaffold | Present, not required |

Clone → follow AGENTS.md → build Hub → deploy.
