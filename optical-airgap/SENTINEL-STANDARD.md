# The Sentinel Standard — Optical Air-Gap Fountain Path

**Project:** The Remote Viewer / Sentinel Security Protocol (TRV)  
**Branch:** `TheRemoteViewer`  
**Status:** Normative for Phase 1–2 optical transfer  
**License:** MIT (implementation) · this document is project policy

---

## 1. Purpose

Define the **canonical** rateless coding and optical wire behavior for sovereign Viewer-to-Viewer transfer so implementations (TS, Rust, browser, Termux) interoperate and do not drift into incompatible “improvements.”

If a change conflicts with this document, **this document wins** until an explicit versioned revision is merged.

---

## 2. Pipeline (normative)

```
plaintext
  → age (encrypt-first)
  → optional RDH (histogram-shifting, reversible)
  → LT fountain (Robust Soliton degree distribution)
  → TRVL framing (CRC-16)
  → optical QR (or paste/file of TRVL1 lines)
  → receive → peel → age decrypt
```

**Encrypt-first is mandatory.** RDH and optical layers never see plaintext secrets.

---

## 3. Fountain code standard

### 3.1 Chosen code family

| Item | Sentinel Standard |
|------|-------------------|
| Code | **Luby Transform (LT)** |
| Degree distribution | **Robust Soliton** |
| Default parameters | `c = 0.1`, `δ = 0.05` |
| Seed → unit map | `abs(sin(seed * 12.9898) * 43758.5453) % 1` |
| Index PRNG | LCG: `s = (s * 1103515245 + 12345) & 0x7fffffff` |
| Legacy heuristic | Allowed **only** behind explicit `degreeMode = legacy` (tests / R2 hard-cut) |

**Raptor, RaptorQ, and RFC 6330 precodes are non-standard for this path.**  
They may be researched under a future optional backend; they must not replace the default LT+Soliton encode without a new major standard revision.

### 3.2 Why not RaptorQ precode (locked rationale)

- TRV optical payloads are **short** (age ciphertext), so small-\(K\) asymptotics favor simple LT.
- Precode adds GF(256) / inactivation / matrix solve cost on Acer, Termux, GrapheneOS\*.
- Audit surface and license narrative stay minimal with pure LT.
- Rateless streaming already absorbs optical erasures; steep Raptor failure curves are unnecessary for one-shot sovereign transfer.

### 3.3 Interop golden vectors

- `fountain/testdata/golden-degrees-k8.json` is **normative** for `K=8`, seeds `0..31`.
- TS and Rust **must** match that table for Soliton defaults.
- Divergence is a **defect**, not a “tuning choice.”

### 3.4 Decoder

- Peeling decoder; symbols carry **explicit indices** in TRVL (receiver does not re-derive degree distribution).
- Rateless: sender may emit unbounded symbols until receiver completes.

---

## 4. Wire / framing standard

| Field | Rule |
|-------|------|
| Magic | `TRVL` (`0x54 0x52 0x56 0x4c`) |
| Version | `1` |
| QR text form | `TRVL1.` + base64url(frame bytes) |
| Integrity | CRC-16/IBM over frame body |
| Payload inside LT | Opaque bytes (typically age ciphertext or RDH container) |

No CDN. No Meta / Google / Microsoft required runtimes in the core path.

---

## 5. Identity & platform (optical context)

| Item | Sentinel Standard |
|------|-------------------|
| Local address | `*@sentinel.viewer` — **local claim only**, no public DNS |
| Preferred mobile OS | **GrapheneOS\*** from **https://grapheneos.org/** only |
| Destroy = Restart | Wipes keys, addresses, loop policy, residual buffers |
| Outside email | Ciphertext only; zero plaintext access |

\* Android\* hardened path: official GrapheneOS install guide only.

---

## 6. Optical profiles (sender)

| Profile | FPS | Intent |
|---------|-----|--------|
| **safe** | 1 | High loss / poor light |
| **normal** | 2 | Default |
| **fast** | 4 | Good light + stable mount |

Receiver: quality gate before decode; paste and file import always valid.

---

## 7. Non-goals (still)

- RaptorQ as default fountain  
- Public DNS for `sentinel.viewer`  
- Pixel Wi‑Fi CSI / through-wall as a required channel  
- Cloud Vault / hosted age identities  
- Claiming HIPAA certification from this repo alone  

---

## 8. Versioning

| Standard version | Date | Notes |
|------------------|------|-------|
| **Sentinel Optical Fountain 1.0** | 2026-07-31 | Soliton LT defaults; TRVL1; no RaptorQ |

Future changes bump this table and update STATUS.md.

---

## 9. Implementation map

| Concern | Location |
|---------|----------|
| TS Soliton + LT | `fountain/robust-soliton.ts`, `fountain/lt-core.ts` |
| Rust Soliton + LT | `rust/src/fountain/soliton.rs`, `lt.rs` |
| Browser sender/receiver | `optical/qr-sender.html`, `qr-receiver.html` |
| Golden degrees | `fountain/testdata/golden-degrees-k8.json` |
| Phase 2 plan | `PHASE2.md` |
| This policy | `SENTINEL-STANDARD.md` |
