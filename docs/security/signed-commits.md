# Signed Commits — Threat Models & Locked Docs

**Status:** Draft policy — July 27, 2026  
**Project standard:** **SSH commit signing only**  
**Goal:** Integrity of security documentation (threat models, Ghost Tax, locked principles). A signature proves the commit came from a key you control; it does not encrypt the docs.

GPG/OpenPGP signing is **not** the project standard. Do not configure `gpg.format openpgp` for this repository unless you are recovering an exceptional external requirement. Stay on SSH (§2).

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

---

## 2. SSH signing (project standard)

Git 2.34+ supports **SSH commit signing**. Use a **dedicated** Ed25519 key for signing (recommended), not shared with random SSH logins.

### 2.1 Create an Ed25519 signing key

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_git_signing -C "trv-git-signing"
```

### 2.2 Register the public key on GitHub as a **Signing** key

1. GitHub → **Settings** → **SSH and GPG keys**  
2. **New SSH key**  
3. Key type: **Signing Key** (not only Authentication)  
4. Paste contents of `~/.ssh/id_ed25519_git_signing.pub`

### 2.3 Configure git (global or this repo only)

**Global:**

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519_git_signing.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

**This repo only:**

```bash
cd /path/to/The-Remote-Viewer
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519_git_signing.pub
git config commit.gpgsign true
git config tag.gpgsign true
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

Use a **verified GitHub email** as `user.email` so commits show **Verified**.

### 2.4 Commit

```bash
git commit -m "docs(security): update threat model"
# or explicit:
git commit -S -m "docs(security): update threat model"

git log --show-signature -1
```

On GitHub, the commit should show **Verified**.

### 2.5 Ensure you are not on GPG format

```bash
git config --show-origin --get gpg.format
# expected for this project: ssh

# If it says openpgp, switch back:
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519_git_signing.pub
```

---

## 3. GPG — not used (reference only)

This project **stays with SSH signing**. GPG steps are omitted on purpose so clones do not drift.

If an external party only accepts OpenPGP, handle that outside this repo’s standard workflow; do not change `gpg.format` for day-to-day TRV commits.

---

## 4. Repo-local soft hook (optional)

```bash
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/usr/bin/env bash
if [ "$(git config --bool commit.gpgsign)" != "true" ]; then
  echo "WARNING: commit.gpgsign is not true. Threat model commits should be signed (SSH)." >&2
  echo "See docs/security/signed-commits.md" >&2
fi
fmt=$(git config --get gpg.format || echo openpgp)
if [ "$fmt" != "ssh" ]; then
  echo "WARNING: gpg.format is '$fmt' (expected ssh for this project)." >&2
fi
exit 0
EOF
chmod +x .git/hooks/pre-commit
```

Hooks live under `.git/hooks` and are **not** cloned automatically.

---

## 5. GitHub enforcement

1. **Settings** → **Rules** → **Rulesets** → **New branch ruleset**  
2. Name: `signed-commits-main`  
3. Target: `main`  
4. Enable **Require signed commits**, block force pushes, prefer require PR  
5. Save **after** a test SSH-signed commit shows **Verified**

Classic path: **Settings** → **Branches** → protect `main` → **Require signed commits**.

---

## 6. Verify

```bash
git log --show-signature docs/security/
git verify-commit HEAD
```

GitHub: green **Verified** badge.

---

## 7. GrapheneOS / Termux

- Git **2.34+** for SSH signing  
- Dedicated `id_ed25519_git_signing` with passphrase  
- Backup private key offline (encrypted); never commit it  
- Avoid GPG pinentry complexity on mobile — SSH is the standard here  

---

## 8. What signed commits do *not* do

| They do | They do not |
|---------|-------------|
| Prove key possession at commit time | Encrypt threat model content |
| Detect post-hoc commit tampering | Stop a thief with your unlocked key |
| Satisfy “Verified” on GitHub | Replace code review or branch protection alone |
| Help audit who changed locked docs | Stop you from signing a malicious commit yourself |

---

## 9. Checklist (SSH only)

- [ ] `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_git_signing`  
- [ ] GitHub → **Signing Key** with the `.pub`  
- [ ] `gpg.format ssh` + `user.signingkey` + `commit.gpgsign true`  
- [ ] Test commit → **Verified**  
- [ ] Ruleset: require signed commits on `main`  
- [ ] Confirm `gpg.format` is **not** `openpgp`  

---

## 10. Related

- `docs/security/threat-model.md`  
- `docs/security/ghost-tax.md`  
- `docs/locked/`  
- `SECURITY.md`  
