# The Remote Viewer (TRV) / The Sentinel

**New here?** → **[START_HERE.md](START_HERE.md)**  
**Status authority:** [`docs/REALITY.md`](docs/REALITY.md) · **Hold map:** [`docs/SCAFFOLD-HOLD.md`](docs/SCAFFOLD-HOLD.md)  
**Working branch:** `TheRemoteViewer`

Solo-built · local-first node · zero-custody packs · optical air-gap · live Viewer Hub

---

## Live Viewer Hub

**This is the product. It is not a scaffold.**

| | |
|--|--|
| **Live** | [sentinelsecurityprotocol.grok.me](https://sentinelsecurityprotocol.grok.me) |
| **Source** | [`apps/hub`](apps/hub) |
| **Status** | **LIVE** as of 2026-08-20 |

Shipped: first win on Command, daily watch, profile vault, public card, SENTINEL OS jack-in, `/hub/node` local Ed25519 runtime.

`apps/web` is the **old Vite scaffold**. Use `apps/hub`.

The hub does **not** recover age keys. Destroy = Restart on the local path.

---

## Local node (PROVEN)

Optical air-gap, Path B packs, integrity pulse — on a machine you control.

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
```

Operator UI: `bash apps/ui/serve-ui.sh` → http://127.0.0.1:8765/

---

## What is held (do not upgrade)

| Surface | Action |
|---------|--------|
| `solana/` Track A | **HOLD.** Not mainnet, not audited, CI blocked. Do not bump Anchor. |
| `contracts/` EVM | **HOLD.** Parallel scaffold. |
| `apps/mobile` Expo | **PARKED.** |
| Root space-named note dumps | **DELETE** on `sentinel-repair/root-declutter`. |

Saying the hub is live is not saying the chain is live.

---

## Path B packs

USDC memo on Solana is a **payment signal**, not `trv_governance`.

| Pack | Price | Memo |
|------|------:|------|
| TRV Posture Lite | 11 USDC | `TRV-Posture-Lite` |
| TRV Posture Pack | 25 USDC | `TRV-Posture-Pack` |

See [`digital-vending/buy.html`](digital-vending/buy.html) and [`docs/public/BUY.md`](docs/public/BUY.md).

---

## License

See [LICENSE](LICENSE).
