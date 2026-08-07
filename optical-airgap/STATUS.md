# Optical Air-Gap — Status

**Policy:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**OSS:** [OPEN-SOURCE.md](./OPEN-SOURCE.md)  
**Install:** [INSTALL.md](./INSTALL.md)

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
- [x] **Exact payload length in LT** (u32 BE prefix before block split; peel returns exact bytes) — 2026-08-07  

## Not done / Phase 2 remaining

- [ ] Multi-device optical lab (Acer ↔ phone) — blocked on hardware access (R10)  
- [ ] jsQR optional vendor drop  
- [ ] cargo vendor offline tree  
- [ ] Acoustic R6 — **DEFERRED** (see PHASE2-R6.md)  
- [ ] RDH metrics / light polish  
- [ ] CLI / loop polish  
