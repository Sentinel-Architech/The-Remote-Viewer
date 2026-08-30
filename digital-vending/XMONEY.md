# X Money → pack fulfill

**Receive handle:** [@Archtecht](https://x.com/Archtecht)  
**Repo:** [Sentinel-Architech/The-Remote-Viewer](https://github.com/Sentinel-Architech/The-Remote-Viewer) only.

X Money has no public merchant webhook in this repo. Payment is on X. Fulfill uses the same chute as Path B: `auto-deliver.sh` → age + TRVL frames (or the built ZIP for DM).

## SKUs

| Pay on X Money | SKU | Catalog id |
|----------------|-----|------------|
| **11 USD** + note `TRV-Posture-Lite` | Lite ZIP + lite payload | `trv-posture-lite` |
| **25 USD** + note `TRV-Posture-Pack` | Full ZIP + pack payload | `trv-posture-pack` |

Buyer should include the memo string in the X Money note/DM after pay.

## Operator (one sale)

```bash
# 1) Confirm the X Money payment in the X app (amount + note).
# 2) If buyer sent age1, drop it then deliver:

PREFIX=xmoney-$(date -u +%Y%m%d%H%M)
mkdir -p "$HOME/trv-deliver"
echo 'age1...' > "$HOME/trv-deliver/${PREFIX}.recipient"
cd digital-vending
bash auto-deliver.sh trv-posture-lite "$PREFIX"
```

Or log only (ZIP handoff, no age1 yet):

```bash
bash digital-vending/log-sale.sh trv-posture-lite "xmoney @payer 11" dist/trv-posture-lite.zip
```

## Build the ZIPs (automated pack)

```bash
./scripts/build-posture-pack.sh        # both
./scripts/build-posture-pack.sh lite
./scripts/build-posture-pack.sh full
```

CI workflow **Build Posture Pack** uploads `dist/` artifacts. ZIPs stay gitignored.

## What this is not

Not an X Money API integration. Not $XMONEY / BNB xMoney. Not custody of buyer keys.
