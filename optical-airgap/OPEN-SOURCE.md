# Open Source Inventory — Optical Air-Gap (Sentinel Standard)

**Rule:** Core path has **zero Meta / Facebook / Google / Microsoft** runtime dependencies.
All required cryptography and transport code is open source with OSI-compatible licenses.

---

## 1. First-party (this repo) — MIT

| Module | Path | Role |
|--------|------|------|
| age interface (TS) | `crypto/age-interface.ts` | Encrypt/decrypt API over age-encryption |
| RDH histogram shifting | `rdh/histogram-shifting.ts` | Reversible data hiding |
| LT core + Soliton | `fountain/lt-core.ts`, `robust-soliton.ts` | Fountain encode/decode |
| TRVL framing | `fountain/lt-frame.ts` | Binary + base64url frames |
| Symbol stream | `fountain/stream-symbols.ts` | Infinite LT iterator |
| Full pipeline | `pipeline/full-path.ts`, `peel-path.ts` | Wired end-to-end |
| Encrypt-then-RDH | `pipeline/encrypt-then-rdh.ts` | age → stego |
| Identity | `identity/local-address.ts` | `@sentinel.viewer` local claim |
| Loop hooks | `loop/hooks.ts` | IA-of-IA policy stubs |
| QR encoder (lite) | `optical/qrcode-lite.js` | Offline QR draw, no CDN |
| QR sender/receiver | `optical/qr-*.html` | Browser optical path |
| Rust crate | `rust/` | age + RDH + LT + CLI |

License file: [LICENSE](./LICENSE) (MIT).

---

## 2. Required third-party — TypeScript / Node

| Package | License | Source | Why required |
|---------|---------|--------|--------------|
| **age-encryption** (`@age/age-encryption` / FiloSottile typage) | BSD-3-Clause | [github.com/FiloSottile/typage](https://github.com/FiloSottile/typage) | Official age in pure JS/TS |
| **@noble/ciphers**, **@noble/curves**, **@noble/hashes** (transitive) | MIT | Paul Miller / noble | Crypto primitives used by age-encryption |

Install (networked host once):

```bash
cd optical-airgap && npm install
```

Declared in root [package.json](./package.json).

**Not required for pure LT frame tests** (fountain modules are zero-dep). age is required only when encrypting/decrypting.

---

## 3. Required third-party — Rust

| Crate | License | Why |
|-------|---------|-----|
| **age** 0.11+ | MIT OR Apache-2.0 | age encrypt/decrypt |
| **zeroize** | Apache-2.0 OR MIT | Best-effort key wipe |
| **sha2** | MIT OR Apache-2.0 | RDH header integrity |
| **thiserror** | MIT OR Apache-2.0 | Error types |

See `rust/Cargo.toml`. Offline: `rust/OFFLINE.md` (`cargo vendor`).

---

## 4. Optional third-party (not in core path until dropped)

| Component | License | Use |
|-----------|---------|-----|
| **paulmillr/qr** | MIT OR Apache-2.0 | Preferred camera QR decode when BarcodeDetector missing |
| jsQR (cozmo) | Apache-2.0 | Legacy / unmaintained — not preferred |

Drop under `optical/vendor/` per [optical/vendor/NOTICE](./optical/vendor/NOTICE). **Never** load from CDN at scan time.

---

## 5. Platform / OS (not npm crates)

| Component | License / source | Role |
|-----------|------------------|------|
| **GrapheneOS** | Open source (see grapheneos.org) | Preferred hardened Android\* |
| **Termux** (F-Droid) | GPLv3-ish app; packages vary | Mobile Node/git shell |
| **Node.js** | MIT | Host for TS path |
| **Rust toolchain** | MIT/Apache | Host for Rust path |

GrapheneOS: **https://grapheneos.org/** only (Android\* footnote).

---

## 6. Explicitly excluded from core

- Google Play Services / GMS as a requirement  
- Firebase, Crashlytics, Ads SDKs  
- Meta / Facebook SDKs  
- Microsoft Graph / MSA-bound key custody  
- Closed QR SDKs or proprietary stego libraries  
- RaptorQ as default fountain (see SENTINEL-STANDARD.md)  

---

## 7. Wire diagram (what “all required” means)

```
[plaintext]
    │
    ▼  age-encryption (TS)  OR  age crate (Rust)     ← required OSS crypto
[ciphertext]
    │
    ├─ optional ► RDH histogram (first-party MIT)
    │
    ▼  LT + Robust Soliton (first-party MIT)
[TRVL frames]
    │
    ▼  qrcode-lite.js (first-party) + browser/camera
[optical / paste / file]
    │
    ▼  peel (first-party) → age decrypt
[plaintext]
```

Everything above is open source. Optional paulmillr/qr is the only extra binary drop for some browsers.

---

## 8. Verification checklist

- [ ] `npm install` in `optical-airgap/` succeeds without Google/Meta packages  
- [ ] `cargo tree` under `rust/` shows only age/zeroize/sha2/thiserror (+ their OSS deps)  
- [ ] No `node_modules` entry from `@google/*`, `firebase`, `react-native-fb*`, `@azure/*` in core  
- [ ] Optical HTML has no `<script src="https://...">` CDN tags  
- [ ] `SENTINEL-STANDARD.md` still names Soliton LT as default  
