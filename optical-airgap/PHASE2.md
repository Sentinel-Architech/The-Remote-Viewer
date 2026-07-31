# Optical Air-Gap — Phase 2

**Phase 1:** complete ([STATUS.md](./STATUS.md), issue #38).  
**This file:** goals, full task checklist, **time estimates**.

**Locks:** open source · no Meta/Google/Microsoft in core · encrypt-first · Destroy = Restart · `@sentinel.viewer` local-only · no new paid hardware required.

**Estimate basis:** single experienced developer, part-time sovereign pace, including tests/docs. Ranges absorb device/browser variance. Sums are **not** calendar deadlines.

| Unit | Meaning |
|------|--------|
| **h** | focused hours |
| **d** | ~6–8 focused hours |

---

## Rollup (effort only)

| ID | Theme | Estimate |
|----|--------|----------|
| P2-1 | jsQR fallback receiver | **6–10 h** |
| P2-2 | Robust Soliton default | **8–14 h** |
| P2-3 | Cargo vendor / offline | **2–4 h** |
| P2-4 | Optical reliability pack | **12–20 h** |
| P2-5 | Acoustic secondary | **16–28 h** |
| P2-6 | Higher-capacity RDH (if needed) | **2–6 h** metrics only · **20–40 h** if new backend |
| P2-7 | Loop / IA-of-IA wiring | **6–12 h** |
| P2-8 | CLI / release polish | **4–8 h** |
| Cross-cutting | Interop vectors, dep policy, issues | **3–6 h** |
| **Phase 2 total (excl. optional P2-5 + full P2-6 backend)** | | **~41–74 h (~6–12 d)** |
| **With acoustic + new RDH backend** | | **~77–142 h (~12–24 d)** |

Suggested order still: **P2-1 → P2-2 → P2-4 → P2-3 → P2-7 → P2-8 → P2-6 → P2-5**.

---

## Full task list (with estimates)

### P2-1 — jsQR (or pure) fallback receiver · **6–10 h**

| Task | Est. |
|------|------|
| Choose MIT/Apache decoder; `optical/vendor/NOTICE` | 0.5–1 h |
| Vendor single file under `optical/vendor/` (no CDN) | 0.5 h |
| Feature-detect `BarcodeDetector`; branch to vendor on canvas | 1.5–2.5 h |
| Reuse quality gate before decode; dedup decoded strings | 1 h |
| Status UI: which decoder path is active | 0.5 h |
| Test Chromium + BarcodeDetector still works | 0.5–1 h |
| Test non-BarcodeDetector recovers TRVL stream | 1–2 h |
| GrapheneOS browser notes (what works / paste) | 0.5–1 h |
| Update INSTALL.md + STATUS.md | 0.5 h |

**Done when:** camera or paste recovers known payload without BarcodeDetector.

---

### P2-2 — Robust Soliton as default encoder path · **8–14 h**

| Task | Est. |
|------|------|
| Document `c`, `delta`, `K` in `fountain/lt-notes.md` | 0.5–1 h |
| Precompute μ and CDF from `robust-soliton.ts` | 1–1.5 h |
| Replace simplified degree in `lt-core.ts` (seed-deterministic) | 1.5–2.5 h |
| Align `qr-sender.html` inlined encoder or shared bundle | 1–2 h |
| Port CDF sampler to Rust `fountain/lt.rs` | 1.5–2.5 h |
| Align TS/Rust defaults (`c=0.1`, `delta=0.05`) | 0.5 h |
| Unit tests: degree histogram vs μ | 1–1.5 h |
| Integration: zero-loss peel overhead K ∈ {8,16,32,64} | 1.5–2.5 h |
| Optional `symbols_needed` helper | 0.5–1 h |
| Update TECHNICAL.md LT section | 0.5 h |

**Done when:** default encode is Soliton in TS + Rust; overhead band documented ≈ `K×(1.05–1.2)` zero-loss.

---

### P2-3 — Cargo vendor / offline Rust build · **2–4 h**

| Task | Est. |
|------|------|
| `cargo vendor` + tree or release tarball | 0.5–1 h |
| `.cargo/config.toml` replace-with vendored | 0.25 h |
| INSTALL.md “Rust offline” section | 0.5 h |
| Verify `build` / `test` / `run --offline` | 0.5–1 h |
| Note vendor disk size in STATUS | 0.25 h |
| Optional CI offline job | 0.5–1 h |

**Done when:** `cargo build --offline` works after one networked vendor step.

---

### P2-4 — Optical reliability pack · **12–20 h**

#### Gate v2 · **3–5 h**
| Task | Est. |
|------|------|
| Configurable luminance thresholds | 0.5–1 h |
| Laplacian (or similar) blur reject | 1–2 h |
| Count `gateRejections` for loop metrics | 0.5 h |
| UI: last gate pass/fail reason | 0.5–1 h |

#### Framing / QR capacity · **6–10 h**
| Task | Est. |
|------|------|
| Evaluate byte-mode TRVL vs base64url | 1–2 h |
| Define content convention if byte-mode | 0.5–1 h |
| Extend `qrcode-lite` or vendor encoder v12–20 | 3–5 h |
| Benchmark max payload ECC L/M | 1–1.5 h |
| Recommended `blockSize` vs QR version table | 0.5–1 h |

#### Stream behavior · **3–5 h**
| Task | Est. |
|------|------|
| Sender profiles safe / normal / fast | 0.5–1 h |
| Stronger seed-level dedup | 0.5–1 h |
| Sequence stats (unique seeds / window) | 0.5–1 h |
| Indoor Acer→Pixel test log template + one run | 1.5–2.5 h |

**Done when:** ~200-byte age ciphertext optical attempt logged (success or blockers).

---

### P2-5 — Acoustic secondary channel (optional) · **16–28 h**

| Task | Est. |
|------|------|
| Select open codec; license audit | 2–4 h |
| Map payload = age/TRVL opaque bytes only | 1–2 h |
| Explicit gesture mic/speaker UX | 2–3 h |
| GrapheneOS mic permission notes | 0.5–1 h |
| Implement encode/play + record/decode path | 8–14 h |
| Demo + doc: optical primary, acoustic fallback | 1–2 h |
| Threat note (ambient vs shoulder-surf) | 0.5–1 h |

**Done when:** one short age blob speaker→mic offline round-trip.

---

### P2-6 — Higher-capacity RDH (conditional)

**Metrics-only path · 2–6 h**
| Task | Est. |
|------|------|
| Instrument capacity need vs peak | 1–2 h |
| Sample cover stats (flat vs natural) | 1–2 h |
| Write metrics conclusion; close if HS enough | 0.5–1 h |

**New backend path (only if metrics fail) · 20–40 h**
| Task | Est. |
|------|------|
| Prototype PEE or PVO (encrypt-first) | 12–24 h |
| Feature flag `histogram \| pee` | 1–2 h |
| Round-trip + checksum tests | 3–6 h |
| Docs + SECURITY note | 1–2 h |

**Done when:** metrics close item **or** alternate RDH flagged and tested.

---

### P2-7 — Recursive IA-of-IA / loop wiring · **6–12 h**

| Task | Est. |
|------|------|
| Receiver emit optical metrics events | 1–2 h |
| Optional sender metrics | 0.5–1 h |
| Map metrics → coordinator policy notes | 1–1.5 h |
| One adaptive behavior (e.g. FPS after CRC spike) | 2–4 h |
| Vault-local policy schema (versioned JSON) | 1–1.5 h |
| Destroy = Restart wipe helper + doc | 0.5–1 h |
| Guarantee no metric exfil | 0.25 h |
| Unit-test pure policy functions | 0.5–1 h |

**Done when:** one offline adaptive behavior is observable.

---

### P2-8 — CLI / UX / release polish · **4–8 h**

| Task | Est. |
|------|------|
| `trv-optical frame-stream` | 1–2 h |
| File encrypt/decrypt path args | 0.5–1 h |
| Identity file examples (`age-keygen -o` compatible) | 0.5 h |
| Windows / WSL2 notes | 0.5 h |
| Optional static optical zip + checksums | 1–2 h |
| README link check; COMPATIBILITY decoder matrix row | 0.5–1 h |

**Done when:** CLI does frame-stream + file crypt; docs match reality.

---

## Cross-cutting · **3–6 h**

| Task | Est. |
|------|------|
| TRVL byte-identical TS/Rust test vectors | 1–2 h |
| age interop smoke (rage/typage/Rust) | 0.5–1 h |
| License + no-Big-Tech check on each new dep | 0.5 h each |
| STATUS checkboxes as items complete | ongoing |
| One GitHub issue per P2-x | 0.5–1 h |

---

## Non-goals (0 h scheduled)

- Pixel WiFi CSI / through-wall  
- Public DNS for `sentinel.viewer`  
- Google/Meta/Microsoft SDKs in core  
- Cloud Vault / hosted keys  
- HIPAA certification claims from the repo alone  

---

## Suggested issue titles

```
optical-airgap P2-1: jsQR fallback receiver (6–10h)
optical-airgap P2-2: Robust Soliton default TS+Rust (8–14h)
optical-airgap P2-3: cargo vendor offline build (2–4h)
optical-airgap P2-4: optical reliability pack (12–20h)
optical-airgap P2-5: acoustic secondary channel (16–28h)
optical-airgap P2-6: RDH capacity metrics / optional PEE (2–40h)
optical-airgap P2-7: loop hooks adaptive policy (6–12h)
optical-airgap P2-8: CLI frame-stream and release polish (4–8h)
```
