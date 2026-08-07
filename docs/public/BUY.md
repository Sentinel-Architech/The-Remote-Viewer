# Buy TRV packs

**Public offer.** No account. No platform custody.

## Storefront

Open the buy page (Pay buttons + QR codes):

- [buy.html on GitHub](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/blob/TheRemoteViewer/digital-vending/buy.html)
- [Browser preview](https://htmlpreview.github.io/?https://github.com/Sentinel-Archetecht/The-Remote-Viewer/blob/TheRemoteViewer/digital-vending/buy.html)
- [jsDelivr](https://cdn.jsdelivr.net/gh/Sentinel-Archetecht/The-Remote-Viewer@TheRemoteViewer/digital-vending/buy.html)

## Prices

| Pack | USDC | Memo (exact) |
|------|-----:|--------------|
| TRV Posture Lite | 11 | `TRV-Posture-Lite` |
| TRV Posture Pack | 25 | `TRV-Posture-Pack` |
| ZK Membership Skill | manual / XMR | `SENTINEL-ZK-01` |

**Pay to:** `HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv`  
**Token:** USDC on Solana (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)

## Steps

1. **Pay** — tap Pay with Phantom on the buy page, or send USDC manually with the exact memo.
2. **Key** — on your device only:
   ```bash
   age-keygen -o identity.txt
   ```
   Keep `AGE-SECRET-KEY` private. Copy only the **Public key** (`age1…`).
3. **Contact seller** with:
   - your `age1…`
   - transaction signature (or Solscan link)
4. **Receive** a `.trvl` file.
5. **Decrypt:**
   ```bash
   cat sale.trvl | bash buyer-receive.sh identity.txt
   ```

If you pay before sending `age1`, delivery stays PENDING until the seller has your recipient.

## Rules

- Seller never holds your private key.
- Packs are paid per item (Founding status does not make them free).
- Destroy test keys that appear in chat or screenshots.

## Protocol & proof

- [`digital-vending/PROTOCOL.md`](../../digital-vending/PROTOCOL.md)
- [`docs/TEST.md`](../TEST.md) §4 — reproducible e2e
- [`docs/REALITY.md`](../REALITY.md) — what is PROVEN
