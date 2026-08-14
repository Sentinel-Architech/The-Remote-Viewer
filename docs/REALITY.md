# Reality — 2026-08-14

## Direction

| Track | Role |
|-------|------|
| **Solana `solana/`** | **Track A** — intended chain |
| EVM `contracts/` | Parallel experiment |
| Mobile Expo | **Parked** (Pixel client later) |

## Solana scaffold

- `initialize` / `propose` / `vote` / `execute_if_threshold`
- CI: `.github/workflows/solana.yml`
- Program id placeholder until `anchor keys list`

## EVM scaffold

- TRVVotes + GovernanceCoordinator + flow tests (9 passed on device)
- CI: `.github/workflows/contracts-foundry.yml`
- Anvil only on Pixel; not mainnet

## Pixel-only operator

- GitHub SSH key generated; must be added after account login/password reset
- Until pull works: source of truth is GitHub remote
- Wallet/devnet client possible; program build via CI or other machine

## Path B founding members: **0**

## Not done

Audit · Solana devnet deploy · Realms · Mainnet · Mobile runtime unpark
