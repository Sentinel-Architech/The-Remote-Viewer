# TRV Optical Air-Gap — Technical Deep Dive

**For implementers, auditors, and anyone who wants the real machinery.**  
Public. Forkable. No NDAs. No proprietary SDKs in the core path.

| | |
|--|--|
| **Repo** | [Sentinel-Archetecht/The-Remote-Viewer](https://github.com/Sentinel-Archetecht/The-Remote-Viewer) |
| **Branch** | `TheRemoteViewer` |
| **Module** | `optical-airgap/` |
| **License** | MIT (`optical-airgap/LICENSE`) |
| **Issue** | [#38](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/issues/38) |
| **High-level README** | [README.md](./README.md) |

This document is the secondary readme: full public design so others can follow, run, extend, and share.

---

## 1. Why this exists

Most “secure messaging” still assumes a network. Networks leak metadata, invite middleboxes, and drag in corporate stacks. TRV’s optical path does the opposite:

1. **Encrypt on-device** with modern, auditable crypto (`age`).
2. **Embed ciphertext** into a cover with *reversible* data hiding (not lossy stego).
3. **Fountain-encode** for a one-way erasure channel (screen → camera).
4. **Display as QR frames**; the other device only needs a camera.
5. **Never give an outside mail server or cloud API access to plaintext.**

Constraints that shaped every choice:

- Zero Meta / Google / Microsoft code in the core path
- Zero extra hardware budget (Pixel 7 + GrapheneOS, obsolete Acer, tablet)
- Fully open source
- **Destroy = Restart**: identities, keys, and policy die together
- Encrypt-first always (RDH is a carrier, not a confidentiality control)

---

## 2. End-to-end data path

```
┌─────────────┐   age    ┌──────────────┐   HS-RDH   ┌─────────────┐
│  Plaintext  │ ───────► │  Ciphertext  │ ─────────► │ Stego cover │
└─────────────┘          └──────────────┘            └──────┬──────┘
                                                            │
                                                     LT fountain
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │  QR frames    │
                                                    │  (screen)     │
                                                    └───────┬───────┘
                                                            │ optical
                                                            ▼
                                                    ┌───────────────┐
                                                    │  Camera       │
                                                    │  + peel LT    │
                                                    └───────┬───────┘
                                                            │
                         age decrypt ◄── RDH extract ◄──────┘
```

**Shipped today (code in-tree):** age interface, histogram-shifting RDH with capacity check + authenticated header, encrypt→RDH pipeline, LT encoder/decoder skeleton, local `@sentinel.viewer` identity, QR sender scaffold.

**Not shipped yet:** vendored offline QR, LT binary framing into QR, camera peel UI, quality gate, recursive expert hooks in code. See README roadmap + issue #38.

---

## 3. Cryptography — `age`

### Choice
[**age**](https://age-encryption.org) (FiloSottile et al.): small keys, no config theater, modern defaults, open format (`age-encryption.org/v1`).

### TypeScript path (preferred for this module)
Official TS implementation: **`age-encryption`** (typage).

- npm: `age-encryption`
- Depends on **noble** crypto + Web Crypto API
- Runs in modern browsers, Node 20+, Deno, Bun
- No Google/Meta/Microsoft crypto stacks

Entry point: `crypto/age-interface.ts`

```ts
import {
  generateAgeKeyPair,
  encryptForRecipient,
  decryptBlob,
  secureZero,
} from "./crypto/age-interface.js";

const { identity, recipient } = await generateAgeKeyPair();
// identity stays in the Vault only — never export

const plaintext = new TextEncoder().encode("payload");
const blob = await encryptForRecipient(plaintext, recipient);
secureZero(plaintext);

// blob.ciphertext → RDH → LT → QR
const recovered = await decryptBlob(blob, identity);
```

### Native CLI fallback (Acer / Termux)
```bash
pkg install age   # or distro package
age-keygen -o identity.txt
echo "payload" | age -r age1... > payload.age
age -d -i identity.txt payload.age
```
Same wire format as the TS path. Details: `crypto/age-notes.md`.

### Rules
- Encrypt **before** any stego or fountain step.
- Private identity never leaves the Vault.
- Destroy = Restart wipes identity material and buffers (`secureZero` is best-effort in JS; native paths should overwrite).

---

## 4. Reversible data hiding — histogram shifting

### Why RDH (not classic LSB stego)
We need **perfect recovery of the cover** and of the secret. Classic LSB is often irreversible or fragile. Histogram shifting (Ni et al. lineage) is pure integer arithmetic, easy to audit, and restores the cover bit-for-bit.

### Algorithm (embed)
1. Build 8-bit histogram of the cover.
2. Find peak bin `P` and a zero/near-zero bin `Z`.
3. Shift bins between `P` and `Z` by ±1 to free the adjacent bin.
4. At every pixel equal to `P`, embed one bit: leave `P` for `0`, move to freed bin for `1`.
5. Capacity ≈ count of pixels at `P`.

### Hardening in this repo (`rdh/histogram-shifting.ts`)
- **Capacity pre-check** — fails closed if cover cannot hold header + secret.
- **Authenticated header** (112 bits), embedded first:
  - `peak` (8), `zero` (8)
  - `secretLength` (32, uint32 BE)
  - first 8 bytes of **SHA-256** of the ciphertext (64)
- Extract restores cover, returns `checksumOk`. If false → treat as corrupt/tampered; **do not decrypt**.

### Security model for RDH
RDH is **not** encryption. Plaintext must never reach `embedHistogramShifting`. See `rdh/SECURITY.md`.

Encrypt-first + checksum supports a HIPAA-*aligned architecture*; organizational compliance is still a process problem, not a one-file claim.

---

## 5. LT fountain codes

### Why LT on an optical channel
Screen → camera is a **one-way erasure channel**: frames drop, blur, arrive out of order. TCP-style ARQ is impossible without a back-channel. **Luby Transform (LT)** codes are rateless: generate as many symbols as needed; the receiver needs roughly `K × (1.05–1.20)` distinct symbols in any order.

### What’s in `fountain/lt-core.ts`
- Split payload into `K` fixed-size source blocks
- Degree sampling (simplified Robust Soliton–style placeholder)
- XOR-based symbol generation from a seed
- `LTEncoder.next()` stream
- `LTDecoder` with basic peeling cascade

Production hardening still needed (full Robust Soliton parameters, efficient degree-1 queues, integrity per symbol). Structure is intentional so others can replace the sampler without rewriting the pipeline.

### Framing (roadmap)
Each QR should carry: version, seed/indices, symbol payload, short MAC or length. Text demo framing in `qr-sender.html` is **not** the production binary layout.

---

## 6. Local identity — `@sentinel.viewer`

```
anything@sentinel.viewer
```

- **Not** a public DNS domain.
- Local claim bound to Vault / DID material.
- Generated in `identity/local-address.ts` and wired into `apps/shared/src/identity.ts`.
- Outside email may only ever transport **already age-encrypted** blobs; the local address is for Viewer-side routing and UX, not MX records.

Destroy = Restart deletes addresses with the keys that bound them.

---

## 7. Pipeline helper

`pipeline/encrypt-then-rdh.ts`:

```
plaintext → age encrypt → capacity check → HS embed → { encrypted, rdh, capacityBits }
```

Phone-optional. Runs on Node / Termux / Acer once `age-encryption` is installed under `crypto/`.

```ts
import { encryptTextThenRdh, extractRdh } from "./pipeline/encrypt-then-rdh.js";

const result = await encryptTextThenRdh(text, recipient, coverBytes);
// result.rdh.stego → next: LT + QR

const extracted = await extractRdh(result.rdh.stego);
if (!extracted.checksumOk) throw new Error("tamper or corruption");
```

---

## 8. Optical layer

### Sender (`optical/qr-sender.html`)
Self-contained demo page: cycles framed text as QR for camera testing. **Temporary CDN QR lib** — must be vendored for true offline/air-gap purity (roadmap item 1).

### Capture (roadmap)
Fixed/manual exposure where the platform allows, blur/contrast gate, multi-frame tolerance via LT. GrapheneOS/Pixel camera APIs are constrained; Acer webcam path may differ. Design for the worst sensor, not a lab webcam.

### Out of scope
WiFi CSI / “see through walls” on Pixel 7 + GrapheneOS: chipset + OS isolation do not expose usable open CSI. Do not fight the security model for a weak signal.

---

## 9. Threat model (short)

| Threat | Mitigation |
|--------|------------|
| Network eavesdropper | No network required on primary path |
| Malicious mail provider | Only ciphertext (+ optional stego) ever leaves; no keys |
| Stolen device, unlocked | Destroy = Restart; minimize residual plaintext |
| Stolen device, locked | GrapheneOS / disk encryption (platform); Vault sealed |
| Optical observer filming the screen | Sees QR of ciphertext/stego, not plaintext; still a metadata/existence leak if abused |
| Corrupted / partial capture | LT + RDH checksum; fail closed on `checksumOk === false` |
| Supply-chain in core crypto | age + noble; pin and audit; prefer vendored offline assets |

Stego does **not** hide the fact that *something* unusual may be on screen from a dedicated analyst. Confidentiality is age. Camouflage is secondary.

---

## 10. How to start (public path)

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
git checkout TheRemoteViewer

cd optical-airgap/crypto
npm install    # age-encryption
```

Then:

1. Read `crypto/age-notes.md` and `rdh/SECURITY.md`.
2. Drive `age-interface.ts` + `histogram-shifting.ts` or `pipeline/encrypt-then-rdh.ts` from a small TS runner.
3. Open `optical/qr-sender.html` in a browser for a visual smoke test (network used only for temporary QR CDN until vendored).
4. Track gaps in issue #38; send PRs against `TheRemoteViewer`.

No account required to read or fork. Sharing this module means sharing the folder + this doc + MIT license.

---

## 11. Directory map

```
optical-airgap/
├── README.md              High-level + roadmap
├── TECHNICAL.md           This file
├── STATUS.md              Shipped checklist
├── LICENSE                MIT
├── crypto/
│   ├── age-interface.ts   age encrypt/decrypt API
│   ├── age-notes.md
│   └── package.json
├── rdh/
│   ├── histogram-shifting.ts
│   ├── histogram-shifting.md
│   └── SECURITY.md
├── fountain/
│   ├── lt-core.ts
│   └── lt-notes.md
├── pipeline/
│   ├── encrypt-then-rdh.ts
│   └── README.md
├── identity/
│   └── local-address.ts
├── optical/
│   ├── qr-sender.html
│   └── capture-notes.md
└── loop/
    └── recursive-hooks.md
```

---

## 12. What good contributions look like

- Vendored, offline QR generator (no CDN)
- Binary LT symbol framing + interoperable encode/decode tests
- Pure-TS or WASM peel path that runs in a locked-down browser
- Property tests: embed → extract restores cover; checksum fails on bit flips
- Robust Soliton degree distribution with documented parameters
- Zero new proprietary dependencies; document any exception loudly

Keep PRs focused. Match the existing “scaffold vs real crypto” honesty: do not claim production security for incomplete peel/QR paths.

---

## 13. One-liner for sharing

> TRV optical-airgap: encrypt with age, embed with reversible histogram shifting, ship over screen→camera with LT fountain codes. MIT, no Big Tech crypto in the core path, designed for GrapheneOS + cheap hardware. Start at `optical-airgap/TECHNICAL.md`.

Fork it. Break it. Harden it. Share the link, not the keys.
