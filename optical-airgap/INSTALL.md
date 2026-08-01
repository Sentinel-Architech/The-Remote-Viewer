# Optical Air-Gap — Install (Sentinel Standard)

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Overview |
| [OPEN-SOURCE.md](./OPEN-SOURCE.md) | Required OSS inventory |
| [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md) | Normative policy |
| [TECHNICAL.md](./TECHNICAL.md) | Architecture |
| **INSTALL.md** | This file |
| [STATUS.md](./STATUS.md) | Verification + checklist |

**Repo:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer · **Branch:** `TheRemoteViewer` · **License:** MIT

---

## Prerequisites

### Desktop / Acer
- Git, **Node.js 20+**, optional **Rust 1.74+**

### Termux on GrapheneOS (Android\*) — verified 2026-07-31
- Termux from **F-Droid**
- GrapheneOS only from **https://grapheneos.org/**
- `pkg install git nodejs` · optional `pkg install rust`
- **Use `$HOME/...` for files** — `/tmp` is often not writable on Termux

### Not required
Play Services · Meta/Microsoft SDKs · CDN scripts · public DNS for `@sentinel.viewer`

---

## 1. Clone + branch

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
git checkout TheRemoteViewer
```

Root `Cargo.toml` workspace includes `optical-airgap/rust` (required for `cargo run` from that crate).

---

## 2. TypeScript (age-encryption only)

```bash
cd optical-airgap
npm install
npm run test:golden
```

---

## 3. Rust CLI

```bash
cd optical-airgap/rust
cargo test
cargo build --release   # optional
```

Offline later: [rust/OFFLINE.md](./rust/OFFLINE.md).

---

## 4. Security rules

1. **Encrypt first** — never put plaintext in RDH/LT as the secret.  
2. **Identity in Vault only** — never commit `AGE-SECRET-KEY-...`.  
3. **Destroy = Restart** — wipe test keys and blobs after experiments.  
4. RDH `checksumOk === false` → do not decrypt.  

Burn any identity that appeared in screenshots or chat scrollback.

---

## 5. Smoke tests

### Golden Soliton

```bash
cd optical-airgap && npm run test:golden
```

### LT only (Termux-friendly)

```bash
cd optical-airgap/rust
echo hello-sentinel > $HOME/msg.txt
cargo run --quiet --bin trv-optical -- frame-stream 16 40 < $HOME/msg.txt > $HOME/trvl.txt
cargo run --quiet --bin trv-optical -- frame-peel < $HOME/trvl.txt
# → hello-sentinel
```

### Full chain: age → LT → peel → age (verified on device)

```bash
cd optical-airgap/rust

# Fresh Vault identity (do not reuse keys from chat/screenshots)
cargo run --quiet --bin trv-optical -- keygen 2> $HOME/vault-identity.txt | tee $HOME/vault-recipient.txt
chmod 600 $HOME/vault-identity.txt

RECIP=$(cat $HOME/vault-recipient.txt)
echo "secret viewer message" | cargo run --quiet --bin trv-optical -- encrypt "$RECIP" > $HOME/ct.bin
cargo run --quiet --bin trv-optical -- frame-stream 32 0 < $HOME/ct.bin > $HOME/trvl.txt
cargo run --quiet --bin trv-optical -- frame-peel < $HOME/trvl.txt > $HOME/ct2.bin
cargo run --quiet --bin trv-optical -- decrypt $HOME/vault-identity.txt < $HOME/ct2.bin
# → secret viewer message

rm -f $HOME/ct.bin $HOME/ct2.bin $HOME/trvl.txt $HOME/msg.txt
```

### Browser optical (offline)

- `optical/qr-sender.html` · `optical/qr-receiver.html`  
- Optional: vendor `jsQR` under `optical/vendor/`  

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| workspace / not a member | `git pull` — root Cargo.toml must list `optical-airgap/rust` |
| `Identity` Display / Decryptor::Recipients | age 0.11 fixes — pull latest branch |
| `/tmp` permission denied | use `$HOME/...` |
| `\~` path errors | do not escape tilde; use `$HOME` |
| cargo treats `--frame-peel` as its flag | space after `--`: `-- frame-peel` |
| Missing `test:golden` | `cd optical-airgap` (not repo root only) |

---

## After successful install

- [x] Branch `TheRemoteViewer`  
- [x] age-encryption / Rust age  
- [x] Golden Soliton  
- [x] frame-stream / frame-peel  
- [x] **Full age+LT chain on Termux (2026-07-31)**  
- [x] Offline QR pages  

**Share:** INSTALL + OPEN-SOURCE + SENTINEL-STANDARD.  
**Never share:** age identities, Vault material, real payloads.
