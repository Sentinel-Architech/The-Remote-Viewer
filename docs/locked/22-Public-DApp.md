# 22 — Public DApp (anyone · seconds)

**Status:** LOCKED  
**Date:** 2026-08-07  
**Surface:** The Remote Viewer only (parallel to The Sentinel core)

---

## Product rule

**The Remote Viewer is a DApp anyone can open, install, and use in seconds** — no developer setup, no Termux, no git required for end users.

| Who | Path |
|-----|------|
| **Anyone** | Open the public link → use immediately → optional **Install** / Add to Home Screen |
| **Builders** | Still clone `apps/remote-viewer` for contribution |
| **Core operators** | The Sentinel remains separate (`apps/ui`, device-local) |

---

## Install target

| Mechanism | Intent |
|-----------|--------|
| Progressive Web App (PWA) | Installable on phone/desktop in one gesture |
| Browser | Works without install |
| Native store later | Optional; not required for “seconds” |

---

## Parallel boundary (unchanged)

| DApp (public) | Core (device) |
|---------------|---------------|
| The Remote Viewer | The Sentinel |
| Network · shop · posts · talk | Optical · Hydra · verifier · vending ops |
| Install for everyone | Local operator console |

---

## Hosting

Public users hit a **hosted** copy of `apps/remote-viewer/` (HTTPS).  
Self-host and GitHub Pages are both valid. Termux `python -m http.server` is for **dev only**, not the public path.

---

## Related

- `apps/remote-viewer/manifest.webmanifest`
- `apps/remote-viewer/sw.js`
- `docs/locked/20-Native-Remote-Viewer.md`
