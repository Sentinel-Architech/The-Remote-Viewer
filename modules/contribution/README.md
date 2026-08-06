# Contribution Module (Offline-First)

Local contribution ledger. **No mint. No chain. No phone-home.**

Full ladder: [IMPLEMENTATION.md](./IMPLEMENTATION.md)

## Commands

```bash
bash modules/contribution/record.sh <kind> [amount] [note]
bash modules/contribution/status.sh
bash modules/contribution/tally.sh
bash modules/contribution/verify.sh
```

Kinds: `uptime` | `optical_e2e` | `verification` | `presence` | `storage` | `other`

Path: `~/.local/share/remote-viewer/contribution/events.jsonl`

Stage 2: each new line carries `prev` + `sha` (SHA-256). `verify.sh` fails closed on break.
