# TRV Decentralized Static Site

**Zero corporations. Zero CDNs. Fully local-first / IPFS-ready.**

This directory is a pure static tree. No build step. No Node required to view. No external script sources.

## Serve locally (preferred)

```bash
# From repo root or inside site/
cd site
python3 -m http.server 8080
# or
# python -m http.server 8080
# then open http://127.0.0.1:8080
```

On GrapheneOS + Termux:

```bash
pkg install python
cd ~/The-Remote-Viewer/site   # or wherever you cloned
python -m http.server 8080
```

Open in Vanadium / Graphene browser: `http://127.0.0.1:8080`

## Pin to IPFS (fully decentralized)

```bash
# Requires local IPFS node (go-ipfs / Kubo)
ipfs add -r -Q site/
# returns a CID. Share the CID. No central server.
# Consumers: ipfs cat / ipfs get / local gateway / public gateway only as last resort.
```

Never depend on a corporate gateway for production use. Run your own node or use a trusted peer.

## Contents

| Path | Purpose |
|------|---------|
| `index.html` | Landing + ethos |
| `optical/qr-sender.html` | Offline LT QR fountain sender |
| `optical/qr-receiver.html` | Camera / paste / file LT peel receiver |
| `optical/qrcode-lite.js` | First-party pure JS QR encoder |
| `vending/catalog-ui.html` | Digital vending catalog + delivery command generator |

All HTML is self-contained or uses only the local files in this tree.

## Policy

- No Meta / Google / Microsoft runtime dependencies
- No external `<script src="https://...">`
- Matches Sentinel Standard (optical-airgap)
- Destroy = Restart still applies to any identity material

Source of truth remains the full repository. This site is the public, offline-capable face.
