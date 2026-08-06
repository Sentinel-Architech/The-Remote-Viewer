# Contribution Ledger — Implementation Steps

**Principle:** Offline-first. No mint. No chain required for local truth.

## Stage 0 — SCAFFOLD (done)

| Item | Status |
|------|--------|
| Append-only JSONL | Yes |
| `record.sh` / `status.sh` / `tally.sh` | Yes |
| No network | Yes |

## Stage 1 — Habit on device

```bash
bash modules/contribution/record.sh optical_e2e 1 "peel ok"
bash modules/contribution/record.sh verification 1 "optical-pulse ok"
bash modules/contribution/status.sh
bash modules/contribution/tally.sh
```

## Stage 2 — Receipt integrity (code present)

| Item | Status |
|------|--------|
| `prev` + `sha` on each new event | Yes (`record.sh`) |
| `verify.sh` walks chain, fail closed | Yes |

```bash
bash modules/contribution/record.sh presence 1 "check-in"
bash modules/contribution/verify.sh
```

Note: events recorded **before** Stage 2 lack `prev`/`sha` and will fail verify until you start a fresh file or only verify post-chain events. For a clean chain:

```bash
mv ~/.local/share/remote-viewer/contribution/events.jsonl \
   ~/.local/share/remote-viewer/contribution/events-prechain.jsonl.bak 2>/dev/null || true
bash modules/contribution/record.sh optical_e2e 1 "fresh chain"
bash modules/contribution/verify.sh
```

## Stage 3 — Export for audit

1. Redacted summary (kinds + counts + range)
2. Never export secrets
3. Optional optical seal of the export

## Stage 4 — Design only

Merkle roots, AR claims, optional L1 publish — after Stage 2 is routine.

## Anti-goals

Phone-home · auto-broadcast · corporate mint · treating amounts as money
