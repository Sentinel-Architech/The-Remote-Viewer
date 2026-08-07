#!/usr/bin/env bash
# Create a fresh Vault identity pair under $HOME.
# Never commit these files. Burn if they appeared in screenshots/chat.
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
RUST="$ROOT/optical-airgap/rust"
RECIP_FILE="${VAULT_RECIPIENT:-$HOME/vault-recipient.txt}"
ID_FILE="${VAULT_IDENTITY:-$HOME/vault-identity.txt}"

if [[ ! -d "$RUST" ]]; then
  echo "error: missing $RUST — set TRV_ROOT" >&2
  exit 1
fi

if [[ -f "$ID_FILE" ]]; then
  echo "warning: $ID_FILE already exists" >&2
  echo "  Run scripts/vault-destroy.sh first, or set VAULT_IDENTITY to a new path." >&2
  exit 1
fi

cd "$RUST"
echo "==> keygen" >&2
cargo run --quiet --bin trv-optical -- keygen 2> "$ID_FILE" | tee "$RECIP_FILE" >/dev/null
chmod 600 "$ID_FILE"
chmod 644 "$RECIP_FILE" 2>/dev/null || true

echo "==> recipient: $RECIP_FILE" >&2
echo "==> identity:  $ID_FILE (mode 600)" >&2
echo "==> Destroy when done: bash $ROOT/optical-airgap/scripts/vault-destroy.sh" >&2
cat "$RECIP_FILE"
