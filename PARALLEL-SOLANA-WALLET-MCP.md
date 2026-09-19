# Parallel Tracks – Live Status

**Branch:** `feature/parallel-solana-wallet-mcp`  
**PR:** https://github.com/Sentinel-Architech/The-Remote-Viewer/pull/102  

## Design Law

The Remote Viewer is designed to be used as an **individual**, yet equally **enhanced or whole**, under **ultimate protection** provided exclusively by the native Sentinel Security Protocol (Mixture of Experts).

100% native stack. Fully operational offline. Solana remains optional.

## Parallel Tracks – Current State

### Native Core (always on)
- `NativeIdentityProvider` – Ed25519 citizen identity
- `docs/DUAL-MODE-SOVEREIGNTY.md` – formal dual-mode statement

### Sentinel Security Protocol (exclusive systemwide backbone)
- Full MoE: Integrity, Identity, Posture, Network, Threat experts
- Router + dual-mode evaluation (`individual` | `enhanced` | `whole-network`)
- Enforcement layer with local-override guarantee
- Hub integration (`apps/hub/src/lib/sentinel.ts`)
- UI component (`SecurityStatus.tsx`)
- Smoke test (`src/__tests__/moe.smoke.ts`)
- MCP tool: `evaluate_sentinel_security`

### Track A – Solana (optional)
- `programs/trv_governance/` with init, proposal, vote, posture instructions
- Posture proof clearly marked as optional parallel signal only

### Track B – Wallet Bridge (optional)
- `SolanaProvider` gracefully degrades when packages are absent

### Track C – MCP Context
- v0.3 with native stack status + Sentinel evaluation tool

All tracks continue to advance in parallel without blockers.
