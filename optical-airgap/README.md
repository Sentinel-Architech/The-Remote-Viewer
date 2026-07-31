# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer for The Remote Viewer.

**Branch:** `TheRemoteViewer` · **License:** MIT  
**Install:** [INSTALL.md](./INSTALL.md) · **Devices:** [COMPATIBILITY.md](./COMPATIBILITY.md) · **Tech:** [TECHNICAL.md](./TECHNICAL.md)  
**Status:** [STATUS.md](./STATUS.md) · **Phase 2:** [PHASE2.md](./PHASE2.md)

## Phase 1 — complete

```
plaintext → age → RDH → LT (TRVL frames) → offline QR → camera/paste → peel → decrypt
```

| Area | Location |
|------|----------|
| TS age / RDH / pipeline | `crypto/`, `rdh/`, `pipeline/` |
| LT + TRVL + Soliton helper | `fountain/` |
| Offline QR send | `optical/qr-sender.html` + `qrcode-lite.js` |
| Receive + gate + peel | `optical/qr-receiver.html` |
| Loop hooks | `loop/hooks.ts` |
| Rust + CLI | `rust/` (`trv-optical`) |

## Phase 2 — planned

Hardening and reach; details in **[PHASE2.md](./PHASE2.md)**.

| Priority | ID | Summary |
|----------|-----|--------|
| 1 | P2-1 | Vendored jsQR fallback (no BarcodeDetector) |
| 2 | P2-2 | Robust Soliton default in TS + Rust encoders |
| 3 | P2-4 | Gate v2, larger QR, denser byte-mode frames |
| 4 | P2-3 | Cargo vendor / offline Rust build |
| 5 | P2-7 | Live loop metrics → adaptive policy |
| 6 | P2-8 | CLI / release polish |
| 7 | P2-6 | Higher-capacity RDH if needed |
| 8 | P2-5 | Optional acoustic secondary channel |

## Prerequisites

- **Desktop:** Git, Node 20+ and/or Rust 1.74+
- **Termux:** `git`, `nodejs`, optional `age`
- **Not required:** Play Services, Meta/Microsoft SDKs, public DNS, paid hardware

## Quick start

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer && git checkout TheRemoteViewer
cd optical-airgap/crypto && npm install
cd ../rust && cargo test && cargo run --bin trv-optical -- keygen
```

Open `optical/qr-sender.html` and `optical/qr-receiver.html` from the `optical/` folder.

## Design locks

- Encrypt-first (RDH never sees plaintext)
- Zero Meta / Google / Microsoft in core path
- Destroy = Restart wipes keys, addresses, loop state
- `@sentinel.viewer` is local-only
- Outside email only ever sees ciphertext
