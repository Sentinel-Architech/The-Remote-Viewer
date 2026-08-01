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

## Not done

- [ ] Multi-device optical lab  
- [ ] jsQR optional vendor  
- [ ] cargo vendor  
- [ ] Acoustic R6 (deferred)  
- [ ] Exact payload length in LT  
