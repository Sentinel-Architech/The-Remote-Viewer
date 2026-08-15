# Optical Air-Gap — Install (Sentinel Standard)

This guide is written so a complete beginner can follow it.

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

## Prerequisites — install these first

### 1. The `age` encryption tool (required)

You need the free tool called **age** so you can create private keys and encrypt/decrypt messages.

**On Termux (Android):**
```bash
pkg update && pkg install age -y
```

**On Ubuntu / Debian:**
```bash
sudo apt update && sudo apt install age -y
```

**On macOS:**
```bash
brew install age
```

**On Windows:**  
Download the latest release from https://github.com/FiloSottile/age/releases  
Put `age.exe` and `age-keygen.exe` in a folder that is in your PATH.

Check it works:
```bash
age --version
age-keygen --version
```

### 2. Other tools

**Desktop**
- Git
- Node.js 20 or newer
- Optional: Rust 1.74 or newer (only needed for the Rust CLI tests)

**Mobile / Termux**
- Termux (install from F-Droid)
- GrapheneOS is the hardened reference phone OS, but any open Android works
- Run: `pkg install git nodejs python`
- Optional: `pkg install rust`

**Important for Termux:** Always use `$HOME/...` for files. `/tmp` often fails or gets cleaned.

### Not required
Play Services · Meta/Microsoft SDKs · CDN scripts · public DNS for `@sentinel.viewer`

---

## 1. Clone the repository

```bash
git clone https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
git checkout TheRemoteViewer
```

---

## 2. TypeScript / Node path

```bash
cd optical-airgap
npm install
npm run test:golden
```

---

## 3. Rust CLI (optional)

```bash
cd optical-airgap/rust
cargo test
# offline later: see rust/OFFLINE.md + scripts/vendor-offline.sh
```

---

## 4. Vault (your private keys)

See **[VAULT.md](./VAULT.md)** for the full rules.

```bash
cd optical-airgap
bash scripts/vault-setup.sh      # creates $HOME/vault-recipient.txt + vault-identity.txt
bash scripts/e2e-age-lt.sh       # full age → LT → peel → decrypt test
bash scripts/vault-destroy.sh    # Destroy = Restart (wipes the test keys)
```

**Critical rules:**
- Never put your private key (`AGE-SECRET-KEY-...`) in git, chat, or screenshots.
- Burn / destroy test keys after you finish experimenting.
- Loss of the private key = start over. That is the design.

---

## 5. Security rules (short version)

1. **Encrypt first** — never put plaintext into the frames as the secret.
2. **Identity stays in the Vault only** — never commit private keys.
3. **Destroy = Restart** — wipe test keys and files when you are done.
4. If a checksum fails, do not decrypt.

---

## 6. Smoke tests

### LT only (no age needed)

```bash
cd optical-airgap/rust
echo hello-sentinel | cargo run --quiet --bin trv-optical -- frame-stream 16 48 > $HOME/trvl.txt
cargo run --quiet --bin trv-optical -- frame-peel < $HOME/trvl.txt
```

### Browser receiver (feedback loop)

```bash
cd optical-airgap/optical
python -m http.server 8765
# open http://127.0.0.1:8765/qr-receiver.html in a browser
# paste the content of $HOME/trvl.txt → Ingest paste
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
| `/tmp` permission denied | use `$HOME/...` instead |
| path errors with `~` | always write `$HOME`, never a literal tilde |
| cargo treats arguments as flags | put a space after `--` : `-- frame-peel` |
| vault-setup refuses existing identity | run `vault-destroy.sh` first |
| camera blank on `file://` | use the local HTTP server (`python -m http.server`) |

---

## After successful install checklist

- [ ] Branch `TheRemoteViewer` checked out
- [ ] `age` and `age-keygen` work
- [ ] Golden Soliton / frame-stream / frame-peel works
- [ ] Full age + LT chain works
- [ ] Offline QR + feedback controller works
- [ ] Vault setup / Destroy scripts work

**Share freely:** this INSTALL file, OPEN-SOURCE.md, SENTINEL-STANDARD.md, VAULT.md  
**Never share:** age private keys, Vault material, or real secret payloads.
