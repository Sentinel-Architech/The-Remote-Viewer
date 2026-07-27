# Signed Commits — Threat Models & Locked Docs

**Status:** Draft policy — July 27, 2026  
**Goal:** Integrity of security documentation (threat models, Ghost Tax, locked principles). A signature proves the commit came from a key you control; it does not encrypt the docs.

---

## 1. Why

Unsigned history on `docs/security/` and `docs/locked/` can be rewritten or injected if credentials leak. **Signed commits** let you (and GitHub) verify:

- Author held a specific signing key at commit time  
- Commit content was not altered after signing  

**In scope (require signature when policy is enforced):**

- `docs/security/**`  
- `docs/locked/**`  
- `SECURITY.md`  

**Recommended for all commits** on this repo once signing works.

**Choose one primary method:** SSH signing (§2) *or* GPG/OpenPGP (§3). Do not mix formats on the same machine without knowing which `gpg.format` is active.

---

## 2. Prefer SSH signing (simplest, strong enough)

Git 2.34+ supports **SSH commit signing**. One key can auth to GitHub *and* sign commits if you choose (or use a dedicated signing key).

### 2.1 Create or reuse an Ed25519 key

```bash
# Dedicated signing key (recommended)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_git_signing -C "trv-git-signing"

# Or reuse existing GitHub auth key path if you accept that coupling
```

### 2.2 Register the public key on GitHub as a **Signing** key

1. GitHub → **Settings** → **SSH and GPG keys**  
2. **New SSH key**  
3. Key type: **Signing Key** (not only Authentication)  
4. Paste contents of `~/.ssh/id_ed25519_git_signing.pub`

### 2.3 Configure git

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519_git_signing.pub

# Sign every commit by default
git config --global commit.gpgsign true

# Optional: sign tags
git config --global tag.gpgsign true
```

Allowed signers file (local verification):

```bash
mkdir -p ~/.config/git
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519_git_signing.pub)" >> ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

Format of each line in `allowed_signers`:

```text
you@example.com ssh-ed25519 AAAA... comment
```

### 2.4 Commit

```bash
# With commit.gpgsign=true, normal commits are signed
git commit -m "docs(security): update threat model"

# Explicit one-off
git commit -S -m "docs(security): update threat model"

git log --show-signature -1
```

On GitHub, the commit should show **Verified** once the signing key is uploaded and the committer email matches a verified GitHub email.

---

## 3. GPG / OpenPGP signing alternative

Use **GPG** when you already run OpenPGP, want hardware-token (YubiKey) signing, or need signatures that interoperate outside GitHub’s SSH signing model.

### 3.1 When to choose GPG over SSH

| Prefer GPG if… | Prefer SSH if… |
|----------------|----------------|
| You already have a maintained OpenPGP identity | You want the fewest moving parts |
| Signing key lives on a **smartcard / YubiKey** | Git 2.34+ and SSH keys are enough |
| You sign tags, mail, or releases with the same key | You only care about GitHub **Verified** commits |
| Org policy mandates OpenPGP | Termux / minimal hosts where GPG agent is painful |

Both are fine for threat-model integrity. **Pick one** and stick to it for this repo.

### 3.2 Install tools

```bash
# Debian/Ubuntu
sudo apt install gnupg

# Fedora
sudo dnf install gnupg2

# macOS (Homebrew)
brew install gnupg

# Termux
pkg install gnupg
```

Confirm:

```bash
gpg --version
```

### 3.3 Generate a signing key

Interactive (recommended for first time):

```bash
gpg --full-generate-key
```

Suggested choices:

- Kind: **(9) ECC** → **Curve 25519** (or RSA 4096 if required by policy)  
- Use: **Sign** (or default full capabilities if you accept a general-purpose key)  
- Validity: e.g. **2y** (rotate; don’t invent “forever” without a reason)  
- Real name + email: **email must match a verified GitHub email**  
- Passphrase: strong; store recovery material offline — **never in the repo**

Batch-style example (Ed25519, adjust email):

```bash
gpg --batch --pinentry-mode loopback --passphrase 'USE_A_REAL_PASSPHRASE' --quick-gen-key \
  'Sentinel Architect <you@example.com>' ed25519 sign 2y
```

Prefer interactive so the passphrase is not left in shell history.

List keys:

```bash
gpg --list-secret-keys --keyid-format LONG
```

Example output fragment:

```text
sec   ed25519/ABCDEF0123456789 2026-07-27 [SC] [expires: 2028-07-27]
      Fingerprint=....
uid                 [ultimate] Sentinel Architect <you@example.com>
```

Use either the **key ID** (`ABCDEF0123456789`) or full **fingerprint** as `user.signingkey`.

### 3.4 Export and register on GitHub

```bash
# Armor public key for GitHub
gpg --armor --export YOUR_KEY_ID_OR_FINGERPRINT
```

1. GitHub → **Settings** → **SSH and GPG keys**  
2. **New GPG key**  
3. Paste the entire armored block (`-----BEGIN PGP PUBLIC KEY BLOCK-----` …)  
4. Save  

GitHub matches the commit’s **committer email** to a UID on the GPG key and to a **verified** email on your account. Mismatch ⇒ unsigned / unverified.

### 3.5 Configure git for GPG

```bash
# Use OpenPGP (not SSH format)
git config --global gpg.format openpgp

# Key ID or full fingerprint from gpg --list-secret-keys
git config --global user.signingkey YOUR_KEY_ID_OR_FINGERPRINT

git config --global commit.gpgsign true
git config --global tag.gpgsign true

# If signing fails with "failed to write commit object" / pinentry issues:
export GPG_TTY=$(tty)
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc   # or ~/.zshrc
```

Optional: explicit program path

```bash
git config --global gpg.program gpg
# Windows sometimes needs:
# git config --global gpg.program "C:/Program Files (x86)/GnuPG/bin/gpg.exe"
```

Repo-only (does not affect other clones):

```bash
cd /path/to/The-Remote-Viewer
git config gpg.format openpgp
git config user.signingkey YOUR_KEY_ID_OR_FINGERPRINT
git config commit.gpgsign true
```

### 3.6 Commit and verify locally

```bash
git commit -S -m "docs(security): update threat model"
# or rely on commit.gpgsign=true without -S

git log --show-signature -1
git verify-commit HEAD
```

Good signature looks like `gpg: Good signature from "..."`.

### 3.7 Agent, passphrase, and session unlock

```bash
# Cache passphrase for a session (seconds)
echo "default-cache-ttl 3600" >> ~/.gnupg/gpg-agent.conf
echo "max-cache-ttl 28800" >> ~/.gnupg/gpg-agent.conf
gpgconf --kill gpg-agent
```

Unlock once:

```bash
echo | gpg --sign --armor > /dev/null
```

### 3.8 Hardware token (optional)

If the secret key is on a **YubiKey** (OpenPGP applet):

1. Move/generate key on card per Yubico/GnuPG docs.  
2. `gpg --card-status` should show the signing key.  
3. Same `user.signingkey` + `commit.gpgsign true`.  
4. PIN entry happens on touch/PIN; commits fail closed if the token is absent.

This is the strongest **GPG** operational posture for signing threat-model history.

### 3.9 Backup and revocation

```bash
# Private key backup — encrypt and store offline (not in git)
gpg --export-secret-keys --armor YOUR_KEY_ID > secret-backup.asc
# Then encrypt secret-backup.asc with a separate mechanism and delete plaintext

# Public key only (safe to store more widely)
gpg --armor --export YOUR_KEY_ID > public.asc
```

If the key is compromised: **revoke**, publish revocation to where you distribute the public key, generate a new key, update GitHub GPG keys, and rotate `user.signingkey`.

### 3.10 Switching from SSH signing back to GPG (or the reverse)

```bash
# To GPG
git config --global gpg.format openpgp
git config --global user.signingkey YOUR_GPG_KEY_ID

# To SSH
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519_git_signing.pub
```

Confirm with a test commit and the GitHub **Verified** badge before enabling branch rules.

### 3.11 Common GPG failures

| Symptom | Fix |
|---------|-----|
| `gpg failed to sign the data` | `export GPG_TTY=$(tty)`; ensure `gpg.program` is correct |
| `secret key not available` | Wrong `user.signingkey`; check `gpg --list-secret-keys` |
| GitHub shows Unverified | Email on commit ≠ key UID / GitHub verified email |
| Works locally, not in GUI | GUI apps lack `GPG_TTY` / pinentry; sign from terminal or configure pinentry |
| Termux pinentry issues | Use recent `gnupg`, set `GPG_TTY`, or prefer SSH signing on mobile |

---

## 4. Repo-local enforcement (this clone)

From repo root, without changing your other projects:

**SSH:**

```bash
cd /path/to/The-Remote-Viewer
git config commit.gpgsign true
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519_git_signing.pub
```

**GPG:**

```bash
cd /path/to/The-Remote-Viewer
git config commit.gpgsign true
git config gpg.format openpgp
git config user.signingkey YOUR_KEY_ID_OR_FINGERPRINT
```

Optional **pre-commit hook** (warns if signing is off):

```bash
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/usr/bin/env bash
if [ "$(git config --bool commit.gpgsign)" != "true" ]; then
  echo "WARNING: commit.gpgsign is not true. Threat model commits should be signed." >&2
  echo "See docs/security/signed-commits.md" >&2
fi
exit 0
EOF
chmod +x .git/hooks/pre-commit
```

Hooks are **not** shared via git by default (`.git/hooks`). Each clone opts in.

---

## 5. GitHub enforcement (branch protection / rulesets)

Do this in the GitHub UI (requires admin on the repo):

### 5.1 Ruleset (preferred)

1. **Settings** → **Rules** → **Rulesets** → **New branch ruleset**  
2. Name: `signed-commits-main`  
3. Target: `main` (and optionally `feature/**` later)  
4. Enable:  
   - **Require signed commits**  
   - **Block force pushes**  
   - **Require a pull request** (recommended)  
5. Save

### 5.2 Classic branch protection

1. **Settings** → **Branches** → **Add rule**  
2. Branch name pattern: `main`  
3. Enable **Require signed commits**  
4. Save

**Note:** After this is on, **unsigned** pushes to `main` fail — including some bot or web-UI edits unless those actors also sign. Plan for that before enabling on `main`.

GitHub accepts **either** SSH-signed or GPG-signed commits as long as the corresponding public key is registered and the email matches.

### 5.3 Path-focused discipline (policy)

GitHub cannot easily say “only `docs/security` must be signed” in classic rules; **require signed commits for the whole branch**, and treat security docs as the reason. Alternatively keep signing required on `main` only and always merge security doc changes via PR.

---

## 6. Verify others’ commits

```bash
git log --show-signature docs/security/
git verify-commit HEAD
```

On GitHub: green **Verified** badge on the commit.

For GPG, import the author’s public key before local `Good signature` verification.

---

## 7. GrapheneOS / Termux notes

- Install a recent **git** (SSH signing needs 2.34+).  
- **SSH signing** is usually easier on mobile than full GPG pinentry.  
- If using GPG on Termux: `pkg install gnupg`, set `GPG_TTY=$(tty)`, strong passphrase, offline encrypted backup of secret key.  
- Prefer a **signing-only** key not reused for random SSH logins.  
- Never commit private keys, `*.asc` secret exports, or `gpg-agent` sockets.

---

## 8. What signed commits do *not* do

| They do | They do not |
|---------|-------------|
| Prove key possession at commit time | Encrypt threat model content |
| Detect post-hoc commit tampering | Stop a thief with your unlocked key |
| Satisfy “Verified” on GitHub | Replace code review or branch protection alone |
| Help audit who changed locked docs | Stop you from signing a malicious commit yourself |

---

## 9. Checklist (enable in order)

**SSH path**

- [ ] Generate Ed25519 signing key  
- [ ] Add public key to GitHub as **Signing** key  
- [ ] `gpg.format ssh` + `commit.gpgsign true`  
- [ ] Test commit → **Verified**  
- [ ] Ruleset: require signed commits on `main`  

**GPG path**

- [ ] Install GnuPG; generate Ed25519 (or RSA 4096) sign key  
- [ ] Export public key; add under GitHub **GPG keys**  
- [ ] `gpg.format openpgp` + `user.signingkey` + `commit.gpgsign true`  
- [ ] `GPG_TTY` set; test commit → **Verified**  
- [ ] Offline encrypted backup of secret key; ruleset on `main`  

---

## 10. Related

- `docs/security/threat-model.md` — system threat model  
- `docs/security/ghost-tax.md` — Ghost Tax definition  
- `docs/locked/` — non-negotiable principles  
- `SECURITY.md` — project security contact / posture  
