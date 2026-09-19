# Parallel Tracks – 100% Native Stack Rule of Law

**Branch:** `feature/parallel-solana-wallet-mcp`  
**PR:** https://github.com/Sentinel-Architech/The-Remote-Viewer/pull/102  
**Status:** Native-first, fully operational core + optional parallel tracks

## Non-Negotiable Rules

1. The Viewer Hub is **100% native stack** and fully operational without Solana, without any external wallet, and without any blockchain dependency.
2. Primary identity = on-device Ed25519 + Better Auth + optical air-gap.
3. Solana is an **optional parallel track only**. It must never become required.
4. MCP context server is fully operational with native defaults and works offline.
5. No mandatory centralized services. Local-first is the law.

## Current Implementation

### Native Core (always on, fully operational)
- `apps/hub/src/providers/NativeIdentityProvider.tsx`
  - Citizen registration via Web Crypto Ed25519
  - Local persistence
  - Sign helper for local messages
  - Zero external dependencies beyond the browser

### Track A – Solana / Rust (optional)
- `programs/trv_governance/` + root `Anchor.toml`
- Instructions: init_governance, create_proposal, cast_vote, submit_posture_proof
- Remains scaffold until deliberately promoted

### Track B – Solana Wallet Bridge (optional)
- `apps/hub/src/providers/SolanaProvider.tsx`
- Gracefully degrades if packages are not installed
- SIWS is a bridge only – never the primary identity

### Track C – MCP Context (native, fully operational)
- `mcp-servers/trv-context/`
- Tools now include `get_native_stack_status`
- Reads local files when present; safe native defaults otherwise
- Works with zero Solana packages installed

## Immediate Commands

```bash
# Native identity is already present – no install required for core Hub

# Optional Solana track (only if desired)
cd apps/hub
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react \
  @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js bs58

# MCP (native)
cd mcp-servers/trv-context && npm install && npm run dev

# Anchor (optional)
cd programs/trv_governance && anchor build
```

The Hub remains fully operational under the native stack at every step.
