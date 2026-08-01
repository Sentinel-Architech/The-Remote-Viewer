# Optical Air-Gap — Install (Sentinel Standard)

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Overview |
| [OPEN-SOURCE.md](./OPEN-SOURCE.md) | Required OSS inventory |
| [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md) | Normative policy |
| [TECHNICAL.md](./TECHNICAL.md) | Architecture |
| **INSTALL.md** | This file |

**Repo:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer · **Branch:** `TheRemoteViewer` · **License:** MIT

---

## Prerequisites

### Desktop / Acer (recommended)
- Git, **Node.js 20+**, optional **Rust 1.74+**

```bash
git --version && node -v && npm -v
# optional:
rustc --version && cargo --version
```

### Termux on GrapheneOS (Android\*)
- Termux from **F-Droid** (not Play)
- GrapheneOS only from **https://grapheneos.org/**

```bash
pkg update && pkg install git nodejs
# optional: pkg install age rust
```

### Explicitly not required
Play Services · Meta/Microsoft SDKs · CDN scripts · public DNS for `@sentinel.viewer`

---

## 1. Clone + branch

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
git checkout TheRemoteViewer
ls optical-airgap
```

---

## 2. TypeScript OSS dependency (age only)

```bash
cd optical-airgap
npm install
npm run test:golden
```

Installs **`age-encryption`** (FiloSottile). Fountain/RDH/QR need no extra packages.

Legacy path still works: `cd crypto && npm install` (same dep).

---

## 3. Rust path (optional but recommended)

```bash
cd optical-airgap/rust
cargo test
cargo build --release
```

Offline later: see [rust/OFFLINE.md](./rust/OFFLINE.md) (`cargo vendor`).

---

## 4. Security rules (do not skip)

1. **Encrypt first** — never feed plaintext into RDH or LT as “secret.”
2. **Identity in Vault only** — never commit `AGE-SECRET-KEY-...`.
3. **Destroy = Restart** — wipe test keys after experiments.
4. RDH `checksumOk === false` → **do not decrypt**.

Read: `rdh/SECURITY.md`, `crypto/age-notes.md`, `SENTINEL-STANDARD.md`.

---

## 5. First smoke tests

### Golden Soliton degrees

```bash
cd optical-airgap && npm run test:golden
# → OK golden degrees k=8
```

### Rust LT stream ↔ peel (no age)

```bash
cd optical-airgap/rust
echo 'hello-sentinel' | cargo run --quiet --bin trv-optical -- frame-stream 16 40 \
  | cargo run --quiet --bin trv-optical -- frame-peel
# → hello-sentinel
```

Or: `../scripts/e2e-lt-demo.sh`

### age keygen + encrypt (Rust)

```bash
cargo run --quiet --bin trv-optical -- keygen
# recipient on stdout; identity on stderr — save identity to Vault only
```

### Browser optical (offline QR — no CDN)

Open from disk:

- `optical/qr-sender.html` — Soliton LT → QR stream  
- `optical/qr-receiver.html` — camera / paste / file → peel  

Optional: drop Apache-2.0 **jsQR** into `optical/vendor/jsQR.js` (see `optical/vendor/README.md`).

---

## 6. Full path modules (TS)

| Module | Role |
|--------|------|
| `pipeline/full-path.ts` | age → optional RDH → Soliton → `TRVL1.` lines |
| `pipeline/peel-path.ts` | lines → peel → optional RDH → age decrypt |
| `pipeline/encrypt-then-rdh.ts` | age → RDH only |

Compose with `npx tsx` after `npm install` when integrating into your host app.

---

## 7. Stay current

```bash
git checkout TheRemoteViewer && git pull origin TheRemoteViewer
cd optical-airgap && npm install
cd rust && cargo test
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `age-encryption package not found` | `cd optical-airgap && npm install` (Node 20+) |
| Golden test FAIL | Do not change Soliton math without updating Standard + both languages |
| QR blank | Open HTML from folder path; no CDN — check `qrcode-lite.js` same directory |
| Camera no decode | Use paste/file; or vendor jsQR |
| RDH capacity error | Larger cover / `fill(128)` synthetic buffer |
| `cargo` offline fail | Run `cargo vendor` once online — OFFLINE.md |

---

## After successful install

- [x] Branch `TheRemoteViewer`  
- [x] `age-encryption` installed  
- [x] Golden Soliton locked  
- [x] `frame-stream` / `frame-peel` roundtrip  
- [x] Offline QR sender/receiver  
- [x] OPEN-SOURCE inventory  

**Share:** INSTALL + OPEN-SOURCE + SENTINEL-STANDARD.  
**Never share:** age identities, Vault material, real payloads.
