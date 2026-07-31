# Optical Air-Gap — Phase 2

**Phase 1:** complete ([STATUS.md](./STATUS.md), issue #38).  
**This file:** goals, full task checklist, time estimates + **buffer hours**.

**Locks:** open source · no Meta/Google/Microsoft in core · encrypt-first · Destroy = Restart · `@sentinel.viewer` local-only · no new paid hardware required.

**Estimate basis:** single experienced developer, part-time sovereign pace, including tests/docs.  
**Buffer:** extra time for browser/device quirks, bad lighting tests, dependency/license rabbit holes, and doc rework — not scope creep into Phase 3.

| Unit | Meaning |
|------|--------|
| **Base** | Focused implementation + tests if things go clean |
| **Buffer** | Contingency on top of base |
| **Planned** | Base + buffer (use this for scheduling) |
| **h / d** | Hours / ~6–8 h days |

**Default buffer policy:** ~25–40% of base on coding items; higher on device/optical and optional research (acoustic, new RDH).

---

## Rollup (base → planned with buffer)

| ID | Theme | Base | Buffer | **Planned** |
|----|--------|------|--------|-------------|
| P2-1 | jsQR fallback receiver | 6–10 h | +3–4 h | **9–14 h** |
| P2-2 | Robust Soliton default | 8–14 h | +3–5 h | **11–19 h** |
| P2-3 | Cargo vendor / offline | 2–4 h | +1–2 h | **3–6 h** |
| P2-4 | Optical reliability pack | 12–20 h | +5–8 h | **17–28 h** |
| P2-5 | Acoustic secondary (optional) | 16–28 h | +8–12 h | **24–40 h** |
| P2-6 | RDH metrics only | 2–6 h | +1–2 h | **3–8 h** |
| P2-6b | RDH new backend (if needed) | 20–40 h | +8–15 h | **28–55 h** |
| P2-7 | Loop / IA-of-IA wiring | 6–12 h | +2–4 h | **8–16 h** |
| P2-8 | CLI / release polish | 4–8 h | +2–3 h | **6–11 h** |
| Cross-cutting | Interop, deps, issues | 3–6 h | +2–3 h | **5–9 h** |
| **Core Phase 2** (no P2-5, no P2-6b) | | ~41–74 h | ~18–29 h | **~59–103 h (~9–16 d)** |
| **+ Acoustic** | | | | **~83–143 h** |
| **+ Acoustic + RDH backend** | | | | **~111–198 h (~16–30 d)** |

Suggested order: **P2-1 → P2-2 → P2-4 → P2-3 → P2-7 → P2-8 → P2-6 → P2-5**.

---

## Full task list (base + buffer)

### P2-1 — jsQR fallback receiver · Planned **9–14 h** (base 6–10 + buffer 3–4)

| Task | Base | Buffer |
|------|------|--------|
| Choose MIT/Apache decoder; NOTICE | 0.5–1 h | +0.5 h license edge cases |
| Vendor under `optical/vendor/` | 0.5 h | — |
| Feature-detect + canvas branch | 1.5–2.5 h | +1 h WebView quirks |
| Gate reuse + dedup | 1 h | +0.5 h |
| Status UI decoder path | 0.5 h | — |
| Test Chromium path | 0.5–1 h | +0.5 h |
| Test non-BarcodeDetector | 1–2 h | +1 h device variance |
| GrapheneOS notes | 0.5–1 h | +0.5 h |
| INSTALL + STATUS | 0.5 h | — |

**Done when:** known payload recovers without BarcodeDetector.

---

### P2-2 — Robust Soliton default · Planned **11–19 h** (base 8–14 + buffer 3–5)

| Task | Base | Buffer |
|------|------|--------|
| Document c, delta, K | 0.5–1 h | — |
| Precompute μ / CDF | 1–1.5 h | +0.5 h numeric edge K |
| Replace degree in lt-core.ts | 1.5–2.5 h | +1 h interop breakage |
| Align qr-sender inlined/bundle | 1–2 h | +1 h |
| Port CDF to Rust lt.rs | 1.5–2.5 h | +1 h |
| Align TS/Rust defaults | 0.5 h | — |
| Degree histogram tests | 1–1.5 h | +0.5 h |
| Peel overhead K∈{8,16,32,64} | 1.5–2.5 h | +1 h flaky seeds |
| Optional symbols_needed | 0.5–1 h | — |
| TECHNICAL.md | 0.5 h | — |

**Done when:** Soliton is default TS+Rust; overhead band documented.

---

### P2-3 — Cargo vendor / offline · Planned **3–6 h** (base 2–4 + buffer 1–2)

| Task | Base | Buffer |
|------|------|--------|
| cargo vendor / tarball | 0.5–1 h | +0.5–1 h path/CI friction |
| .cargo/config.toml | 0.25 h | — |
| INSTALL offline section | 0.5 h | +0.25 h |
| Verify build/test/run --offline | 0.5–1 h | +0.5 h |
| Vendor size note | 0.25 h | — |
| Optional CI offline | 0.5–1 h | +0.5 h |

**Done when:** `cargo build --offline` after one vendor step.

---

### P2-4 — Optical reliability · Planned **17–28 h** (base 12–20 + buffer 5–8)

**Gate v2** — base 3–5 h + buffer **+1–2 h** → planned **4–7 h**  
**QR capacity** — base 6–10 h + buffer **+2–4 h** → planned **8–14 h**  
**Stream + field log** — base 3–5 h + buffer **+2 h** → planned **5–7 h**  

Buffer covers: bad lighting, camera focus, encoder bugs on large versions, re-running Acer↔Pixel trials.

**Done when:** ~200-byte age ciphertext optical attempt logged.

---

### P2-5 — Acoustic (optional) · Planned **24–40 h** (base 16–28 + buffer 8–12)

Buffer covers: codec dead-ends, mic permission UX on GrapheneOS, ambient noise retries, license swaps.

**Done when:** short age blob speaker→mic offline round-trip.

---

### P2-6 — RDH capacity

| Path | Base | Buffer | Planned |
|------|------|--------|--------|
| Metrics only | 2–6 h | +1–2 h | **3–8 h** |
| New backend (PEE/PVO) | 20–40 h | +8–15 h | **28–55 h** |

**Done when:** metrics close item **or** alternate RDH flagged + tested.

---

### P2-7 — Loop / IA-of-IA · Planned **8–16 h** (base 6–12 + buffer 2–4)

Buffer covers: event wiring edge cases, policy schema rework, one extra adaptive experiment.

**Done when:** one offline adaptive behavior observable.

---

### P2-8 — CLI / release polish · Planned **6–11 h** (base 4–8 + buffer 2–3)

Buffer covers: Windows path issues, zip/checksum tooling, doc drift fixes.

**Done when:** frame-stream + file crypt; docs match.

---

## Cross-cutting · Planned **5–9 h** (base 3–6 + buffer 2–3)

TRVL vectors, age interop smoke, license checks, per-P2 issues, STATUS updates.

---

## Non-goals (0 h + 0 buffer)

- Pixel WiFi CSI / through-wall  
- Public DNS for `sentinel.viewer`  
- Google/Meta/Microsoft SDKs in core  
- Cloud Vault / hosted keys  
- HIPAA certification-from-repo claims  

---

## How to use the buffer

1. Schedule **Planned** hours, not Base.  
2. Burn buffer only on the risks above — not new features.  
3. If buffer exhausted mid-item, cut optional subtasks (e.g. CI offline, symbols_needed helper) before expanding scope.  
4. Unused buffer does **not** automatically fund P2-5/P2-6b.

---

## Suggested issue titles

```
optical-airgap P2-1: jsQR fallback (planned 9–14h)
optical-airgap P2-2: Robust Soliton default (planned 11–19h)
optical-airgap P2-3: cargo vendor offline (planned 3–6h)
optical-airgap P2-4: optical reliability (planned 17–28h)
optical-airgap P2-5: acoustic secondary (planned 24–40h)
optical-airgap P2-6: RDH metrics / optional PEE (planned 3–8h / 28–55h)
optical-airgap P2-7: loop adaptive policy (planned 8–16h)
optical-airgap P2-8: CLI + release polish (planned 6–11h)
```
