# Remote access to the local UI

## Default (recommended)

```bash
bash apps/ui/serve-ui.sh
# only http://127.0.0.1:8765/ on this device
```

## Optional: ngrok (public URL)

**Risks**

- Anyone with the ngrok URL can **see** the console (commands shown in dialogs).
- UI still does not execute shell or load age keys from the browser — but you are no longer air-gapped for that surface.
- Ngrok account + authtoken required (third party).
- Not a substitute for real remote admin (prefer Tailscale/SSH to the device).

**Setup**

1. Install ngrok for your platform: https://ngrok.com/download  
2. `ngrok config add-authtoken <token from dashboard>`  
3. From repo:

```bash
bash apps/ui/serve-ui-ngrok.sh
```

Ngrok prints an `https://….ngrok-free.app` URL. Open that from another device.

**Stop:** Ctrl+C in the ngrok session.

## Better remote options (still local-first)

| Method | Notes |
|--------|--------|
| **Tailscale / Headscale** | Private mesh; hit `http://100.x.y.z:8765` only on your tailnet |
| **SSH + port forward** | `ssh -L 8765:127.0.0.1:8765 user@phone` then localhost on laptop |
| **Ngrok** | Quick public link; least aligned with sovereignty |

Do not bind `serve-ui.sh` to `0.0.0.0` on open Wi‑Fi.
