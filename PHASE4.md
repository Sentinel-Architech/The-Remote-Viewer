# Phase 4 — Product (phone-first)

**Started:** 2026-08-07  
**Hardware:** Pixel-class / any open-stack host  
**Blocked elsewhere:** Solana SPL mint (no aarch64 official CLI) · ESP32 (~weeks)

## Goal
Sell digital goods with **verified payment → age → TRVL → buyer decrypt**, zero platform custody.

## Shipped

| Item | Path |
|------|------|
| Product rules + checklist | `digital-vending/PRODUCT.md` |
| Seller ops | `digital-vending/seller-ops.sh` |
| Catalog rails note | `digital-vending/catalog.json` |
| Prior e2e | `e2e-optical-demo.sh` · optical receiver |

## Seller loop

```text
payment verified → age1 from buyer → seller-ops deliver → .trvl → buyer-receive
```

## Next product slices (when you want)

1. Replace stub payloads with real pack text  
2. Manual sales log (local file, no cloud)  
3. Watcher dry-run against a known memo (optional)  
4. Mint address field in catalog **after** x86 mint  

## Non-goals

- On-device Solana mint  
- Hosted checkout that holds keys  
- Yield / investment framing  
