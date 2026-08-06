# TRV Local Console (UI)

Progressive, offline-first local console for The Remote Viewer.

## Design rules

- Single HTML entry (`index.html`) — open from file:// or any static server
- No required CDN, no framework build step for basic use
- No network calls from the page itself
- Targets: modern mobile browsers, desktop, and constrained environments that can render basic HTML/CSS/JS
- Beepers/pagers and pure RF devices are out of scope for this HTML surface; they use optical / protocol paths instead

## What it shows

| Panel | Purpose |
|-------|---------|
| Identity | Local age identity presence (status only; keys never leave device) |
| Self-Heal | Link to watchdog / supervisor docs |
| Contribution | Local ledger path reminder |
| Sovereignty | Destroy = Restart reminder + minimize-check |
| Optical | Link to proven e2e script |

## Run

```bash
# From clone root
# Option A: open file directly in browser
# Option B: any static server
cd apps/ui
python -m http.server 8765   # or termux: python -m http.server
# then open http://127.0.0.1:8765
```

## Non-goals

- App store packages in this commit
- Bluetooth/Wi-Fi discovery UI (separate hardware path)
- Server-side rendering or accounts
