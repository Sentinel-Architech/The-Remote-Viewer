# TRV contracts — SCAFFOLD

**No production security claims. No audit. No mainnet advice.**

## Layout

| Path | Role |
|------|------|
| `src/TRVVotes.sol` | ERC20 + Votes token (scaffold mint) |
| `src/GovernanceCoordinator.sol` | OZ Governor stack |
| `script/DeployGovernance.s.sol` | Local/testnet deploy |
| `test/*.t.sol` | Smoke tests |

## Commands

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std
forge build
forge test -vv
```

Deploy (local anvil example):

```bash
anvil &
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
forge script script/DeployGovernance.s.sol:DeployGovernance --rpc-url http://127.0.0.1:8545 --broadcast
```

## Values

Does not undercut locked floors (`docs/locked/19` etc.). Content policy is not on-chain here.
