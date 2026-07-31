# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer stack for The Remote Viewer.

**Repo path:** `optical-airgap/` on branch `TheRemoteViewer`  
**Tracking:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38  
**License:** MIT (see `LICENSE`) — zero Meta / Google / Microsoft in the core path  
**Install (step-by-step):** [INSTALL.md](./INSTALL.md)  
**Device compatibility:** [COMPATIBILITY.md](./COMPATIBILITY.md)  
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

## Compatible devices (summary)

| Device | Core crypto + RDH + LT | Optical send | Optical receive |
|--------|------------------------|--------------|-----------------|
| Obsolete Acer (Linux) | Yes | Yes | Optional webcam |
| Pixel 7 + GrapheneOS | Yes (Termux) | Yes | Yes when used |
| Tablet (Termux/sideload-capable) | Yes | Yes | If camera available |
| Termux CLI | Yes | No | Via later Android glue |

Full matrix, out-of-scope hardware, and pair topology: **[COMPATIBILITY.md](./COMPATIBILITY.md)**.

**Not compatible by design:** Play-Services-required stacks, Microsoft cloud key custody, Pixel WiFi CSI through-wall sensing.

## Prerequisites

You need **one** of the following environments. No paid cloud account and no Meta/Google/Microsoft SDKs are required for the core path.

### A — Desktop / Acer (recommended for first install)
| Requirement | Notes |
|-------------|--------|
| Git | Clone and update the repo |
| **Node.js 20+** | Required for `age-encryption` (typage) |
| npm | Ships with Node; used in `optical-airgap/crypto` |
| Optional: `tsx` or TypeScript | For running the smoke tests in INSTALL.md (`npx tsx` is enough) |

```bash
git --version
node -v    # expect v20.x or higher
npm -v
```

### B — Termux (GrapheneOS / Android)
| Requirement | Notes |
|-------------|--------|
| Termux | Prefer F-Droid on de-Googled devices |
| `git`, `nodejs` | `pkg install git nodejs` |
| Optional: `age` | `pkg install age` for native CLI encrypt/decrypt |

Phone is **not** required to install or unit-test age + RDH; only for later camera receive work.

### C — age CLI only (no npm)
| Requirement | Notes |
|-------------|--------|
| `age` binary | Distro package or Termux `pkg install age` |

Enough for keygen / encrypt / decrypt interoperability tests. The TypeScript RDH + pipeline path still needs A or B with Node 20+.

### Not required for core install
- Google Play Services, Meta, or Microsoft tooling
- Extra paid hardware
- Public DNS for `@sentinel.viewer` (local claim only)
- Camera (only needed for optical receive; sender demo is optional)

Full environment notes and troubleshooting: **[INSTALL.md](./INSTALL.md)**.

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

## Quick start

Full steps: **[INSTALL.md](./INSTALL.md)**

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
git checkout TheRemoteViewer
cd optical-airgap/crypto && npm install
```

Then follow INSTALL.md for age smoke test, RDH pipeline, and QR demo notes.

## Local Identity
```
anything@sentinel.viewer
```
Pure local claim bound to Vault / DID. Never registered on public DNS. Destroyed with Destroy = Restart.

## Not in scope (locked)
- WiFi CSI / through-wall sensing on Pixel 7 + GrapheneOS (hardware + OS isolation)
- Real ePHI without organizational HIPAA process

## Docs
- [COMPATIBILITY.md](./COMPATIBILITY.md) — device matrix (Acer, Pixel 7, tablet, Termux)
- [INSTALL.md](./INSTALL.md) — step-by-step install and first run
- [TECHNICAL.md](./TECHNICAL.md) — architecture, crypto, RDH, LT, threat model, share/contribute
- [STATUS.md](./STATUS.md) — short shipped / not-shipped checklist
