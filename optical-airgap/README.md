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

See **[PHASE2.md](./PHASE2.md)** (tasks, hours, buffer, risk contingency). Acoustic R6 detail: [PHASE2-R6.md](./PHASE2-R6.md).

## Prerequisites

- **Desktop:** Git, Node 20+ and/or Rust 1.74+
- **Mobile Android\*:** prefer **GrapheneOS** + Termux (F-Droid)
- **Not required:** Play Services, Meta/Microsoft SDKs, public DNS, paid hardware

\* **Android\*** hardened path: install GrapheneOS only from **[grapheneos.org](https://grapheneos.org/)** · **[grapheneos.org/install](https://grapheneos.org/install/)**

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
- GrapheneOS (when used) from official source only — see footnote \*
