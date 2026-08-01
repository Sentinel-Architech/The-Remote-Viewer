# TRV Digital Vending Chute — Level 1

**Catalog + manual-pay / Solana memo → age encrypt → Robust Soliton LT (TRVL) → optical delivery.**

Zero platform custody. Seller never holds buyer private keys. Buyer peels and decrypts on-device only.

## Files

- `catalog.json` — product list (id, price, memo, payload path)
- `payloads/` — plaintext goods (encrypt at delivery time)
- `seller-deliver.sh` — wraps `trv-optical` encrypt + frame-stream
- `buyer-receive.sh` — frame-peel + decrypt
- `catalog-ui.html` — offline minimal catalog + command generator (open in browser or Termux)

## Existing sales watcher

`scripts/watch-sales-notify.sh` already polls the Solana sales address, matches memos (`TRV-Posture-Lite`, `TRV-Posture-Pack`), prepares ZIP + DM text.  

Upgrade path: after payment detect → call `seller-deliver.sh` with buyer age recipient (buyer must supply it in memo or DM) instead of (or in addition to) plain ZIP.

## Quick test (3)

1. Generate fresh test identity (do not reuse Vault shown in chat):
   ```bash
   cd $HOME/The-Remote-Viewer/optical-airgap/rust
   cargo run --quiet --bin trv-optical -- keygen 2> $HOME/test-id.txt | tee $HOME/test-recip.txt
   chmod 600 $HOME/test-id.txt
   ```

2. Seller side (from this directory):
   ```bash
   ./seller-deliver.sh hello-sentinel-demo $(cat $HOME/test-recip.txt) > $HOME/frames.trvl
   ```

3. Buyer side:
   ```bash
   cat $HOME/frames.trvl | ./buyer-receive.sh $HOME/test-id.txt
   # → hello-sentinel
   ```

Destroy test keys after.

## Rules

- Encrypt first. Never stream plaintext.
- Soliton LT only (Sentinel Standard).
- Identities stay in Vault. Never commit AGE-SECRET-KEY.
- Manual verification of payment before delivery.
- Destroy = Restart for test material.

American-made, local-first, no BS.
