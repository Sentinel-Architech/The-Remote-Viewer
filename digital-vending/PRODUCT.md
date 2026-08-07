# TRV Digital Vending — Product (Phase 4)

**Phone-first seller station.** Path B = Solana USDC memo + age1 drop.

## Rails

| Rail | Role |
|------|------|
| **USDC + memo** | Payment signal (Path B) |
| **age1…** | Buyer public key |
| **age + Soliton LT** | Delivery |
| **sales.log** | Local append-only + sha256 |
| **SPL TRV mint** | Deferred (no aarch64 CLI) |

## Manual sale

```bash
bash seller-ops.sh deliver trv-posture-lite 'age1...'
bash seller-ops.sh log
bash seller-ops.sh status
```

## Watcher on Pixel (free, best-effort)

```bash
export SALES_ADDRESS='your-address'
bash watch-termux.sh          # 90s poll, optional wake-lock + notify
# or: bash watch-sales-notify-v2.sh
```

`pkg install termux-api` enables wake-lock and sale notifications.
Phone sleep can still stop Termux — not a VPS replacement.

## Auto sale docs

See **AUTO-SOLANA.md**, **VPS-WATCHER.md** (optional paid always-on).

## Payloads

| ID | File |
|----|------|
| trv-posture-lite | payloads/trv-posture-lite.txt |
| trv-posture-pack | payloads/trv-posture-pack.txt |
| sentinel-skill-zk-01 | payloads/sentinel-zk-01.txt |
| hello-sentinel-demo | payloads/hello-sentinel.txt (test) |
