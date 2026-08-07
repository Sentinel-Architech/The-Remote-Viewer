# Phase 4 — Product (FROZEN 2026-08-07)

**Phone-first digital vending.** Build paused at a shippable surface.

## Shipped

| Item | Path |
|------|------|
| Real payloads | `digital-vending/payloads/*` |
| Seller ops | `seller-ops.sh` list/status/log/deliver |
| Sales log + sha256 | `log-sale.sh` → `$HOME/trv-deliver/sales.log` |
| Path B watcher | `watch-sales-notify-v2.sh` (self-test OK on Pixel) |
| Buy instructions | `buy.html` · `AUTO-SOLANA.md` |
| VPS notes | `VPS-WATCHER.md` |

## Explicit parks

| Item | Reason |
|------|--------|
| SPL TRV mint | No official aarch64 Solana CLI |
| ESP32 | Hardware ~weeks |
| Always-on auto | Optional VPS per VPS-WATCHER.md |

## Operate without new code

```bash
# manual sale
bash seller-ops.sh deliver <id> 'age1...'
bash seller-ops.sh log

# optional watcher (same device or VPS)
export SALES_ADDRESS='...'
bash watch-sales-notify-v2.sh
```

## Unfreeze when

- First paid sale needs a catalog/payload change  
- VPS is provisioned and you want systemd unit in-repo  
- ESP32 boards arrive  
- x86 host available for mint  
