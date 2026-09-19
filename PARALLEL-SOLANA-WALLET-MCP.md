# Parallel Tracks + Sentinel Security Protocol

**Branch:** `feature/parallel-solana-wallet-mcp`  
**PR:** https://github.com/Sentinel-Architech/The-Remote-Viewer/pull/102  
**Status:** Native-first core + optional tracks + systemwide MoE security backbone

## Non-Negotiable Rules (Rule of Law)

1. The Viewer Hub is **100% native stack** and fully operational without Solana or any blockchain.
2. Primary identity = on-device Ed25519 + Better Auth + optical air-gap.
3. Solana is an optional parallel track only.
4. **Sentinel Security Protocol** with native Mixture-of-Experts (MoE) is the exclusive systemwide security backbone for the entire network.
5. No mandatory external services. Fully operational offline and air-gapped.

## Sentinel Security Protocol (New – Systemwide)

Location: `sentinel-security-protocol/`

- Backbone: native Mixture of Experts (Integrity, Identity, Posture, Network, Threat).
- Router aggregates expert scores into a single `SecurityDecision`.
- Enforcement produces allow / monitor / restrict / isolate recommendations.
- 100% local TypeScript. No cloud model required.
- Intended for exclusive use across Hub, Command Deck, and all nodes.

## Other Tracks

### Native Core (always on)
- `NativeIdentityProvider` – fully operational Ed25519 identity.

### Track A – Solana (optional)
- `programs/trv_governance/` + `Anchor.toml`

### Track B – Solana Wallet Bridge (optional)
- `SolanaProvider` gracefully degrades if packages absent.

### Track C – MCP Context (native)
- Fully operational with native defaults + `get_native_stack_status`.

The network is secured exclusively by the Sentinel Security Protocol under the native MoE backbone.
