# TRV Digital Vending Chute — Level 2.5 (backoff)

**Catalog + Solana memo / manual-pay → age encrypt → Robust Soliton LT (TRVL) → optical or file delivery.**

Zero platform custody. Seller never holds buyer private keys. Buyer peels and decrypts on-device only.

## Files

- `catalog.json` — product list
- `payloads/` — plaintext goods (encrypt at delivery time)
- `seller-deliver.sh` — core encrypt + frame-stream
- `auto-deliver.sh` — wrapper with exit codes + PENDING markers
- `buyer-receive.sh` — peel + decrypt
- `catalog-ui.html` — offline catalog + command generator
- `watch-sales-notify-v2.sh` — Level 2.5 watcher with exponential backoff

## Automation + retry

1. Payment detected → ZIP prep + age/LT attempt.
2. No recipient → `.PENDING` marker written.
3. Every poll cycle:
   - Scans PENDING files.
   - If `<sig-prefix>.recipient` exists and backoff window has elapsed → re-run auto-deliver.
4. Transient failures (encrypt/stream) use **exponential backoff**:
   - Attempt 1 → wait `BACKOFF_BASE_SECONDS` (default 30s)
   - Attempt 2 → 60s
   - Attempt 3 → 120s
   - … capped at `BACKOFF_MAX_SECONDS` (default 1800s / 30 min)
5. After `MAX_TRANSIENT_RETRIES` (default 3) the sale is marked EXHAUSTED.

Missing-recipient stays PENDING forever until the drop file appears (does not burn retry budget).

### Drop file

```bash
echo "age1..." > $HOME/trv-deliver/<first-12-of-sig>.recipient
```

### Tunables

```bash
export MAX_TRANSIENT_RETRIES=3
export BACKOFF_BASE_SECONDS=30
export BACKOFF_MAX_SECONDS=1800
./digital-vending/watch-sales-notify-v2.sh
```

## Exit codes (auto-deliver.sh)

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Bad usage |
| 2 | Missing / invalid age recipient (PENDING) |
| 3 | Encrypt or frame-stream failed |
| 4 | Catalog / payload problem |

## Quick test

```bash
cd $HOME/The-Remote-Viewer/optical-airgap/rust
cargo run --quiet --bin trv-optical -- keygen 2> $HOME/test-id.txt | tee $HOME/test-recip.txt
chmod 600 $HOME/test-id.txt
cd ../../digital-vending
./seller-deliver.sh hello-sentinel-demo $(cat $HOME/test-recip.txt) > $HOME/frames.trvl
cat $HOME/frames.trvl | ./buyer-receive.sh $HOME/test-id.txt
```

## Rules

- Encrypt first. Never stream plaintext.
- Soliton LT only (Sentinel Standard).
- Identities stay in Vault.
- Destroy = Restart for test material.

American-made, local-first, no BS.
