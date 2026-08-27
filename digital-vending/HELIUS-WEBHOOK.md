# Helius webhooks — Path B sales

Near–real-time alternative to RPC polling. Same deliver path: memo → SKU → `auto-deliver.sh`.

**No wallet keys. No age secrets on the webhook host.** Only public sales address + ciphertext frames.

## When to use

| Host | Use |
|------|-----|
| Phone / Termux | **No** — cannot receive public HTTPS reliably |
| Small VPS / always-on Linux | **Yes** |
| Poll watcher (`watch-termux.sh`) | Still valid; Helius is optional upgrade |

## 1. Helius dashboard

1. Create account at [helius.dev](https://www.helius.dev/) (or current Helius console).
2. **Webhooks → Add webhook**
   - **Type:** Enhanced transactions (recommended)
   - **Account addresses:** `HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv` (your `SALES_ADDRESS`)
   - **Webhook URL:** `https://YOUR_DOMAIN/helius` (HTTPS required)
   - **Transaction types:** Any / transfers (whatever the UI exposes for token transfers)
3. **Required:** set an auth header value; mirror it as `TRV_WEBHOOK_SECRET` on the receiver (min 16 characters). The receiver **will not start** without it.

## 2. Receiver on VPS

```bash
export SALES_ADDRESS='HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv'
export DELIVER_DIR="$HOME/trv-deliver"
export TRV_WEBHOOK_SECRET='long-random-string'   # required; must match Helius auth header
export HELIUS_BIND=127.0.0.1
export HELIUS_PORT=8787

cd /path/to/The-Remote-Viewer/digital-vending
python3 helius-webhook-receiver.py
```

Health check (local):

```bash
curl -s http://127.0.0.1:8787/health
```

## 3. Public HTTPS in front

Receiver binds **localhost only**. Terminate TLS with Caddy/nginx or a tunnel.

Example Caddy snippet:

```text
sales.example.com {
  reverse_proxy 127.0.0.1:8787
}
```

Point Helius webhook URL at `https://sales.example.com/helius`.

## 4. Buyer age1 still required

Webhook only sees payment. Delivery still needs:

```bash
echo 'age1...' > $HOME/trv-deliver/<sig12>.recipient
```

Then receiver/`auto-deliver` writes `.trvl` (or leaves `.PENDING` until drop exists). Same protocol as the poll watcher.

## 5. Security

- **`TRV_WEBHOOK_SECRET` is required.** Unsigned POSTs are rejected. Receiver refuses to bind if the secret is missing or shorter than 16 characters.
- Bind loopback only (`127.0.0.1`); terminate TLS with Caddy/nginx. Non-loopback bind is refused.
- Only allowlisted catalog memos (`TRV-Posture-Lite` etc.) map to SKUs. Untrusted memo text is never passed to bash.
- Solana signatures are validated as base58 before `auto-deliver.sh`.
- Sales-address match is on transfer destination accounts, not a JSON substring.
- Firewall: only 443 public; SSH admin; nothing else
- Host holds ciphertext + public `age1` drops — not buyer private keys
- Rotate secret if leaked; Destroy = Restart for any test identities that hit logs

## 6. Poll vs webhook

| | Poll watcher | Helius webhook |
|--|--------------|----------------|
| Latency | 45–90s | seconds |
| Host | Phone OK (best-effort) | Needs public HTTPS |
| Cost | Free RPC / your RPC | Helius plan |
| Code path | `watch-sales-notify-v2.sh` | `helius-webhook-receiver.py` → same `auto-deliver.sh` |

You can run **both**; `last-sig` / PENDING files dedupe most double-delivers. Prefer one primary to avoid noise.

## 7. Test

1. Start receiver + HTTPS front.
2. Send a tiny USDC transfer with memo `TRV-Posture-Lite` to sales address (or use Helius “test webhook” if offered).
3. Check receiver logs + `$HOME/trv-deliver/` for PENDING or `.trvl`.
