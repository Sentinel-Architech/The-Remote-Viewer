# TRV Sovereign Optical Air-Gap Comms

Local-first, zero-trust optical transfer for The Remote Viewer.

**Branch:** `TheRemoteViewer` · **License:** MIT  
**Standard:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**Open source:** [OPEN-SOURCE.md](./OPEN-SOURCE.md)  
**Install:** [INSTALL.md](./INSTALL.md) · **Devices:** [COMPATIBILITY.md](./COMPATIBILITY.md)  
**Status:** [STATUS.md](./STATUS.md) · **Phase 2:** [PHASE2.md](./PHASE2.md)

---

## Checklist (public)

### Done — verified 2026-07-31 (GrapheneOS\* + Termux)

- [x] age encrypt / decrypt (Rust `trv-optical` + TS `age-encryption`)
- [x] Robust Soliton LT (default) + TRVL1 framing
- [x] Golden degrees k=8 locked (TS ↔ Rust)
- [x] Full chain: encrypt → frame-stream → peel → decrypt → plaintext
- [x] Automation: [`scripts/e2e-age-lt.sh`](./scripts/e2e-age-lt.sh) (`$HOME` paths)
- [x] LT-only demo: [`scripts/e2e-lt-demo.sh`](./scripts/e2e-lt-demo.sh)
- [x] Offline QR sender / receiver HTML + gate v2 + FPS profiles
- [x] RDH histogram-shifting (encrypt-first; optional before LT)
- [x] Local `@sentinel.viewer` address helper
- [x] OSS inventory (no Meta / Google / Microsoft core)
- [x] Workspace membership for `cargo run`
- [x] Install guide + Termux troubleshooting

### Not done

- [ ] Acer ↔ phone optical (screen/camera) lab
- [ ] Optional jsQR under `optical/vendor/`
- [ ] `cargo vendor` offline tree
- [ ] Acoustic R6 (deferred)
- [ ] Exact LT payload length field
- [ ] Recursive IA-of-IA beyond hooks

\* GrapheneOS only from [grapheneos.org](https://grapheneos.org/).

---

## Verified path

```
plaintext → age → Soliton LT (TRVL) → peel → age decrypt
```

| Layer | Code |
|-------|------|
| Outbound | [`pipeline/full-path.ts`](./pipeline/full-path.ts) |
| Inbound | [`pipeline/peel-path.ts`](./pipeline/peel-path.ts) |
| Rust CLI | `rust/` → `trv-optical` |
| Browser | `optical/qr-sender.html` + `qr-receiver.html` |

## Quick start

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer && git checkout TheRemoteViewer
cd optical-airgap && npm install && npm run test:golden
cd rust && cargo test
```

Termux: use `$HOME` for files (not `/tmp`). Full chain: [INSTALL.md](./INSTALL.md).

```bash
bash scripts/e2e-age-lt.sh   # needs vault-recipient + vault-identity in $HOME
```

## Design locks

Encrypt-first · Soliton LT (not RaptorQ) · Zero Meta/Google/Microsoft core ·  
Destroy = Restart · `@sentinel.viewer` local-only · GrapheneOS official source only  
