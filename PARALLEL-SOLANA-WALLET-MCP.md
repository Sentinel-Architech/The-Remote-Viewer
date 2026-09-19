# Parallel Solana + Wallet + MCP Track

**Branch:** `feature/parallel-solana-wallet-mcp`  
**Status:** Skeleton landed – ready for full-force parallel development

## Tracks

### Track A – Solana / Rust (Anchor)
- Location: `programs/trv_governance/`
- Program ID placeholder: `TRVg0v3rnance11111111111111111111111111111`
- Instructions: `create_proposal`, `cast_vote`, `submit_posture_proof`
- State: `GovernanceState`, `Proposal`, `PostureRecord`
- Next: `anchor build`, keygen, real program ID, signature verification for posture proofs

### Track B – Zero-Friction Wallet + SSO
- Location: `apps/hub/src/providers/SolanaProvider.tsx`
- Wallet Adapter + SIWS skeleton
- `useSiwsAuth` hook ready for Better Auth / Ed25519 binding
- Next: install packages (`@solana/wallet-adapter-*`), wire into root layout, persist SIWS session

### Track C – Auto Context (MCP)
- Location: `mcp-servers/trv-context/`
- Tools: `get_hub_profile`, `get_optical_airgap_status`, `get_wallet_context`
- Next: `npm install && npm run dev`, register in local Copilot / Cursor MCP config, wire real data sources

## Parallel Rules
1. All three tracks are independent.
2. Solana is never required for the Viewer Hub to function.
3. Ed25519 citizen identity + optical air-gap remain the highest-trust path.
4. SIWS is the bridge between local identity and on-chain actions.

## Immediate Next Commands

```bash
# Track A
cd programs/trv_governance
anchor build   # after installing Anchor

# Track B
cd apps/hub
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui \
  @solana/wallet-adapter-wallets @solana/web3.js

# Track C
cd mcp-servers/trv-context
npm install
npm run dev
```

Ship in parallel. No blockers.
