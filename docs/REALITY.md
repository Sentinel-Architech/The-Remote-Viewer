# Reality — 2026-08-14

## Chain direction

| Track | Role |
|-------|------|
| **Solana (`solana/`)** | **Track A — intended** on-chain surface for TRV |
| EVM (`contracts/`) | Parallel experiment (Governor patterns). Not Solana. |

## Solana

| Item | Status |
|------|--------|
| Anchor `trv_governance` | **SCAFFOLD** (initialize + propose hash) |
| SPL mint script | **SCAFFOLD** shell helper |
| Devnet / mainnet | **Not deployed** |
| Audit | **None** |

Build on a machine with Rust + Solana CLI + Anchor. Phone = RPC client later.

## EVM (still valid for learning)

- Anvil deploy + mint/delegate + 9 forge tests worked on-device.
- Hardened threshold 1 ether; executor not address(0).
- Not mainnet.

## Path B founding members: **0**

Mobile Expo runtime: **parked**.
