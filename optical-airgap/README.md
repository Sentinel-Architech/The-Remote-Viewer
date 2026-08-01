# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer for The Remote Viewer.

**Branch:** `TheRemoteViewer` · **License:** MIT  
**The Sentinel Standard:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**Install:** [INSTALL.md](./INSTALL.md) · **Devices:** [COMPATIBILITY.md](./COMPATIBILITY.md) · **Tech:** [TECHNICAL.md](./TECHNICAL.md)  
**Status:** [STATUS.md](./STATUS.md) · **Phase 2:** [PHASE2.md](./PHASE2.md)

## Phase 1 — complete

```
plaintext → age → RDH → LT (Robust Soliton) → TRVL → offline QR → peel → decrypt
```

**Fountain policy (normative):** Luby Transform + **Robust Soliton** (`c=0.1`, `δ=0.05`).  
**Not standard:** RaptorQ / RFC 6330 precode as the default path — see Sentinel Standard.

| Area | Location |
|------|----------|
| TS age / RDH / pipeline | `crypto/`, `rdh/`, `pipeline/` |
| LT + TRVL + Soliton | `fountain/` |
| Offline QR send/receive | `optical/` |
| Loop hooks | `loop/hooks.ts` |
| Rust + CLI | `rust/` (`trv-optical`) |

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

Open `optical/qr-sender.html` and `optical/qr-receiver.html`.

## Design locks

- Encrypt-first · Zero Meta/Google/Microsoft in core · Destroy = Restart  
- `@sentinel.viewer` local-only · GrapheneOS from official source only  
- **Sentinel Standard 1.0** fountain = Soliton LT, not RaptorQ  
