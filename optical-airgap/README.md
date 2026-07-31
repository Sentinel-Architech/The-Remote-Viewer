# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer stack for The Remote Viewer.

**Repo path:** `optical-airgap/` on branch `TheRemoteViewer`  
**Tracking:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38  
**License:** MIT (see `LICENSE`) — zero Meta / Google / Microsoft in the core path

## Design Goals (locked)
- Fully open-source
- Zero Meta / Google / Microsoft dependencies in core path
- Zero extra monetary cost
- Runs on Pixel 7 (GrapheneOS) + obsolete Acer + tablet
- Destroy = Restart is absolute
- Primary path is pure optical (screen → camera)
- Outside email only ever sees already-encrypted + stego’d blobs
- Encrypt-first always (HIPAA-aligned architecture; organizational compliance still required for real ePHI)

## Pipeline
```
Plaintext
  → age encryption                    (crypto/age-interface.ts — FiloSottile typage)
  → Histogram-shifting RDH            (rdh/histogram-shifting.ts — capacity check + auth header)
  → LT Fountain encoding              (fountain/lt-core.ts)
  → Animated QR / multi-QR display    (optical/qr-sender.html)
  → Camera capture + quality gate     (phone-side; optional until you touch the device)
  → LT peeling decoder
  → RDH extraction (checksum verified)
  → age decryption
```

## What is on GitHub now

| Path | Status |
|------|--------|
| `identity/local-address.ts` | Local `@sentinel.viewer` addresses |
| `crypto/age-interface.ts` | Real age via `age-encryption` (typage) |
| `crypto/age-notes.md` | Install + Termux CLI fallback |
| `rdh/histogram-shifting.ts` | Embed/extract + capacity + SHA-256 header |
| `rdh/SECURITY.md` | Encrypt-first + integrity rules |
| `pipeline/encrypt-then-rdh.ts` | age → RDH one-shot helper |
| `fountain/lt-core.ts` | LT encoder + peel decoder skeleton |
| `optical/qr-sender.html` | Browser QR stream (CDN QR temporary) |
| `loop/recursive-hooks.md` | Event schema for on-device experts |
| `apps/shared/src/identity.ts` | Wired local address into shared identity |

## Quick start (Acer / Node — no phone required)

```bash
cd optical-airgap/crypto
npm install          # pulls age-encryption
```

Then use `pipeline/encrypt-then-rdh.ts` after pointing your TS runner at the modules.
Termux alternative: `pkg install age` and follow `crypto/age-notes.md`.

## Local Identity
```
anything@sentinel.viewer
```
Pure local claim bound to Vault / DID. Never registered on public DNS. Destroyed with Destroy = Restart.

## Not in scope (locked)
- WiFi CSI / through-wall sensing on Pixel 7 + GrapheneOS (hardware + OS isolation)
- Real ePHI without organizational HIPAA process

## Next (still open in #38)
1. Vendor pure-JS QR (zero CDN)
2. LT symbols → QR binary frames
3. Receiver / peel page (when you use a camera again)
4. Frame quality gate
5. Recursive loop event wiring
