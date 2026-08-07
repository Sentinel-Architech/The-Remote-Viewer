# Path B — Solana USDC memo → auto age+TRVL

**No SPL TRV mint required.** Buyer pays **USDC** to your sales address with a **catalog memo**. Watcher sees the tx → tries `auto-deliver`. If `age1` is already dropped, frames appear under `$HOME/trv-deliver/`.

## Buyer click-path

1. Open `buy.html` (or your mirror).  
2. Pick item → note **memo** string exactly.  
3. Send **USDC** to sales address with that memo (Phantom / Solflare / CLI).  
4. Generate age key on their device; copy **`age1…` only**.  
5. Send you `age1` + tx signature (or paste into your drop form if you host one).  
6. When frames exist: download `.trvl` → `buyer-receive.sh` with their identity.

Order of 3 and 4 can flip. If pay lands first, watcher writes **PENDING** until `.recipient` drop exists, then retries.

## Seller (always-on host)

Prefer a small VPS or desktop for the watcher. Pixel works for tests but sleeps.

```bash
export SALES_ADDRESS='YourSolanaAddressHere'
export SOLANA_RPC_URL='https://api.mainnet-beta.solana.com'   # or private RPC
export DELIVER_DIR="$HOME/trv-deliver"
export STATE_FILE="$HOME/trv-deliver/last-sig"
# optional: DISCORD_WEBHOOK=...

cd $HOME/The-Remote-Viewer/digital-vending
bash watch-sales-notify-v2.sh
```

When buyer provides age1 after pay:

```bash
# sig prefix = first 12 chars of tx signature
echo 'age1...' > $HOME/trv-deliver/<sig12>.recipient
# watcher retry_pending picks it up, or:
bash auto-deliver.sh trv-posture-lite <full-sig>
```

## Memo → catalog map

| Memo substring | Catalog id |
|----------------|------------|
| `TRV-Posture-Lite` | `trv-posture-lite` |
| `TRV-Posture-Pack` | `trv-posture-pack` |
| `SENTINEL-ZK-01` | `sentinel-skill-zk-01` |

## Outputs

| File | Meaning |
|------|---------|
| `*.trvl` | age+LT frames for buyer |
| `*_dm.txt` | handoff note |
| `*.PENDING` | waiting on valid age1 |
| `.circuit-rpc` | RPC breaker state |

## Security

- Never put identity in the buy page.  
- Frames are ciphertext only.  
- Confirm amount on explorer before treating as final if RPC is public/demo.  
- Private RPC recommended for production.  

## Pixel note

Watcher needs network + uptime. Use Termux:Boot / wake lock if you insist on phone-only; VPS is saner.
