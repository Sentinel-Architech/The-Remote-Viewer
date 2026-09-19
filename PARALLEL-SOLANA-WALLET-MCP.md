# Parallel Tracks + Dual-Mode Sovereignty + Sentinel Security Protocol

**Branch:** `feature/parallel-solana-wallet-mcp`  
**PR:** https://github.com/Sentinel-Architech/The-Remote-Viewer/pull/102  

## Core Design Law

**The Remote Viewer is designed to be used as an individual, yet equally enhanced or whole, under ultimate protection.**

- Individual mode: fully sovereign, local MoE evaluation, ultimate local protection.
- Enhanced / Whole-Network mode: same native primitives amplified across nodes for collective strength.
- Ultimate protection in both modes is provided exclusively by the **Sentinel Security Protocol** (native Mixture of Experts).

See `docs/DUAL-MODE-SOVEREIGNTY.md` for the formal statement.

## Non-Negotiable Rules

1. 100% native stack. Fully operational offline.
2. Primary identity = on-device Ed25519 + Better Auth + optical air-gap.
3. Solana remains optional.
4. Sentinel Security Protocol (MoE) is the exclusive systemwide security backbone.
5. Individual sovereignty is never sacrificed for collective features.

## Current Components

| Component | Purpose | Mode Support |
|-----------|---------|--------------|
| `NativeIdentityProvider` | Ed25519 citizen identity | Individual (primary) |
| `sentinel-security-protocol/` | Native MoE security backbone | Individual + Enhanced/Whole |
| `SolanaProvider` + governance | Optional on-chain bridge | Optional in both modes |
| MCP Context Server | Local context for agents | Native, both modes |

The architecture supports “alone and fully protected” and “together and ultimately protected” without contradiction.
