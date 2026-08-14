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

## Steps (recommended order)

### 1. Create your delivery key (on your device only)

```bash
age-keygen -o identity.txt
```

- The file contains both a **private** key (`AGE-SECRET-KEY-...`) and a **public** key (`age1...`).
- **Never** share, screenshot, or upload the private key.
- Copy only the public key line that starts with `age1`.

### 2. Pay

Tap **Pay with Phantom** on the buy page, or send USDC manually with the **exact** memo for the pack you want.

Save the transaction signature (or Solscan link).

### 3. Give the seller only two things

You must get these two pieces of information to the seller:

1. Your public key (`age1...`)
2. The transaction signature

**Preferred methods (lowest friction first):**

| Method | How |
|--------|-----|
| **Optical (recommended)** | Display your `age1...` public key as a QR code. Seller scans it. No chat required for the key. |
| **Copy-paste** | Send the `age1...` line + tx signature through any channel you already use with the seller. |
| **File drop** (advanced) | Place a one-line file containing only the `age1...` at the location the seller expects (see PROTOCOL.md). |

The seller never receives or stores your private key.

### 4. Receive and decrypt

You will receive a `.trvl` file (or optical frames).

```bash
cat sale.trvl | bash buyer-receive.sh identity.txt
```

If the private key was ever exposed, destroy it and start over (`Destroy = Restart`).

## Rules

- Seller never holds your private key.
- Packs are paid per item (Founding status does not make them free).
- Destroy test keys that appear in chat or screenshots.
- Payment is only a signal. Delivery is always age-encrypted to *your* public key.

## Protocol & proof

- [`digital-vending/PROTOCOL.md`](../../digital-vending/PROTOCOL.md)
- [`docs/TEST.md`](../TEST.md) §4 — reproducible e2e
- [`docs/REALITY.md`](../REALITY.md) — what is PROVEN
- [`docs/security/threat-model.md`](../security/threat-model.md) — residual risks
