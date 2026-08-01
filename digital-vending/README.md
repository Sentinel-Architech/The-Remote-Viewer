# TRV Digital Vending Chute — Level 2.5 (circuit + backoff)

**Catalog + Solana memo / manual-pay → age encrypt → Robust Soliton LT (TRVL) → optical or file delivery.**

Zero platform custody. Seller never holds buyer private keys. Buyer peels and decrypts on-device only.

## Resilience layers

1. **Per-sale exponential backoff** — encrypt/stream failures back off (30s → 60s → 120s … cap 30 min).
2. **RPC circuit breaker** — consecutive Solana failures open the circuit. While open the watcher skips the poll and only runs local PENDING retries. After cooldown it probes once (half-open). Success → closed. Failure → open again.

## Circuit breaker defaults

| Param | Default | Meaning |
|-------|---------|--------|
| `CIRCUIT_FAILURE_THRESHOLD` | 5 | Consecutive RPC failures before open |
| `CIRCUIT_COOLDOWN_SECONDS` | 120 | Seconds to stay open before half-open probe |

State lives in `$DELIVER_DIR/.circuit-rpc`.

## Tunables

```bash
export MAX_TRANSIENT_RETRIES=3
export BACKOFF_BASE_SECONDS=30
export BACKOFF_MAX_SECONDS=1800
export CIRCUIT_FAILURE_THRESHOLD=5
export CIRCUIT_COOLDOWN_SECONDS=120
./digital-vending/watch-sales-notify-v2.sh
```

## Drop file (encrypted delivery)

```bash
echo "age1..." > $HOME/trv-deliver/<first-12-of-sig>.recipient
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
