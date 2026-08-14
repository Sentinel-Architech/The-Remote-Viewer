# TRV contracts — SCAFFOLD

**No production security claims. No audit. No mainnet advice.**

## Layout

```
contracts/
  foundry.toml
  src/GovernanceCoordinator.sol
  script/  (later)
  test/    (later)
```

## Compile (when Foundry is available)

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge build
```

## Known fix included

`proposalThreshold` (and related settings) **must** be explicitly overridden when inheriting both `Governor` and `GovernorSettings`. This scaffold does that.

## Values

Contract design must not undercut locked floors (`docs/locked/19` We the People, `16` no passable deepfakes, `21` cannabis acceptable as social policy — on-chain code does not implement content policy).
