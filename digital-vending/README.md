# TRV Digital Vending Chute — Level 2.5

**Catalog + Solana memo / manual-pay → age encrypt → Robust Soliton LT (TRVL) → optical or file delivery.**

Zero platform custody. Seller never holds buyer private keys. Buyer peels and decrypts on-device only.

## Files

- `catalog.json` — product list (id, price, memo, payload path)
- `payloads/` — plaintext goods (encrypt at delivery time)
- `seller-deliver.sh` — core: encrypt + frame-stream
- `auto-deliver.sh` — automated wrapper (exit codes + PENDING markers)
- `buyer-receive.sh` — peel + decrypt
- `catalog-ui.html` — offline catalog + command generator
- `watch-sales-notify-v2.sh` — Level 2.5 watcher with automated retry

## Automation flow

1. Buyer pays to the published Solana address with the correct memo.
2. Watcher detects the signature, prepares the classic ZIP, and attempts age/LT delivery.
3. If no age recipient is known → writes a `.PENDING` marker and continues.
4. **Automatic retry** (every poll cycle):
   - Scans for `*.PENDING` files
   - If a matching `<sig-prefix>.recipient` drop file now exists → re-runs `auto-deliver`
   - Transient encrypt/stream failures are retried up to `MAX_TRANSIENT_RETRIES` (default 3)
   - Permanent missing-recipient stays PENDING until the drop file appears
5. Once recipient is supplied, frames + DM appear in `$HOME/trv-deliver/`.

### Drop file (the only manual step for encrypted delivery)

```bash
echo "age1...buyer-public-key..." > $HOME/trv-deliver/<first-12-of-sig>.recipient
# Watcher will pick it up on the next cycle (or force with auto-deliver.sh)
```

## Exit codes (auto-deliver.sh)

| Code | Meaning |
|------|---------|
| 0 | Success — frames + DM written |
| 1 | Bad usage |
| 2 | Missing / invalid age recipient (PENDING) |
| 3 | Encrypt or frame-stream failed |
| 4 | Catalog / payload problem |

## Quick manual test

```bash
cd $HOME/The-Remote-Viewer/optical-airgap/rust
cargo run --quiet --bin trv-optical -- keygen 2> $HOME/test-id.txt | tee $HOME/test-recip.txt
chmod 600 $HOME/test-id.txt

cd ../../digital-vending
./seller-deliver.sh hello-sentinel-demo $(cat $HOME/test-recip.txt) > $HOME/frames.trvl
cat $HOME/frames.trvl | ./buyer-receive.sh $HOME/test-id.txt
# → hello-sentinel
```

## Run the watcher

```bash
export DISCORD_WEBHOOK="https://discord.com/api/webhooks/..."   # optional
export MAX_TRANSIENT_RETRIES=3                                  # optional
./digital-vending/watch-sales-notify-v2.sh
```

## Rules

- Encrypt first. Never stream plaintext.
- Soliton LT only (Sentinel Standard).
- Identities stay in Vault. Never commit AGE-SECRET-KEY.
- Payment verification before delivery.
- Destroy = Restart for test material.

American-made, local-first, no BS.
