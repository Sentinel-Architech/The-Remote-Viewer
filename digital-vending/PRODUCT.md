# TRV Digital Vending — Product (Phase 4)

**Phone-first seller station.** Auto path **B** = Solana USDC memo + age1 drop.

## Rails

| Rail | Role |
|------|------|
| **USDC + memo** | Payment signal (Path B) |
| **age1…** | Buyer public key |
| **age + Soliton LT** | Delivery |
| **SPL TRV mint** | Deferred (no aarch64 CLI) |

## Manual sale

```bash
bash seller-ops.sh deliver trv-posture-lite 'age1...'
```

## Auto sale (Path B)

See **[AUTO-SOLANA.md](./AUTO-SOLANA.md)** and **[buy.html](./buy.html)**.

```bash
export SALES_ADDRESS='...'
export STATE_FILE="$HOME/trv-deliver/last-sig"
bash watch-sales-notify-v2.sh
# buyer pays with memo + provides age1 →
echo 'age1...' > $HOME/trv-deliver/<sig12>.recipient
```

## Payloads

| ID | File |
|----|------|
| trv-posture-lite | payloads/trv-posture-lite.txt |
| trv-posture-pack | payloads/trv-posture-pack.txt |
| sentinel-skill-zk-01 | payloads/sentinel-zk-01.txt |
| hello-sentinel-demo | payloads/hello-sentinel.txt (test) |

## Ops

```bash
bash seller-ops.sh list
bash seller-ops.sh status
```
