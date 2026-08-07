# TRV Digital Vending — Product (Phase 4)

**Phone-first seller station.** Path B = Solana USDC memo + age1 drop.

## Rails

| Rail | Role |
|------|------|
| **USDC + memo** | Payment signal (Path B) |
| **age1…** | Buyer public key |
| **age + Soliton LT** | Delivery |
| **sales.log** | Local append-only record |
| **SPL TRV mint** | Deferred (no aarch64 CLI) |

## Manual sale

```bash
bash seller-ops.sh deliver trv-posture-lite 'age1...'
bash seller-ops.sh log      # full sales.log
bash seller-ops.sh status   # chute + last 10 log lines
```

Log path: `$HOME/trv-deliver/sales.log` (never commits; local only). Full age1 strings are redacted to `age1…`.

## Auto sale (Path B)

See **AUTO-SOLANA.md**. Successful `auto-deliver` also appends to sales.log.

## Payloads

| ID | File |
|----|------|
| trv-posture-lite | payloads/trv-posture-lite.txt |
| trv-posture-pack | payloads/trv-posture-pack.txt |
| sentinel-skill-zk-01 | payloads/sentinel-zk-01.txt |
| hello-sentinel-demo | payloads/hello-sentinel.txt (test) |
