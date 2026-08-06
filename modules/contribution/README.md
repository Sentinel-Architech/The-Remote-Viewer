# Contribution Module (Offline-First)

Minimal local contribution ledger.

This is the first real code step toward the AR / contribution design in TOKENOMICS.md.
It does **not** mint tokens, talk to a chain, or phone home.

## What it does

- Records local contribution events (node uptime, verified work, etc.) as append-only JSON lines
- Lives entirely under `$HOME/.local/share/remote-viewer/contribution/`
- Can later be extended with cryptographic receipts or Merkle commitments

## Usage

```bash
# Record a contribution event
./modules/contribution/record.sh "uptime" 3600 "node online 1h"

# Show current local tally
./modules/contribution/tally.sh
```
