# Always-on Path B (VPS)

Run the USDC memo watcher on a small Linux VPS so the Pixel can sleep.
Pixel stays the optical / Vault / manual-deliver station.

## What moves to the VPS

| On VPS | Stays on Pixel |
|--------|----------------|
| `watch-sales-notify-v2.sh` | Optical receiver, Vault |
| `auto-deliver.sh` + catalog + payloads | Manual `seller-ops` if needed |
| `$HOME/trv-deliver/` (frames, PENDING, sales.log) | Buyer handoff / QR |

## Minimal setup

1. Fresh Debian/Ubuntu VPS (x86_64).  
2. Install: `git curl jq age` (and build `trv-optical` or copy the binary from a Linux build).  
3. Clone repo (or deploy only `digital-vending/` + optical CLI).  
4. Set env (do **not** commit secrets):

```bash
export SALES_ADDRESS='your-public-solana-address'
export DELIVER_DIR="$HOME/trv-deliver"
export STATE_FILE="$DELIVER_DIR/last-sig"
# optional private RPC:
# export SOLANA_RPC_URL='https://...'
```

5. Run under systemd or `tmux`:

```bash
cd /path/to/The-Remote-Viewer/digital-vending
bash watch-sales-notify-v2.sh
```

6. When buyer sends `age1`, on the VPS:

```bash
echo 'age1...' > $HOME/trv-deliver/<sig12>.recipient
```

Watcher retries → writes `.trvl` + `sales.log` (with sha256).

## Hand frames to buyer

- `scp` / SFTP the `.trvl` off the VPS, or  
- Sync `trv-deliver/` to the Pixel and use optical path, or  
- Host a private download link you control (ciphertext only).

## Security

- VPS holds **ciphertext frames** and public `age1` drops — not buyer identities.  
- Seller age identity for *your* tests stays on Pixel Vault.  
- Firewall: SSH only; no need to expose a public HTTP port for the watcher.  
- Prefer a private Solana RPC for production volume.

## Pixel still works offline

Watcher down → use `seller-ops.sh deliver` on the phone as before.
