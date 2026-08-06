# Contribution Ledger — Implementation Steps

**Principle:** Offline-first. No mint. No chain required for local truth.

## Stage 0 — Done (SCAFFOLD)

| Item | Status |
|------|--------|
| Append-only JSONL under `~/.local/share/remote-viewer/contribution/` | Yes |
| `record.sh` | Yes |
| `tally.sh` | Yes |
| `status.sh` | Yes |
| No network | Yes |

## Stage 1 — Habit on device (do this next)

1. Record real local work kinds only:
   - `uptime` — node/session minutes
   - `optical_e2e` — successful e2e runs
   - `verification` — local checks passed
   - `presence` — intentional check-in
   - `storage` — capacity offered (local claim only)
2. After optical e2e success:
   ```bash
   bash modules/contribution/record.sh optical_e2e 1 "e2e peel ok"
   ```
3. After self-heal pulse OK:
   ```bash
   bash modules/contribution/record.sh verification 1 "optical-pulse ok"
   ```
4. Review:
   ```bash
   bash modules/contribution/status.sh
   bash modules/contribution/tally.sh
   ```

## Stage 2 — Receipt integrity (code next)

1. Add optional `sha256` of prior line (hash chain) on each append.
2. `verify.sh` walks the chain; fails closed on break.
3. Still offline. Still no token mint.

## Stage 3 — Export for audit

1. `export.sh` writes a redacted summary (kinds + counts + date range).
2. Never export `AGE-SECRET` or vault paths into the summary.
3. Optical-airgap can seal the export for handoff if needed.

## Stage 4 — Design only until Stage 2 is boring

- Merkle root over event batches
- AR reward *claims* (not auto-mint) from local tallies
- Optional later: publish root to a chain of your choosing

**Solana / any L1 is Stage 4+ and optional.** Local ledger is source of truth for contribution claims.

## Anti-goals

- Phone-home analytics
- Automatic public broadcast of events
- Corporate treasury mint keys
- Treating local amount fields as money

## Acceptance for “REALITY”

Ledger is REALITY when:

1. You can record and tally on GrapheneOS + Termux without network.
2. Files stay under user-controlled `$HOME/.local/share/remote-viewer/`.
3. Status is honest in `docs/REALITY.md`.
