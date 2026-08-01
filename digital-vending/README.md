# TRV Digital Vending Chute — Level 2

**Catalog + Solana memo / manual-pay → age encrypt → Robust Soliton LT (TRVL) → optical or file delivery.**

Zero platform custody. Seller never holds buyer private keys. Buyer peels and decrypts on-device only.

## Files

- `catalog.json` — product list (id, price, memo, payload path)
- `payloads/` — plaintext goods (encrypt at delivery time)
- `seller-deliver.sh` — core: encrypt + frame-stream
- `auto-deliver.sh` — automated wrapper that writes frames + DM text into `$DELIVER_DIR`
- `buyer-receive.sh` — peel + decrypt
- `catalog-ui.html` — offline catalog + command generator
- `watch-sales-notify-v2.sh` — Level 2 watcher (Solana poll + ZIP + age/LT)

## Automation flow

1. Buyer pays to the published Solana address with the correct memo (`TRV-Posture-Lite`, `TRV-Posture-Pack`, etc.).
2. `watch-sales-notify-v2.sh` detects the signature, prepares the classic ZIP (if available), and attempts age/LT delivery.
3. For the encrypted path the buyer must supply an age1 recipient. Practical method today:

   ```bash
   # After payment lands, create the drop file
   echo "age1...buyer-public-key..." > $HOME/trv-deliver/<first-12-of-sig>.recipient
   # Then either wait for next poll cycle or run:
   ./auto-deliver.sh <catalog-id> <full-sig>
   ```

4. Frames land in `$HOME/trv-deliver/<sig-prefix>_<id>.trvl` + ready DM text.
5. Seller hands the frames (file, QR optical, or link) to the buyer. Buyer peels on their own device.

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
./digital-vending/watch-sales-notify-v2.sh
```

Or keep using the original `scripts/watch-sales-notify.sh` and call `auto-deliver.sh` by hand after a sale.

## Rules

- Encrypt first. Never stream plaintext.
- Soliton LT only (Sentinel Standard).
- Identities stay in Vault. Never commit AGE-SECRET-KEY.
- Payment verification before delivery.
- Destroy = Restart for test material.

American-made, local-first, no BS.
