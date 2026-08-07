# TRV Digital Vending Chute

**Catalog → (pay) → age encrypt → Robust Soliton LT (TRVL) → file or optical delivery.**

Zero platform custody. Seller never holds buyer private keys. Buyer peels and decrypts on-device only.

**P3-C:** optical delivery uses the same frames the receiver already peels (`ctrl=complete` path proven).

## Quick dry run (no payment)

```bash
cd $HOME/The-Remote-Viewer/digital-vending
bash e2e-optical-demo.sh hello-sentinel-demo
```

Produces throwaway Vault under `$HOME/vend-demo-*.txt`, encrypts catalog payload, streams TRVL, peels + decrypts.

## Seller (after payment / manual)

```bash
./seller-deliver.sh <catalog-id> <buyer-age1-recipient> > $HOME/frames.trvl
```

Catalog IDs: see `catalog.json` (`hello-sentinel-demo`, `trv-posture-lite`, …).

## Buyer

**CLI**

```bash
cat $HOME/frames.trvl | ./buyer-receive.sh $HOME/vault-identity.txt
```

**Optical (paste)**

1. Seller: `seller-deliver.sh … > frames.trvl`
2. Buyer: open `optical-airgap/optical/qr-receiver.html` via local HTTP
3. Paste frames → Ingest → payload is still **age ciphertext** if you only peel in-browser
4. CLI decrypt: `trv-optical decrypt $HOME/vault-identity.txt < ct.bin`

Browser peel recovers exact ciphertext bytes; age decrypt stays on the CLI/Vault side (identity never in the page).

**Optical (camera)** — second device shows QR sender with frames; receiver camera path (BarcodeDetector).

## Resilience (paid watcher)

`watch-sales-notify-v2.sh` — Solana memo / drop-file watcher with:

1. Per-sale exponential backoff  
2. RPC circuit breaker  

| Param | Default |
|-------|---------|
| `CIRCUIT_FAILURE_THRESHOLD` | 5 |
| `CIRCUIT_COOLDOWN_SECONDS` | 120 |

## Rules

- Encrypt first. Never stream plaintext.  
- Soliton LT only (Sentinel Standard).  
- Identities stay in Vault.  
- Destroy = Restart for test material.  
- Demo catalog items ≠ production secrets.  

American-made, local-first, no BS.
