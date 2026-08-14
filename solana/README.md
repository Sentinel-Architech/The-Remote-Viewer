# TRV on Solana — SCAFFOLD (Track A)

**Intended** on-chain surface for The Remote Viewer.

EVM under `contracts/` is a **parallel experiment** only.

## Program instructions

| Ix | Behavior |
|----|----------|
| `initialize(threshold)` | Config PDA; sets `proposal_threshold` |
| `propose(hash)` | Create proposal PDA (authority only in scaffold) |
| `vote(weight)` | Add yes weight (authority scaffold) |
| `execute_if_threshold` | Sets `executed` if `yes_votes >= threshold` |

No CPI execution of arbitrary targets yet — flag only.

## CI

GitHub Action `.github/workflows/solana.yml` builds on push to `solana/**`.

## Local (laptop / CI runner)

```bash
cd solana
anchor build
anchor test   # when tests added
```

## Pixel 7

Client/wallet only. No Anchor build on Termux. Pull repo after GitHub SSH works.

## SPL mint helper

```bash
./scripts/create-spl-mint.sh
```

## Values

Respects `docs/locked/*`. Not audited. Not mainnet.
