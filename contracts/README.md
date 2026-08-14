# TRV EVM contracts — PARALLEL SCAFFOLD ONLY

> **Not Track A.** On-chain direction for The Remote Viewer is **Solana** (`../solana/`).
> This tree is an Ethereum/Foundry experiment (Governor patterns, local Anvil).

**No production security claims. No audit. No mainnet advice.**

## Layout

| Path | Role |
|------|------|
| `src/TRVVotes.sol` | ERC20 + Votes (owner mint) |
| `src/GovernanceCoordinator.sol` | OZ Governor; threshold **1 ether** |
| `script/DeployGovernance.s.sol` | Deploy; executor = deployer (not address(0)) |
| `test/*.t.sol` | Unit + propose/vote/queue/execute |

## Commands

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std
forge build && forge test -vv
```

## Values

Does not undercut `docs/locked/`.
