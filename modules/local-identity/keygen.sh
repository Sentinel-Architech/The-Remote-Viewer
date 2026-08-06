#!/data/data/com.termux/files/usr/bin/bash
# Local age identity generation — no network, no platform custody

set -euo pipefail

ID_DIR="${HOME}/.local/share/remote-viewer/identity"
mkdir -p "$ID_DIR"
chmod 700 "$ID_DIR"

SECRET="${ID_DIR}/identity.agekey"
PUBLIC="${ID_DIR}/identity.pub"

if [[ -f "$SECRET" ]]; then
  echo "Identity already exists at $SECRET"
  echo "Refusing to overwrite. Destroy the file manually if you intend Destroy = Restart."
  exit 1
fi

if command -v age-keygen >/dev/null 2>&1; then
  age-keygen -o "$SECRET" 2>/dev/null
  # Extract public key
  grep -E '^# public key:' "$SECRET" | sed 's/^# public key: //' > "$PUBLIC" || true
  if [[ ! -s "$PUBLIC" ]]; then
    # Fallback parse
    age-keygen -y "$SECRET" > "$PUBLIC"
  fi
elif command -v cargo >/dev/null 2>&1 && [[ -d optical-airgap/rust ]]; then
  echo "age-keygen not found — trying trv-optical keygen path..."
  echo "Run from optical-airgap/rust: cargo run --quiet --bin trv-optical -- keygen"
  exit 1
else
  echo "Neither age-keygen nor trv-optical available. Install age or build optical-airgap/rust."
  exit 1
fi

chmod 600 "$SECRET"
chmod 644 "$PUBLIC"

echo "Local identity created."
echo "Public:  $(cat "$PUBLIC")"
echo "Secret:  $SECRET  (never commit, never share)"
