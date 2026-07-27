# Secrets Policy

**Status:** Draft — July 27, 2026  
**Related:** `.gitignore`, `docs/security/threat-model.md`, `docs/locked/10-Threat-Model-Key-Loss.md`

---

## Rule

**No private keys, seed phrases, API tokens, wallet keypairs, or live `.env` values in git — ever.**

Public examples use `.env.example` with empty or clearly fake placeholders only.

---

## Allowed in repo

| Item | Example |
|------|--------|
| Empty / placeholder env templates | `apps/shared/.env.example` |
| Public addresses documented as public | Community pool address in locked docs |
| Public contract IDs once published | After deliberate release |
| SSH/GPG **public** keys in docs if needed | Never private |

## Forbidden in repo

| Item |
|------|
| `.env`, `.env.local`, production env files |
| `*.pem`, `*.key`, wallet `id.json`, Solana deploy keypairs |
| Mnemonic / seed phrases (any file type) |
| Git signing **private** keys |
| Stego forge temporary `secret.txt` / raw vault key files |
| Cloud API tokens (Pinata, Infura, Alchemy, etc.) |

---

## If something was committed by mistake

1. **Rotate** the secret immediately (it is burned for practical purposes).  
2. Remove from the tree in a new commit.  
3. Treat history as still containing it until rewritten with care (or accept rotation as sufficient).  
4. Do not rely on “delete file in latest commit” alone if the value was ever pushed.

---

## Local layout (suggested)

```text
~/trv-secrets/          # outside the clone; encrypted backup
The-Remote-Viewer/
  .env                  # gitignored
  apps/shared/.env.example
```

---

## Checklist before push

```bash
git status
git diff --cached
# confirm no .env, keypair, mnemonic, or token
```

Optional:

```bash
git grep -iE 'BEGIN (RSA|OPENSSH|PGP) PRIVATE|mnemonic|seed phrase' || true
```

---

*Enforced by `.gitignore` patterns; humans still must not force-add secrets.*
