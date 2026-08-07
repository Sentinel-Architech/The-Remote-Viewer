# Optical Air-Gap — Install (Sentinel Standard)

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Overview |
| [OPEN-SOURCE.md](./OPEN-SOURCE.md) | Required OSS inventory |
| [SENTINEL-STANDARD.md](./SENTINEL-STANDARD.md) | Normative policy |
| [TECHNICAL.md](./TECHNICAL.md) | Architecture |
| [VAULT.md](./VAULT.md) | Key hygiene · Destroy = Restart |
| [COMPATIBILITY.md](./COMPATIBILITY.md) | All open-stack devices |
| **INSTALL.md** | This file |
| [STATUS.md](./STATUS.md) | Verification + checklist |

**Repo:** https://github.com/Sentinel-Archetecht/The-Remote-Viewer · **Branch:** `TheRemoteViewer` · **License:** MIT

---

## Prerequisites

### Desktop
- Git, **Node.js 20+**, optional **Rust 1.74+**

### Mobile / Termux
- Termux (F-Droid on Android)  
- Any open-stack host works; **GrapheneOS** from **https://grapheneos.org/** is the hardened reference, not a gate  
- `pkg install git nodejs` · optional `pkg install rust`  
- **Use `$HOME/...` for files** — `/tmp` often fails on Termux  

### Not required
Play Services · Meta/Microsoft SDKs · CDN scripts · public DNS for `@sentinel.viewer`

---

## 1. Clone + branch

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
git checkout TheRemoteViewer
```

Root `Cargo.toml` workspace includes `optical-airgap/rust`.

---

## 2. TypeScript

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
# offline later: rust/OFFLINE.md + scripts/vendor-offline.sh
```

---

## 4. Vault (keys)

See **[VAULT.md](./VAULT.md)**.

```bash
cd optical-airgap
bash scripts/vault-setup.sh      # $HOME/vault-recipient.txt + vault-identity.txt
bash scripts/e2e-age-lt.sh       # full age → LT → peel → decrypt
bash scripts/vault-destroy.sh    # Destroy = Restart
```

Rules: identity never in git/chat/screenshots; burn on exposure; Destroy after experiments.

---

## 5. Security rules

1. **Encrypt first** — never put plaintext in RDH/LT as the secret.  
2. **Identity in Vault only** — never commit `AGE-SECRET-KEY-...`.  
3. **Destroy = Restart** — wipe test keys and blobs after experiments.  
4. RDH `checksumOk === false` → do not decrypt.  

---

## 6. Smoke tests

### LT only

```bash
cd optical-airgap/rust
echo hello-sentinel | cargo run --quiet --bin trv-optical -- frame-stream 16 48 > $HOME/trvl.txt
cargo run --quiet --bin trv-optical -- frame-peel < $HOME/trvl.txt
```

### Browser receiver (feedback loop)

```bash
cd optical-airgap/optical
python -m http.server 8765
# open http://127.0.0.1:8765/qr-receiver.html
# paste $HOME/trvl.txt → Ingest paste → ctrl=complete
```

### Full age chain

```bash
bash optical-airgap/scripts/vault-setup.sh
bash optical-airgap/scripts/e2e-age-lt.sh
bash optical-airgap/scripts/vault-destroy.sh
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/tmp` permission denied | use `$HOME/...` |
| `\~` path errors | use `$HOME`, never escaped tilde |
| cargo treats `--frame-peel` as flag | space after `--`: `-- frame-peel` |
| vault-setup refuses existing identity | run `vault-destroy.sh` first |
| camera blank on `file://` | use local HTTP server |

---

## After successful install

- [x] Branch `TheRemoteViewer`  
- [x] Golden Soliton / frame-stream / frame-peel  
- [x] Full age+LT chain  
- [x] Offline QR + feedback controller  
- [x] Exact original length (u32 prefix)  
- [x] Vault setup / Destroy scripts  

**Share:** INSTALL + OPEN-SOURCE + SENTINEL-STANDARD + VAULT.  
**Never share:** age identities, Vault material, real payloads.
