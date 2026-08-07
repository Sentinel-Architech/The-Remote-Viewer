#!/usr/bin/env bash
# Destroy = Restart — wipe Vault material and common experiment blobs under $HOME.
# Does not touch the git clone. Safe to re-run.
set -euo pipefail

RECIP_FILE="${VAULT_RECIPIENT:-$HOME/vault-recipient.txt}"
ID_FILE="${VAULT_IDENTITY:-$HOME/vault-identity.txt}"

WIPES=(
  "$ID_FILE"
  "$RECIP_FILE"
  "$HOME/ct.bin"
  "$HOME/ct2.bin"
  "$HOME/trvl.txt"
  "$HOME/msg.txt"
)

echo "==> Destroy = Restart" >&2
for f in "${WIPES[@]}"; do
  if [[ -e "$f" ]]; then
    # Best-effort overwrite then remove (not full secure erase on flash)
    if [[ -f "$f" ]]; then
      dd if=/dev/zero of="$f" bs=4096 count=1 status=none 2>/dev/null || true
    fi
    rm -f "$f"
    echo "  wiped $f" >&2
  fi
done

echo "==> Vault paths clear. Generate fresh keys with vault-setup.sh before next encrypt." >&2
