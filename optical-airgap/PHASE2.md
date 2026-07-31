# Optical Air-Gap — Phase 2 Roadmap

**Phase 1:** complete (see [STATUS.md](./STATUS.md)).  
**Phase 2:** optional hardening and reach — no new paid hardware required.

**Constraints still locked:** open source, zero Meta/Google/Microsoft in core path, encrypt-first, Destroy = Restart, `@sentinel.viewer` local-only.

---

## Goals

1. Work on browsers/OS builds that lack `BarcodeDetector`.
2. Make LT degree sampling production-grade by default (full Robust Soliton).
3. Fully offline Rust builds (vendored crates).
4. Stronger optical reliability (gate tuning, multi-frame, larger QR).
5. Optional secondary air-gap channel (acoustic).
6. Higher RDH capacity only when measured need exists.
7. Wire loop hooks into real on-device expert policy (IA-of-IA).

---

## Work items

### P2-1 — jsQR (or equivalent) fallback receiver
**Why:** Firefox, many WebViews, and some GrapheneOS browser builds may not expose `BarcodeDetector`.

| Task | Detail |
|------|--------|
| Vendor | Single-file or `optical/vendor/jsQR.js` (MIT/Apache only) |
| Integration | `qr-receiver.html`: try BarcodeDetector → else jsQR on gated canvas frames |
| No CDN | Same rule as sender |
| Test | Acer webcam + Pixel camera without BarcodeDetector |

**Done when:** paste mode + camera mode both recover a known TRVL stream on Chromium *and* a non-BarcodeDetector browser.

---

### P2-2 — Robust Soliton as default encoder path
**Why:** Phase 1 LT uses a simplified degree heuristic; `robust-soliton.ts` exists but is not the default everywhere.

| Task | Detail |
|------|--------|
| TS | `lt-core.ts` / browser sender: sample degree from Robust Soliton CDF (`c`, `delta` documented) |
| Rust | Port CDF sampler into `fountain/lt.rs` |
| Interop | Same `c`/`delta` defaults in TS and Rust so mixed senders/receivers match |
| Tests | Peel success rate vs symbol overhead curves for K ∈ {8,16,32,64} |

**Defaults (starting point):** `c = 0.1`, `delta = 0.05` (tune with measured optical loss).

**Done when:** default encode path uses Soliton; tests document average symbols needed ≈ `K * (1.05–1.2)` under zero loss.

---

### P2-3 — Cargo vendor / offline Rust build
**Why:** First `cargo build` needs crates.io; air-gapped Acer should not.

| Task | Detail |
|------|--------|
| `cargo vendor` | Commit or release-attach `optical-airgap/rust/vendor/` (or documented tarball) |
| `.cargo/config.toml` | `source.crates-io.replace-with = "vendored-sources"` |
| CI note | Optional check that build works with `--offline` |
| Docs | INSTALL.md section “Rust offline” |

**Done when:** `cargo build --offline` succeeds after one networked vendor step on a clean machine.

---

### P2-4 — Optical reliability pack
**Why:** Handheld capture is noisy; Phase 1 gate is a simple luminance/variance check.

| Task | Detail |
|------|--------|
| Gate v2 | Adaptive thresholds; optional Laplacian blur score |
| Frame dedup | Already partial via last-codes set; persist seed-level dedup across sessions optional |
| QR capacity | Extend `qrcode-lite` beyond v10 or swap to audited pure-Rust/JS lib for v12–20 |
| Byte-mode QR | Prefer raw TRVL bytes over base64url when encoder supports it (≈25% denser) |
| Sender pacing | Adaptive FPS from receiver loop events (if back-channel exists) or fixed profiles: slow/safe/fast |

**Done when:** documented success rate for a 200-byte age ciphertext on Acer→Pixel under indoor lighting.

---

### P2-5 — Acoustic secondary channel (optional)
**Why:** Optical fails in bright IR / no line-of-sight; sound is another air-gap medium.

| Task | Detail |
|------|--------|
| Codec | Prefer open (e.g. ggwave-class or custom FSK) — audit license |
| Payload | **Same** age ciphertext / TRVL semantics; do not invent a second crypto path |
| UX | Explicit user gesture; never always-on mic |
| GrapheneOS | Mic permission hardened; document |

**Done when:** demo transfers a short age blob speaker→mic without network; optical remains primary.

---

### P2-6 — Higher-capacity RDH (only if needed)
**Why:** Histogram shifting is capacity-limited by peak height.

| Task | Detail |
|------|--------|
| Measure | Log capacity failures in pipeline |
| Candidates | Prediction-error expansion, PVO — still reversible, still encrypt-first |
| Guard | Do not replace HS until metrics say short age blobs fail real covers |

**Done when:** either metrics say HS is enough, or alternate RDH is behind a flag with tests.

---

### P2-7 — Recursive IA-of-IA wiring
**Why:** `loop/hooks.ts` emits events; experts are stubs.

| Task | Detail |
|------|--------|
| Wire | Receiver/sender call `emitOpticalEvent` with live metrics |
| Policy | On-device rules: FPS, gate strictness, “stop and Destroy buffers” |
| Storage | Policy state in Vault only; wiped on Destroy = Restart |
| No cloud | Experts never exfiltrate metrics |

**Done when:** at least one adaptive behavior (e.g. auto-slow sender FPS after high CRC) works offline.

---

### P2-8 — CLI / UX polish
| Task | Detail |
|------|--------|
| `trv-optical decrypt` | Done in Phase 1; add `encrypt-file` / `frame-stream` subcommands |
| Identity files | `age-keygen -o` compatible paths documented |
| Windows | Note WSL2 as preferred; native if `age` + Rust toolchains exist |
| Obtainium / release | Optional signed release zip of `optical/` static pages for non-git users |

---

## Priority order (suggested)

1. **P2-1** jsQR fallback — maximizes device coverage  
2. **P2-2** Soliton default — correctness under loss  
3. **P2-4** Optical reliability — real-world peel rates  
4. **P2-3** Cargo vendor — air-gap builds  
5. **P2-7** Loop wiring — adaptive behavior  
6. **P2-8** CLI polish  
7. **P2-6** RDH upgrade — only if needed  
8. **P2-5** Acoustic — optional secondary  

---

## Non-goals (still)

- Pixel WiFi CSI / through-wall sensing  
- Public DNS for `sentinel.viewer`  
- Google/Meta/Microsoft SDKs in core  
- Cloud Vault or hosted key custody  
- Claiming HIPAA certification from code alone  

---

## Tracking

Open focused issues per item (e.g. `optical-airgap P2-1 jsQR`) rather than overloading #38.  
Phase 1 issue: [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38) (complete).
