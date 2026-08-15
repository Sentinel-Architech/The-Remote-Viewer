# Solana — trv_governance

**Scaffold / Track A.** Not PROVEN on-chain. [docs/REALITY.md](../docs/REALITY.md)

| Item | State |
|------|--------|
| Anchor | **0.32.1** (not 0.30.x) |
| Program | `programs/trv_governance` |
| CI build | **Blocked** — [docs/CI-BLOCKER.md](../docs/CI-BLOCKER.md) |
| Devnet | [DEVNET.md](DEVNET.md) only after green `.so` |
| Protocol | [docs/PROTOCOL.md](../docs/PROTOCOL.md) §4 |

**PROVEN Solana today:** Path B **USDC + memo** as payment *signal* (`digital-vending/`) — not this program.

## Before deploy

1. Build host with platform-tools Cargo ≥ 1.85 (or newer Foundation image)  
2. `anchor keys list` → replace `declare_id!` + `Anchor.toml`  
3. `anchor build` · `anchor test` · devnet only  

Never commit keypairs. Pixel/Termux ≠ Solana build host.
