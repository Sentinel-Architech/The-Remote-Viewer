# Optical Air-Gap — Phase 2

**Phase 1:** complete ([STATUS.md](./STATUS.md)).  
**This file:** tasks · base hours · buffer · **risk contingency**.  
**R6 (acoustic) full detail:** [PHASE2-R6.md](./PHASE2-R6.md)

**Locks:** open source · no Meta/Google/Microsoft in core · encrypt-first · Destroy = Restart · `@sentinel.viewer` local-only · no new paid hardware required.

| Term | Meaning |
|------|--------|
| **Base** | Clean-path implementation + tests |
| **Buffer** | Routine friction (quirks, docs, one retest) |
| **Risk contingency** | Named risks with trigger → response → extra hours or **cut scope** |
| **Planned** | Base + buffer (day-to-day schedule) |
| **Worst reasonable** | Planned + activated contingencies (do not schedule all at once) |

**Default buffer:** ~25–40% of base. Contingency is **not** free scope—it is pre-agreed fallback when a trigger fires.

---

## Rollup — effort

| ID | Theme | Base | Buffer | **Planned** | Contingency pool (if triggered) |
|----|--------|------|--------|-------------|----------------------------------|
| P2-1 | paulmillr/qr optional decoder | 6–10 h | +3–4 h | **9–14 h** | +4–8 h |
| P2-2 | Robust Soliton | 8–14 h | +3–5 h | **11–19 h** | +4–10 h |
| P2-3 | Cargo vendor | 2–4 h | +1–2 h | **3–6 h** | +2–4 h |
| P2-4 | Optical reliability | 12–20 h | +5–8 h | **17–28 h** | +8–16 h |
| P2-5 | Acoustic (optional) | 16–28 h | +8–12 h | **24–40 h** | +12–24 h or **defer** — see [R6 detail](./PHASE2-R6.md) |
| P2-6 | RDH metrics | 2–6 h | +1–2 h | **3–8 h** | +2 h |
| P2-6b | RDH new backend | 20–40 h | +8–15 h | **28–55 h** | +15–25 h or **stop** |
| P2-7 | Loop / IA-of-IA | 6–12 h | +2–4 h | **8–16 h** | +4–8 h |
| P2-8 | CLI / polish | 4–8 h | +2–3 h | **6–11 h** | +2–4 h |
| Cross-cutting | Interop / issues | 3–6 h | +2–3 h | **5–9 h** | +3–6 h |
| **Core Phase 2** | no P2-5, no P2-6b | ~41–74 h | ~18–29 h | **~59–103 h** | **+27–56 h if many risks fire** |

**Scheduling rule:** plan **Planned** only. Pull from contingency **per trigger**, log which risk, prefer **cut scope** over unbounded hours. **P2-5 never spends core P2 budget.**

**Progress (2026-08-07):** Exact original length done. P2-1 docs + receiver wiring switched to paulmillr/qr (concrete browser build still optional USB drop).

---

## Risk contingency register

### How to use

1. Work against **Planned** hours.  
2. When a **Trigger** is observed, apply **Response** (mitigate or cut).  
3. Charge time to that risk’s contingency—not to buffer of unrelated items.  
4. If contingency for that risk is exhausted → **mandatory scope cut** or park the item.  
5. Review register when starting each P2-x.

---

### R1 — BarcodeDetector / decoder dead-end (P2-1)

| | |
|--|--|
| **Risk** | No usable pure decoder under license rules; or canvas decode too slow/inaccurate on target devices |
| **Trigger** | >4 h stuck without a decoding path that passes one known TRVL frame |
| **Response** | (1) Use paulmillr/qr (preferred) (2) **Ship paste-only + file import of frame lines** as supported mode (3) Document camera as best-effort |
| **Contingency** | +4–8 h |
| **Hard cut** | Camera decode deferred; paste/file remains Phase 2 acceptance for P2-1 |

---

### R2 — Soliton interop split (P2-2)

| | |
|--|--|
| **Risk** | TS and Rust degree streams diverge; mixed sender/receiver fails peel |
| **Trigger** | Cross-impl peel test fails after parameter “alignment” |
| **Response** | Freeze golden seed→degree vectors in `fountain/testdata/`; both langs must match vectors before feature default |
| **Contingency** | +4–10 h |
| **Hard cut** | Keep simplified degree as default; Soliton behind flag `lt_degree=soliton\|legacy` |

---

### R3 — Vendor / offline cargo failure (P2-3)

| | |
|--|--|
| **Risk** | Vendor tree huge, path broken on Windows, or crate yank/feature mismatch |
| **Trigger** | `--offline` build fails after documented vendor steps |
| **Response** | Vendor tarball + checksum in release; or document “networked first build only” for Acer with one-time allowlist |
| **Contingency** | +2–4 h |
| **Hard cut** | Offline cargo is best-effort; Phase 1 `cargo build` online remains valid |

---

### R4 — Optical field failure (P2-4)

| | |
|--|--|
| **Risk** | Indoor Acer↔Pixel cannot complete ~200-byte transfer in reasonable time |
| **Trigger** | Three controlled trials, peel never reaches k/k within 5 minutes each |
| **Response** | (1) Force `safe` FPS + larger QR quiet zone (2) Shrink blockSize / more symbols (3) **Accept paste-assisted hybrid** as documented success path |
| **Contingency** | +8–16 h |
| **Hard cut** | Publish measured failure report; Phase 2 optical “reliability” becomes “instrumented + gated” without claiming field success |

---

### R5 — QR capacity / encoder wall (P2-4)

| | |
|--|--|
| **Risk** | qrcode-lite cannot grow; vendored encoder conflicts with air-gap rules |
| **Trigger** | Cannot fit TRVL frame at chosen blockSize without splitting protocol |
| **Response** | Multi-QR continuation already inherent to LT—document smaller blockSize; defer large-version encoder |
| **Contingency** | +4–8 h (subset of P2-4 pool) |
| **Hard cut** | Cap blockSize at working maximum; no v20 requirement |

---

### R6 — Acoustic codec / legal / UX trap (P2-5) · **DETAIL → [PHASE2-R6.md](./PHASE2-R6.md)**

| | |
|--|--|
| **Risk** | Three families: **R6-L** license, **R6-P** platform/UX (GrapheneOS mic), **R6-E** ambient physics |
| **Default posture** | Optical primary; P2-5 optional; **prefer defer** over core-budget burn |
| **Pre-start gates** | G1–G5: docs primary optical, encrypt-only payload, license shortlist, no Big Tech runtime, explicit `P2-5 STARTED` |
| **Phased burn** | A license/spike ≤4 h → B payload/gesture ≤8 h → C quiet-room demo ≤12 h → **D contingency only if go criteria met** |
| **Go criteria (all)** | (1) License committed (2) ≥32-byte age blob offline TX (3) gesture-only mic |
| **Contingency** | **+12–24 h max** after go; else **0 h** |
| **Forbidden** | Always-on mic, plaintext modem, cloud relay, paying optical debt from R6 hours, second codec before first demo |
| **Hard cut** | STATUS `P2-5 DEFERRED` or `CANCELLED`; experimental quiet-room soft-ship only if demo existed |
| **Does not auto-start** when R4 optical fails — acoustic is not a free rescue |

---

### R7 — RDH capacity crisis (P2-6 / P2-6b)

| | |
|--|--|
| **Risk** | Real covers cannot hold short age blobs; new stego backend expands forever |
| **Trigger** | Metrics show systematic capacity fail on representative covers |
| **Response** | Prefer **fragment ciphertext across multiple covers/frames** over new stego math; if backend started, time-box prototype to contingency cap |
| **Contingency** | Metrics +2 h; backend +15–25 h max |
| **Hard cut** | Stop P2-6b at cap; ship multi-cover / multi-frame procedure instead |

---

### R8 — Loop policy complexity (P2-7)

| | |
|--|--|
| **Risk** | IA-of-IA wiring becomes unbounded design debate |
| **Trigger** | >8 h without one measurable adaptive behavior |
| **Response** | Ship **one** hardcoded rule (e.g. CRC spike → status warn “lower FPS”); defer Vault policy schema |
| **Contingency** | +4–8 h |
| **Hard cut** | Hooks emit metrics only; no adaptive behavior required for Phase 2 close |

---

### R9 — Platform / toolchain drift (cross-cutting)

| | |
|--|--|
| **Risk** | Node, Rust, age crate, or browser API breaks Phase 1 assumptions |
| **Trigger** | Phase 1 smoke (age round-trip, TRVL CRC, sender load) fails on update |
| **Response** | Pin versions in package/Cargo; repair Phase 1 before new P2 features |
| **Contingency** | +3–6 h |
| **Hard cut** | Freeze dependency upgrades until Phase 2 core items done |

---

### R10 — Maintainer bandwidth / no-device constraint

| | |
|--|--|
| **Risk** | No access to Pixel/Acer for optical validation (known user constraint) |
| **Trigger** | Device tests blocked >1 week wall-clock |
| **Response** | Complete all phone-optional code + synthetic tests; mark field trials “blocked on device”; do not hold P2-1/2/3/7/8 for camera |
| **Contingency** | 0 extra code hours; **schedule slip only** |
| **Hard cut** | Phase 2 “code complete” vs “field verified” tracked as separate STATUS lines |

---

## Contingency budget (core Phase 2)

| Bucket | Hours | Notes |
|--------|-------|-------|
| Planned core | **59–103 h** | Schedule this |
| Contingency ceiling (if many risks fire) | **+27–56 h** | Not pre-allocated to calendar |
| **Worst reasonable core** | **~86–159 h** | Only if R1–R4, R8–R9 all bite |
| P2-5 / R6 | Separate | Optional; **prefer defer**; see [PHASE2-R6.md](./PHASE2-R6.md) |
| P2-6b | Separate | Time-boxed backend |

**Governance:** activating >20 h total **core** contingency requires an explicit STATUS note listing risk IDs. Prefer hard cuts over silent overtime.

---

## Non-goals (0 h, no contingency)

- Pixel WiFi CSI / through-wall  
- Public DNS for `sentinel.viewer`  
- Google/Meta/Microsoft SDKs in core  
- Cloud Vault / hosted keys  
- HIPAA certification-from-repo claims  

---

## Suggested issue titles

```
optical-airgap P2-1: paulmillr/qr optional decoder (planned 9–14h, R1 cont.)
optical-airgap P2-2: Robust Soliton default (planned 11–19h, R2 cont.)
optical-airgap P2-3: cargo vendor offline (planned 3–6h, R3 cont.)
optical-airgap P2-4: optical reliability (planned 17–28h, R4/R5 cont.)
optical-airgap P2-5: acoustic secondary (planned 24–40h, R6 detail PHASE2-R6.md)
optical-airgap P2-6: RDH metrics / PEE (planned 3–8h / 28–55h, R7 cont.)
optical-airgap P2-7: loop adaptive policy (planned 8–16h, R8 cont.)
optical-airgap P2-8: CLI + release polish (planned 6–11h)
```
