# Optical Air-Gap — Status

**Policy:** [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md)  
**OSS:** [OPEN-SOURCE.md](./OPEN-SOURCE.md)  
**Install:** [INSTALL.md](./INSTALL.md)  
**Compatibility:** [COMPATIBILITY.md](./COMPATIBILITY.md) — all open-stack devices; GrapheneOS = reference  
**Phase 3:** [PHASE3.md](./PHASE3.md)

## Verification (2026-07-31)

**On-device success** — GrapheneOS\* / Termux (Pixel-class):

| Test | Result |
|------|--------|
| Soliton LT short | `hello-sentinel` recovered |
| Soliton LT longer | message recovered |
| age keygen | Vault files |
| Full chain | encrypt → stream → peel → decrypt → plaintext |
| Automation | `scripts/e2e-age-lt.sh` recovered `secret viewer message` |

\* [grapheneos.org](https://grapheneos.org/) — preferred hardened path, **not** exclusive.

## Phase 2 — done (code path)

- [x] age + Soliton LT + TRVL + golden k=8  
- [x] CLI + e2e + exact length prefix  
- [x] QR HTML offline + gate v2  
- [x] paulmillr/qr wiring  
- [x] cargo vendor offline (on-device `--offline` green)  
- [x] CLI / e2e polish  

## Phase 2 — remaining non-code

- [ ] Multi-device optical lab — blocked on hardware (R10)  
- [ ] Concrete paulmillr/qr binary drop (USB)  
- [ ] Acoustic R6 — **DEFERRED**  

## Phase 3 — started

- [x] Primary = governance/IA (one adaptive rule)  
- [x] Access posture = all open-stack devices  
- [x] `decideOpticalAction` in `loop/hooks.ts`  
- [ ] Wire action into receiver / CLI status  
- [ ] Smoke on non-GrapheneOS host when available  
