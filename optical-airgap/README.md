# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer for The Remote Viewer.

**Branch:** `TheRemoteViewer` · **Issue:** [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38) · **License:** MIT  
**Install:** [INSTALL.md](./INSTALL.md) · **Devices:** [COMPATIBILITY.md](./COMPATIBILITY.md) · **Tech:** [TECHNICAL.md](./TECHNICAL.md) · **Status:** [STATUS.md](./STATUS.md)

## Phase 1 status: complete

```
plaintext → age → RDH → LT (TRVL frames) → offline QR → camera/paste → peel → age decrypt
```

| Area | Location |
|------|----------|
| TS age / RDH / pipeline | `crypto/`, `rdh/`, `pipeline/` |
| LT + TRVL + Soliton | `fountain/` |
| Offline QR send | `optical/qr-sender.html` + `qrcode-lite.js` |
| Receive + gate + peel | `optical/qr-receiver.html` |
| Loop hooks | `loop/hooks.ts` |
| Rust + CLI | `rust/` (`trv-optical`) |

## Prerequisites

- **Desktop:** Git, Node 20+ (TS path) and/or Rust 1.74+ (`optical-airgap/rust`)
- **Termux:** `git`, `nodejs`, optional `age`
- **Not required:** Play Services, Meta/Microsoft SDKs, public DNS, paid hardware

## Quick start

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer && git checkout TheRemoteViewer
cd optical-airgap/crypto && npm install
# Rust:
cd ../rust && cargo test && cargo run --bin trv-optical -- keygen
```

Open `optical/qr-sender.html` and `optical/qr-receiver.html` from the `optical/` folder.

## Design locks

- Encrypt-first (RDH never sees plaintext)
- Zero Meta / Google / Microsoft in core path
- Destroy = Restart wipes keys, addresses, loop state
- `@sentinel.viewer` is local-only
- Outside email only ever sees ciphertext

## Phase 2 (optional)

jsQR fallback, Soliton-as-default everywhere, cargo vendor, acoustic path, larger QR versions.
