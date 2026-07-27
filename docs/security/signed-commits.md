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
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519_git_signing.pub)" >> ~/.config/git/allowed_signers
mkdir -p ~/.config/git
# if file was created in wrong order, fix path then:
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

## 3. GPG alternative

Use if you already have an OpenPGP workflow.

```bash
gpg --full-generate-key   # Ed25519 or RSA 4096
gpg --list-secret-keys --keyid-format LONG

git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
git config --global gpg.format openpgp   # default
```

Export and add the public key under GitHub → **GPG keys**.

```bash
gpg --armor --export YOUR_KEY_ID
```

---

## 4. Repo-local enforcement (this clone)

From repo root, without changing your other projects:

```bash
cd /path/to/The-Remote-Viewer

git config commit.gpgsign true
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519_git_signing.pub
```

Optional **pre-commit hook** (blocks unsigned commits in this repo only):

```bash
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOF'
#!/usr/bin/env bash
# Soft policy: warn if commit.gpgsign is not true
if [ "$(git config --bool commit.gpgsign)" != "true" ]; then
  echo "WARNING: commit.gpgsign is not true. Threat model commits should be signed." >&2
  echo "See docs/security/signed-commits.md" >&2
fi
exit 0
EOF
chmod +x .git/hooks/pre-commit
```

Hooks are **not** shared via git by default (`.git/hooks`). Document them here; each clone opts in.

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

### 5.3 Path-focused discipline (policy)

GitHub cannot easily say “only `docs/security` must be signed” in classic rules; **require signed commits for the whole branch**, and treat security docs as the reason. Alternatively keep signing required on `main` only and always merge security doc changes via PR.

---

## 6. Verify others’ commits

```bash
git log --show-signature docs/security/
git verify-commit HEAD
```

On GitHub: green **Verified** badge on the commit.

---

## 7. GrapheneOS / Termux notes

- Install a recent **git** that supports `gpg.format ssh`.  
- Keep the signing private key on device storage you control; use a strong passphrase on the key.  
- Prefer a **signing-only** key that is **not** used for SSH login to random hosts.  
- Back up the private key with the same care as other sovereign secrets (encrypted export; not in the repo).

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

- [ ] Generate Ed25519 signing key  
- [ ] Add public key to GitHub as **Signing** key  
- [ ] `git config` signing + `commit.gpgsign true`  
- [ ] Make a test commit; confirm **Verified** on GitHub  
- [ ] Enable **Require signed commits** on `main` (ruleset)  
- [ ] From then on, all threat model / locked doc updates via signed commits or signed PR merges  

---

## 10. Related

- `docs/security/threat-model.md` — system threat model  
- `docs/security/ghost-tax.md` — Ghost Tax definition  
- `docs/locked/` — non-negotiable principles  
- `SECURITY.md` — project security contact / posture  
