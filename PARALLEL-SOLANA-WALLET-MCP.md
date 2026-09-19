# Parallel Solana + Wallet + MCP Track

**Branch:** `feature/parallel-solana-wallet-mcp`  
**PR:** https://github.com/Sentinel-Architech/The-Remote-Viewer/pull/102  
**Status:** Expanded skeletons – full-force parallel development active

## Tracks (Current State)

### Track A – Solana / Rust (Anchor)
- Location: `programs/trv_governance/`
- Root `Anchor.toml` configured for localnet + devnet
- Instructions: `init_governance`, `create_proposal`, `cast_vote`, `submit_posture_proof`
- State: `GovernanceState`, `Proposal`, `PostureRecord`
- Program ID still placeholder – run `anchor keys list` then update `declare_id!` and `Anchor.toml`
- Next concrete steps:
  1. `anchor build`
  2. Generate real keypair and replace program ID
  3. Implement Ed25519 / SIWS signature verification inside `submit_posture`
  4. Add vote tracking account to prevent double-voting

### Track B – Zero-Friction Wallet + SSO
- Location: `apps/hub/src/providers/SolanaProvider.tsx`
- See also: `apps/hub/SOLANA-WALLET-SETUP.md`
- Wallet Adapter (Phantom + Solflare) + SIWS helper
- `useSiwsAuth` ready for binding to Better Auth / on-device Ed25519
- Next concrete steps:
  1. Install the listed packages
  2. Wrap root layout with `<SolanaProvider>`
  3. Wire SIWS success into existing citizen identity flow
  4. Persist session so users are not re-prompted

### Track C – Auto Context (MCP)
- Location: `mcp-servers/trv-context/`
- Tools: `get_hub_profile`, `get_optical_airgap_status`, `get_wallet_context`
- TypeScript + stdio transport ready
- Next concrete steps:
  1. `npm install && npm run dev`
  2. Register in local Copilot / Cursor MCP config
  3. Replace placeholder responses with real Hub / optical / wallet state

## Parallel Rules (Rule of Law)
1. All three tracks remain independent.
2. Solana is never required for the Viewer Hub to function.
3. Ed25519 citizen identity + optical air-gap remain the highest-trust path.
4. SIWS is the only bridge between local identity and on-chain actions.
5. No new mandatory centralized services.

## Immediate Commands (run in parallel)

```bash
# Track A
cd programs/trv_governance && anchor build

# Track B
cd apps/hub
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react \
  @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js bs58

# Track C
cd mcp-servers/trv-context && npm install && npm run dev
```

Continue shipping. No blockers.
