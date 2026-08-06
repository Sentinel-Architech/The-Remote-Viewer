# Contribution Module (Offline-First)

Local contribution ledger. **No mint. No chain. No phone-home.**

Ladder: [IMPLEMENTATION.md](./IMPLEMENTATION.md)

## Commands

```bash
bash modules/contribution/record.sh <kind> [amount] [note]
bash modules/contribution/status.sh
bash modules/contribution/tally.sh
bash modules/contribution/verify.sh
bash modules/contribution/export.sh
```

Export path: `~/.local/share/remote-viewer/contribution/exports/`  
Redacted: counts + timestamps + tip sha only.
