#!/usr/bin/env bash
# Sentinel Standard — full age → Soliton LT → peel → decrypt (local only)
# Requires vault files created once via:
#   cargo run --quiet --bin trv-optical -- keygen 2> $HOME/vault-identity.txt | tee $HOME/vault-recipient.txt
#   chmod 600 $HOME/vault-identity.txt
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
RUST="$ROOT/optical-airgap/rust"
RECIP_FILE="${VAULT_RECIPIENT:-$HOME/vault-recipient.txt}"
ID_FILE="${VAULT_IDENTITY:-$HOME/vault-identity.txt}"
MSG="${1:-secret viewer message}"

if [[ ! -d "$RUST" ]]; then
  echo "error: missing $RUST — set TRV_ROOT or clone under $HOME/The-Remote-Viewer" >&2
  exit 1
fi
if [[ ! -f "$RECIP_FILE" ]]; then
  echo "error: missing $RECIP_FILE — run keygen first (see INSTALL.md)" >&2
  exit 1
fi
if [[ ! -f "$ID_FILE" ]]; then
  echo "error: missing $ID_FILE — run keygen first (see INSTALL.md)" >&2
  exit 1
fi

cd "$RUST"
RECIP=$(tr -d '\r\n' < "$RECIP_FILE")

echo "==> encrypt" >&2
echo "$MSG" | cargo run --quiet --bin trv-optical -- encrypt "$RECIP" > "$HOME/ct.bin"
echo "==> frame-stream (Soliton, exact-len)" >&2
cargo run --quiet --bin trv-optical -- frame-stream 32 0 < "$HOME/ct.bin" > "$HOME/trvl.txt"
echo "==> frame-peel" >&2
cargo run --quiet --bin trv-optical -- frame-peel < "$HOME/trvl.txt" > "$HOME/ct2.bin"
echo "==> decrypt" >&2
cargo run --quiet --bin trv-optical -- decrypt "$ID_FILE" < "$HOME/ct2.bin"
echo >&2
echo "==> e2e-age-lt OK" >&2

rm -f "$HOME/ct.bin" "$HOME/ct2.bin" "$HOME/trvl.txt"
