# Buy TRV packs

**Public offer.** No account. No platform custody.

**Packs ≠ network sub.** Catalog packs are one-time TRVL deliveries. Unlimited human **comms** is separate: **$96/year** or an active node — see [`PRICING.md`](PRICING.md).

## Storefront

- [buy.html on GitHub](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/blob/TheRemoteViewer/digital-vending/buy.html)
- [Browser preview](https://htmlpreview.github.io/?https://github.com/Sentinel-Archetecht/The-Remote-Viewer/blob/TheRemoteViewer/digital-vending/buy.html)
- [jsDelivr](https://cdn.jsdelivr.net/gh/Sentinel-Archetecht/The-Remote-Viewer@TheRemoteViewer/digital-vending/buy.html)

## Pack prices

| Pack | USDC | Memo (exact) |
|------|-----:|--------------|
| TRV Posture Lite | 11 | `TRV-Posture-Lite` |
| TRV Posture Pack | 25 | `TRV-Posture-Pack` |
| ZK Membership Skill | manual / XMR | `SENTINEL-ZK-01` |

**Pay to:** `HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv`  
**Token:** USDC on Solana (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)

## Steps

1. `age-keygen -o identity.txt` — share only `age1…`  
2. Pay with exact memo (Phantom QR on buy page)  
3. Give seller `age1…` + tx signature (optical via `show-age1.html` preferred)  
4. Receive `.trvl` → `cat sale.trvl | bash buyer-receive.sh identity.txt`  

## Rules

- Seller never holds your private key  
- Packs stay paid (Founding does not waive)  
- Pack payment does not grant $96 unlimited-comms entitlement  
- Destroy exposed keys  

Protocol: [`digital-vending/PROTOCOL.md`](../../digital-vending/PROTOCOL.md) · Reality: [`docs/REALITY.md`](../REALITY.md)
