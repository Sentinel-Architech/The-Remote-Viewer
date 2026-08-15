# Custody ops (SCAFFOLD)

Zero **platform custody of Viewer vault keys**. Ops keys for **sales and pool** are different.

## Pack sales address (USDC)

- Address published in README is a **treasury receive** address for packs.
- **Required practice:** cold or hardware-backed key; not Termux hot wallet for large balances.
- Document rotation: new address → update README + buy.html + PROTOCOL in one commit.
- Memo-based correlating of payments stays as designed; do not reuse memos across customers.

## Community pool

- Prefer **on-chain PDA** under `trv_governance` when live (see POOL-GOVERNANCE).
- Any off-chain USD leg: governed off-ramp only; FDIC only applies to bank deposits, not SOL/USDC in a program.
- Never co-mingle personal rent money with pool without public record.

## Authority (program)

See `docs/AUTHORITY.md`. Deployer key ≠ sales key ≠ personal hot wallet.

## Incident

If a sales key is suspected compromised: stop publishing it, move receive address, notify open orders via existing buyer channels, update docs same day.
