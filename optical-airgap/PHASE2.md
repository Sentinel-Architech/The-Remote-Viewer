# Optical Air-Gap — Phase 2

**Phase 1:** complete ([STATUS.md](./STATUS.md), issue #38).  
**This file:** goals, acceptance criteria, and **full task checklist**.

**Locks:** open source · no Meta/Google/Microsoft in core · encrypt-first · Destroy = Restart · `@sentinel.viewer` local-only · no new paid hardware required.

---

## Priority order

1. P2-1 jsQR fallback  
2. P2-2 Robust Soliton default  
3. P2-4 Optical reliability  
4. P2-3 Cargo vendor  
5. P2-7 Loop / IA-of-IA wiring  
6. P2-8 CLI / release polish  
7. P2-6 Higher-capacity RDH (if needed)  
8. P2-5 Acoustic secondary  

---

## Full task list

### P2-1 — jsQR (or pure) fallback receiver

- [ ] Choose MIT/Apache QR **decoder** (jsQR or equivalent); record license in `optical/vendor/NOTICE`
- [ ] Vendor single file under `optical/vendor/` (no CDN)
- [ ] Feature-detect `BarcodeDetector`; branch to vendor decoder on canvas frames
- [ ] Reuse existing quality gate before decode attempts
- [ ] Dedup decoded strings (seed/raw) to avoid double-ingest
- [ ] Status UI: show which decoder path is active
- [ ] Test: Chromium + BarcodeDetector path still works
- [ ] Test: browser/WebView **without** BarcodeDetector recovers TRVL stream via fallback
- [ ] Test: GrapheneOS browser path documented (what works / paste fallback)
- [ ] Update INSTALL.md + STATUS.md when green

**Done when:** camera or paste recovers known payload on at least one non-BarcodeDetector environment.

---

### P2-2 — Robust Soliton as default encoder path

- [ ] Document parameters `c`, `delta`, `K` in `fountain/lt-notes.md`
- [ ] Precompute μ and CDF from `robust-soliton.ts` for given K
- [ ] Replace simplified `sampleDegree` in `lt-core.ts` with CDF sample (keep seed determinism)
- [ ] Use same distribution in `qr-sender.html` inlined encoder **or** share one bundled module
- [ ] Port CDF sampler to Rust `fountain/lt.rs`
- [ ] Align TS/Rust defaults: `c = 0.1`, `delta = 0.05` (or one agreed pair)
- [ ] Unit tests: degree histogram roughly matches μ for large seed range
- [ ] Integration tests: zero-loss peel overhead for K ∈ {8, 16, 32, 64}
- [ ] Optional: export `symbols_needed` estimate helper
- [ ] Update TECHNICAL.md LT section

**Done when:** default encode path is Soliton in TS + Rust; tests record overhead band ≈ `K × (1.05–1.2)` under zero loss.

---

### P2-3 — Cargo vendor / offline Rust build

- [ ] Run `cargo vendor` into `optical-airgap/rust/vendor/` **or** release a vendor tarball
- [ ] Add `.cargo/config.toml` with `replace-with = "vendored-sources"`
- [ ] Document first-time networked vendor vs offline build in INSTALL.md
- [ ] Verify `cargo build --offline` and `cargo test --offline`
- [ ] Verify `cargo run --bin trv-optical --offline -- keygen`
- [ ] Note disk size of vendor tree in PHASE2/STATUS
- [ ] Optional: CI job with `--offline` after cache seed
- [ ] Do **not** require crates.io on air-gapped Acer after vendor step

**Done when:** clean machine with only vendored sources builds and tests offline.

---

### P2-4 — Optical reliability pack

#### Gate v2
- [ ] Keep mean luminance bounds; make thresholds configurable
- [ ] Add blur proxy (e.g. Laplacian variance) reject
- [ ] Count `gateRejections` for loop metrics
- [ ] UI: show last gate pass/fail reason

#### Framing / QR capacity
- [ ] Evaluate byte-mode QR carrying raw TRVL bytes vs base64url
- [ ] If byte-mode: define QR content convention (e.g. binary vs `TRVL1.` text)
- [ ] Extend `qrcode-lite` versions **or** vendor audited encoder supporting v12–20
- [ ] Benchmark max payload per frame at ECC L/M
- [ ] Document recommended `blockSize` vs QR version table

#### Stream behavior
- [ ] Sender profiles: `safe` (1 fps) / `normal` (2) / `fast` (4)
- [ ] Stronger seed-level dedup on receiver
- [ ] Optional: sequence stats (unique seeds / window)
- [ ] Indoor Acer→Pixel test log template (payload size, time, symbols, failures)

**Done when:** written result for ~200-byte age ciphertext optical transfer under indoor light (success or measured blockers).

---

### P2-5 — Acoustic secondary channel (optional)

- [ ] Select open codec (ggwave-class or minimal FSK); license audit
- [ ] Encode **only** age ciphertext or TRVL-equivalent opaque bytes
- [ ] Explicit user gesture to start mic/speaker (no always-on)
- [ ] GrapheneOS mic permission notes in COMPATIBILITY.md
- [ ] Demo path: short blob speaker→mic, no network
- [ ] Document: optical remains primary; acoustic is fallback
- [ ] Threat note: ambient eavesdropping vs optical shoulder-surf tradeoffs

**Done when:** one documented offline acoustic round-trip of a short age blob.

---

### P2-6 — Higher-capacity RDH (conditional)

- [ ] Instrument pipeline: log capacity failures (need vs peak)
- [ ] Collect sample covers (flat vs natural image) capacity stats
- [ ] **If** short age blobs fail real covers: prototype prediction-error expansion or PVO
- [ ] Keep encrypt-first; never embed plaintext
- [ ] Feature flag: `rdh_backend = histogram | pee`
- [ ] Round-trip + checksum tests for any new backend
- [ ] **If** HS sufficient: close item with metrics note, no code churn

**Done when:** either metrics close the item, or alternate RDH is flagged and tested.

---

### P2-7 — Recursive IA-of-IA / loop wiring

- [ ] `qr-receiver.html`: call `emitOpticalEvent` (or inline equivalent) on ingest/complete/fail
- [ ] `qr-sender.html`: optional metrics emit if shared context exists
- [ ] Map metrics → `defaultCoordinatorNote` policy strings
- [ ] Implement one adaptive behavior (example: recommend lower FPS after CRC spike)
- [ ] Vault-local policy blob schema (versioned JSON)
- [ ] Wipe policy on Destroy = Restart (document + helper)
- [ ] No network exfiltration of metrics
- [ ] Unit-test pure policy functions in `loop/hooks.ts`

**Done when:** one offline adaptive behavior is observable in the receiver/sender UX or logs.

---

### P2-8 — CLI / UX / release polish

- [ ] `trv-optical frame-stream`: stdin → N TRVL frames to stdout/files
- [ ] `trv-optical encrypt-file` / `decrypt-file` path args
- [ ] Identity file format examples matching `age-keygen -o`
- [ ] Windows: WSL2 primary path documented; native optional note
- [ ] Optional: static zip of `optical/*.html` + `qrcode-lite.js` + vendor for non-git users
- [ ] Optional: checksums for release artifacts
- [ ] README quickstart link check (all Phase 1 + Phase 2 docs)
- [ ] COMPATIBILITY.md: BarcodeDetector vs jsQR matrix row

**Done when:** CLI covers frame-stream + file encrypt/decrypt; docs match reality.

---

## Cross-cutting tasks

- [ ] Keep TS and Rust **TRVL** layout byte-identical (regression test vectors)
- [ ] Keep age ciphertext interoperable (Go age / rage / typage / Rust age)
- [ ] No new dependency without license + “no Big Tech core” check
- [ ] Prefer in-tree or vendored code over CDN forever
- [ ] Update STATUS.md checkboxes as each P2-x completes
- [ ] Open one GitHub issue per P2-x (avoid reusing #38 for all work)

---

## Non-goals (do not schedule)

- [ ] ~~Pixel WiFi CSI / through-wall~~
- [ ] ~~Public DNS for sentinel.viewer~~
- [ ] ~~Google/Meta/Microsoft SDKs in core~~
- [ ] ~~Cloud Vault / hosted keys~~
- [ ] ~~HIPAA certification-from-repo claims~~

---

## Suggested issue titles

```
optical-airgap P2-1: jsQR fallback receiver
optical-airgap P2-2: Robust Soliton default TS+Rust
optical-airgap P2-3: cargo vendor offline build
optical-airgap P2-4: optical reliability pack
optical-airgap P2-5: acoustic secondary channel
optical-airgap P2-6: RDH capacity metrics / optional PEE
optical-airgap P2-7: loop hooks adaptive policy
optical-airgap P2-8: CLI frame-stream and release polish
```
