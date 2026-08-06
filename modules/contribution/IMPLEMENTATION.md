# Contribution Ledger — Implementation Steps

**Principle:** Offline-first. No mint. No chain required for local truth.

## Stage 0–3 — done

| Stage | Capability |
|-------|------------|
| 0 | JSONL record / status / tally |
| 1 | On-device habit |
| 2 | Hash chain + `verify.sh` |
| 3 | Redacted `export.sh` |

## Stage 4 — Commitments & claims (scaffold)

```bash
bash modules/contribution/verify.sh
bash modules/contribution/merkle-tip.sh
bash modules/contribution/claim.sh
```

| Output | Path |
|--------|------|
| Tip commitment | `~/.local/share/remote-viewer/contribution/commitments/` |
| AR claim (local) | `~/.local/share/remote-viewer/contribution/claims/` |

Details: [STAGE4.md](./STAGE4.md)

**Not included:** RPC, mint, auto-publish, Solana program.

## Anti-goals

Phone-home · auto-broadcast · corporate mint · amounts-as-money · fake “on-chain” status
