# Contribution Module (Offline-First)

Local contribution ledger. **No mint. No chain. No phone-home.**

- Ladder: [IMPLEMENTATION.md](./IMPLEMENTATION.md)
- Stage 4 boundaries: [STAGE4.md](./STAGE4.md)

## Commands

```bash
bash modules/contribution/record.sh <kind> [amount] [note]
bash modules/contribution/status.sh
bash modules/contribution/tally.sh
bash modules/contribution/verify.sh
bash modules/contribution/export.sh
bash modules/contribution/merkle-tip.sh
bash modules/contribution/claim.sh
```

Data under: `~/.local/share/remote-viewer/contribution/`
