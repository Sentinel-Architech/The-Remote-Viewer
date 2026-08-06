# Contribution Ledger — Implementation Steps

**Principle:** Offline-first. No mint. No chain required for local truth.

## Stage 0 — SCAFFOLD (done)

JSONL + `record` / `status` / `tally` · no network

## Stage 1 — Habit on device

```bash
bash modules/contribution/record.sh optical_e2e 1 "peel ok"
bash modules/contribution/status.sh
bash modules/contribution/tally.sh
```

## Stage 2 — Receipt integrity (done)

`prev` + `sha` on append · `verify.sh` fail closed

```bash
bash modules/contribution/verify.sh
```

## Stage 3 — Export for audit (done)

```bash
bash modules/contribution/export.sh
# → ~/.local/share/remote-viewer/contribution/exports/contribution-export-*.txt
```

Contents: event count, first/last ts, tip sha, counts by kind.  
**Omits:** notes, secrets, vault paths, raw JSONL.

Optional optical/age seal (you run manually):

```bash
age -r "$(cat "$HOME/vault-recipient.txt")" -o export.age /path/to/export.txt
```

## Stage 4 — Design only

Merkle batch roots · AR claims · optional L1 publish — after 1–3 are routine.

## Anti-goals

Phone-home · auto-broadcast · corporate mint · amounts-as-money
