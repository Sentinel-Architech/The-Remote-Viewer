# Optical Air-Gap — Status

**Policy:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**OSS:** [OPEN-SOURCE.md](./OPEN-SOURCE.md)  
**Install:** [INSTALL.md](./INSTALL.md)  
**Phase 3 draft:** [PHASE3.md](./PHASE3.md)

## Verification (2026-07-31)

**On-device success** — GrapheneOS\* / Termux (Pixel-class):

| Test | Result |
|------|--------|
| Soliton LT short | `hello-sentinel` recovered |
| Soliton LT longer | message recovered |
| age keygen | Vault files |
| Full chain | encrypt → stream → peel → decrypt → plaintext |
| Automation | `scripts/e2e-age-lt.sh` recovered `secret viewer message` |

\* [grapheneos.org](https://grapheneos.org/)

## Done

- [x] age + Soliton LT + TRVL + golden k=8  
- [x] CLI encrypt/decrypt/stream/peel/keygen  
- [x] e2e scripts (`$HOME`)  
- [x] QR HTML offline + gate v2  
- [x] RDH optional path  
- [x] Public docs (README / INSTALL / OPEN-SOURCE / Standard)  
- [x] **Exact payload length in LT** (u32 BE prefix) — 2026-08-07  
- [x] **Optional QR decoder → paulmillr/qr** (docs + receiver) — 2026-08-07  
- [x] **Cargo vendor offline** (`scripts/vendor-offline.sh`, on-device `--offline` tests) — 2026-08-07  
- [x] **CLI / e2e polish (P2-8)** — 2026-08-07  

## Phase 2 remaining (non-code / blocked)

- [ ] Multi-device optical lab (Acer ↔ phone) — blocked on hardware (R10)  
- [ ] Concrete paulmillr/qr browser build under `optical/vendor/` (USB drop)  
- [ ] Acoustic R6 — **DEFERRED**  

**Phase 2 posture:** code-complete for no-hardware path. Field optical still pending devices.
