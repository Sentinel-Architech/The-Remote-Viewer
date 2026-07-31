# Optical Air-Gap — Phase 2

**Phase 1:** complete ([STATUS.md](./STATUS.md), issue #38).  
**This file:** tasks · base hours · buffer · **risk contingency**.

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
| P2-1 | jsQR fallback | 6–10 h | +3–4 h | **9–14 h** | +4–8 h |
| P2-2 | Robust Soliton | 8–14 h | +3–5 h | **11–19 h** | +4–10 h |
| P2-3 | Cargo vendor | 2–4 h | +1–2 h | **3–6 h** | +2–4 h |
| P2-4 | Optical reliability | 12–20 h | +5–8 h | **17–28 h** | +8–16 h |
| P2-5 | Acoustic (optional) | 16–28 h | +8–12 h | **24–40 h** | +12–24 h or **defer** |
| P2-6 | RDH metrics | 2–6 h | +1–2 h | **3–8 h** | +2 h |
| P2-6b | RDH new backend | 20–40 h | +8–15 h | **28–55 h** | +15–25 h or **stop** |
| P2-7 | Loop / IA-of-IA | 6–12 h | +2–4 h | **8–16 h** | +4–8 h |
| P2-8 | CLI / polish | 4–8 h | +2–3 h | **6–11 h** | +2–4 h |
| Cross-cutting | Interop / issues | 3–6 h | +2–3 h | **5–9 h** | +3–6 h |
| **Core Phase 2** | no P2-5, no P2-6b | ~41–74 h | ~18–29 h | **~59–103 h** | **+27–56 h if many risks fire** |

**Scheduling rule:** plan **Planned** only. Pull from contingency **per trigger**, log which risk, prefer **cut scope** over unbounded hours.

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
| **Response** | (1) Try alternate MIT decoder (2) **Ship paste-only + file import of frame lines** as supported mode (3) Document camera as best-effort |
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

### R6 — Acoustic codec / legal / UX trap (P2-5)

| | |
|--|--|
| **Risk** | Codec license unclear, mic UX rejected on GrapheneOS, or ambient noise makes link unusable |
| **Trigger** | No clean license **or** no successful transfer after planned hours |
| **Response** | **Defer P2-5 entire**; optical remains sole air-gap channel |
| **Contingency** | +12–24 h only if license + one demo both look viable mid-stream; else **0 h more** |
| **Hard cut** | Mark P2-5 cancelled in STATUS; do not burn core Phase 2 budget |

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
| P2-5 / P2-6b | Separate | Optional; prefer defer over consuming core contingency |

**Governance:** activating >20 h total contingency requires an explicit STATUS note listing risk IDs (R1…). Prefer hard cuts over silent overtime.

---

## Full task list (summary pointers)

Per-subtask base estimates remain as before; use **Planned** from the rollup table for scheduling. Detailed subtasks:

### P2-1 · Planned 9–14 h · Contingency R1 +4–8 h
Decoder vendor, BarcodeDetector branch, gate, tests, GrapheneOS notes, docs.

### P2-2 · Planned 11–19 h · Contingency R2 +4–10 h
Soliton CDF default TS+Rust, golden vectors, peel overhead tests, TECHNICAL.md.

### P2-3 · Planned 3–6 h · Contingency R3 +2–4 h
`cargo vendor`, config, offline verify, INSTALL.

### P2-4 · Planned 17–28 h · Contingency R4+R5 +8–16 h
Gate v2, QR capacity, stream profiles, field log template.

### P2-5 · Planned 24–40 h · Contingency R6 defer or +12–24 h
Optional acoustic; default disposition = **defer if blocked**.

### P2-6 · Planned 3–8 h (metrics) / 28–55 h (backend) · Contingency R7
Metrics first; backend time-boxed.

### P2-7 · Planned 8–16 h · Contingency R8 +4–8 h
Emit metrics; one adaptive behavior or metrics-only hard cut.

### P2-8 · Planned 6–11 h · Contingency +2–4 h
frame-stream, file crypt, docs, optional zip.

### Cross-cutting · Planned 5–9 h · Contingency R9–R10
Interop vectors, pins, issue hygiene; device-blocked field trials split in STATUS.

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
optical-airgap P2-1: jsQR fallback (planned 9–14h, R1 cont.)
optical-airgap P2-2: Robust Soliton default (planned 11–19h, R2 cont.)
optical-airgap P2-3: cargo vendor offline (planned 3–6h, R3 cont.)
optical-airgap P2-4: optical reliability (planned 17–28h, R4/R5 cont.)
optical-airgap P2-5: acoustic secondary (planned 24–40h, R6 defer-ok)
optical-airgap P2-6: RDH metrics / PEE (planned 3–8h / 28–55h, R7 cont.)
optical-airgap P2-7: loop adaptive policy (planned 8–16h, R8 cont.)
optical-airgap P2-8: CLI + release polish (planned 6–11h)
```
