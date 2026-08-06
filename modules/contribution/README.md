# Contribution Module (Offline-First)

Local contribution ledger. First code step toward AR design in `TOKENOMICS.md`.
**Does not** mint tokens, talk to a chain, or phone home.

See **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** for the staged ladder.

## Files

| Script | Purpose |
|--------|---------|
| `record.sh` | Append one JSONL event |
| `status.sh` | Dir/file presence + last events |
| `tally.sh` | Counts by kind |
| `IMPLEMENTATION.md` | Stages 0–4 |

## Quick use

```bash
cd ~/The-Remote-Viewer

# After successful optical e2e
bash modules/contribution/record.sh optical_e2e 1 "peel ok"

# After self-heal pulse
bash modules/contribution/record.sh verification 1 "optical-pulse ok"

bash modules/contribution/status.sh
bash modules/contribution/tally.sh
```

Data path: `~/.local/share/remote-viewer/contribution/events.jsonl`
