# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer stack for The Remote Viewer.

**Repo path:** `optical-airgap/` on branch `TheRemoteViewer`  
**Tracking:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38  
**License:** MIT (see `LICENSE`) — zero Meta / Google / Microsoft in the core path  
**Tech deep dive (share this):** [TECHNICAL.md](./TECHNICAL.md)

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
  → Camera capture + quality gate     (phone-side; optional until device is used)
  → LT peeling decoder
  → RDH extraction (checksum verified)
  → age decryption
```

## What is on GitHub now (shipped)

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

## Roadmap (not done yet)

Tracked in [issue #38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38). Order is suggested priority for a working end-to-end optical path.

1. **Vendor pure-JS QR library**  
   Remove the temporary CDN dependency from `optical/qr-sender.html`. Bundle or inline an open-source QR generator so the sender works fully offline with zero external network.

2. **LT ↔ QR binary framing**  
   Encode LT symbols into QR frames with a stable binary header (seq, degree/indices or seed, payload). Replace the current text-framed demo stream with real fountain symbols.

3. **Camera receiver / peel UI**  
   Capture page that reads QR frames, feeds symbols into `LTDecoder`, and reports peel progress. Deferred until a device with a camera is in use.

4. **Frame quality gate**  
   Reject blurry, low-contrast, or motion-smeared frames before LT ingestion. Improves decode reliability on handheld capture.

5. **Recursive expert event hooks (code)**  
   Implement the schema in `loop/recursive-hooks.md` so optical metrics (success rate, symbols/sec, failures) feed the on-device Security / Protocol / Privacy experts. Policy updates stay Vault-bound and die with Destroy = Restart.

6. **Optional later**  
   - Higher-capacity RDH only if measured need exceeds histogram shifting  
   - Acoustic fallback (e.g. ggwave) as secondary air-gap path  
   - Outside-email tunnel of *already-encrypted* blobs only  

## Quick start (Acer / Node — no phone required)

```bash
cd optical-airgap/crypto
npm install          # pulls age-encryption
```

Then use `pipeline/encrypt-then-rdh.ts` after pointing your TS runner at the modules.
Termux alternative: `pkg install age` and follow `crypto/age-notes.md`.

Full clone + contribution notes: [TECHNICAL.md](./TECHNICAL.md).

## Local Identity
```
anything@sentinel.viewer
```
Pure local claim bound to Vault / DID. Never registered on public DNS. Destroyed with Destroy = Restart.

## Not in scope (locked)
- WiFi CSI / through-wall sensing on Pixel 7 + GrapheneOS (hardware + OS isolation)
- Real ePHI without organizational HIPAA process

## Docs
- [TECHNICAL.md](./TECHNICAL.md) — architecture, crypto, RDH, LT, threat model, how to run and share
- [STATUS.md](./STATUS.md) — short shipped / not-shipped checklist
