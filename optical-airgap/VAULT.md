# Vault hygiene (P3-E)

Local key practice for TRV optical path. Works on **any open-stack host** (Termux, Linux, Windows/WSL, macOS). GrapheneOS is preferred mobile lockdown, not required.

## Rules

1. **Identity stays in Vault** — `AGE-SECRET-KEY-…` never in git, chat, or screenshots.  
2. **Recipient is shareable** — `age1…` can leave the device.  
3. **Destroy = Restart** — after tests, wipe identity + experiment blobs.  
4. **Burn on exposure** — if a key hit a screenshot or scrollback, destroy and keygen again.  

## One-time setup

```bash
cd $HOME/The-Remote-Viewer/optical-airgap
bash scripts/vault-setup.sh
# writes:
#   $HOME/vault-recipient.txt
#   $HOME/vault-identity.txt   (chmod 600)
```

Override paths:

```bash
VAULT_IDENTITY=$HOME/vault-id-ops.txt VAULT_RECIPIENT=$HOME/vault-recip-ops.txt bash scripts/vault-setup.sh
```

## Full chain (uses Vault files)

```bash
bash scripts/e2e-age-lt.sh
# or with a custom message:
bash scripts/e2e-age-lt.sh "your message"
```

## Destroy

```bash
bash scripts/vault-destroy.sh
```

Removes default Vault files and common `$HOME` experiment blobs (`ct.bin`, `trvl.txt`, …). Does **not** delete the repo.

## Termux notes

- Always `$HOME/...` — not `/tmp`.  
- After Destroy, run `vault-setup.sh` before the next encrypt.  
- Optional: keep identity on encrypted storage only; never cloud sync.  

## Checklist before claiming “Vault OK”

- [ ] `vault-setup.sh` created both files  
- [ ] `vault-identity.txt` is mode 600  
- [ ] `e2e-age-lt.sh` recovered plaintext  
- [ ] `vault-destroy.sh` removed identity  
- [ ] No identity string remains in terminal scrollback you will share  
