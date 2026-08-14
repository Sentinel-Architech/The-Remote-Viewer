# TRV on Solana — Track A SCAFFOLD

## Required before deploy

1. Install Rust, Solana CLI, Anchor **0.30.x** on Linux/macOS (or use CI).
2. `anchor keys list` (or `solana-keygen`) → replace placeholder in:
   - `programs/trv_governance/src/lib.rs` (`declare_id!`)
   - `Anchor.toml` `[programs.*]`
3. `yarn && anchor build && anchor test`
4. Devnet only until audit.

## Instructions

`initialize` · `propose` · `vote` · `execute_if_threshold`

Authority-only voting is intentional scaffold; replace with SPL weight later.

## CI

`.github/workflows/solana.yml`

## Pixel

No Anchor build. See `docs/PIXEL-CLIENT.md`.
