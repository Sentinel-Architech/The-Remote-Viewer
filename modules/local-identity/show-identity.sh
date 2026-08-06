#!/data/data/com.termux/files/usr/bin/bash
# Print only the public identity

set -euo pipefail

PUBLIC="${HOME}/.local/share/remote-viewer/identity/identity.pub"

if [[ ! -f "$PUBLIC" ]]; then
  echo "No local identity found. Run modules/local-identity/keygen.sh first."
  exit 1
fi

cat "$PUBLIC"
