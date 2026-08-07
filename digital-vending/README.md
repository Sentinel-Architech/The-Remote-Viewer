# TRV Digital Vending Chute

**Catalog → (pay) → age encrypt → Robust Soliton LT (TRVL) → file or optical delivery.**

Zero platform custody. Seller never holds buyer private keys. Buyer peels and decrypts on-device only.

## Quick dry run (no payment)

```bash
cd $HOME/The-Remote-Viewer/digital-vending
bash e2e-optical-demo.sh hello-sentinel-demo
rm -f $HOME/vend-demo-id.txt $HOME/vend-demo-recip.txt $HOME/vend-frames.trvl
```

## Seller after payment

```bash
./seller-deliver.sh <catalog-id> <buyer-age1-recipient> > $HOME/trv-deliver/<sig>_item.trvl
# or via watcher + auto-deliver.sh
```

Buyer recipient drop (when sig known):

```bash
mkdir -p $HOME/trv-deliver
echo 'age1...' > $HOME/trv-deliver/<first-12-of-sig>.recipient
```

## Status (local)

```bash
bash status.sh
# PENDING markers, frame packs, recipient drops, RPC circuit file
```

## Buyer

```bash
cat frames.trvl | ./buyer-receive.sh $HOME/vault-identity.txt
```

Optical: paste frames into `optical-airgap/optical/qr-receiver.html` (peel ciphertext) then CLI decrypt with Vault identity.

## Harden checklist

- [ ] `e2e-optical-demo.sh` green  
- [ ] `status.sh` shows empty PENDING on a clean chute  
- [ ] Manual: create `.recipient` drop → `auto-deliver.sh <id> <sig>` → `.trvl` + `_dm.txt`  
- [ ] Buyer path recovers payload  
- [ ] Destroy demo keys after tests  
- [ ] No identity in chat/screenshots  

## Watcher (optional paid path)

`watch-sales-notify-v2.sh` — Solana memo / drop-file with backoff + RPC circuit breaker.

| Param | Default |
|-------|---------|
| `CIRCUIT_FAILURE_THRESHOLD` | 5 |
| `CIRCUIT_COOLDOWN_SECONDS` | 120 |

## Rules

- Encrypt first. Never stream plaintext.  
- Soliton LT only.  
- Identities in Vault only.  
- Destroy = Restart for test material.  
- Demo ≠ production secrets.  

Token / mint design: see [docs/TRV-MINT-NOTES.md](../docs/TRV-MINT-NOTES.md) and root [TOKENOMICS.md](../TOKENOMICS.md).
