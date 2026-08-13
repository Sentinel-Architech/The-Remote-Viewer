#!/usr/bin/env bash
# Path B — install a received Founding Member attestation into the local identity surface
# Usage: bash modules/path-b-recognition/install-founding.sh /path/to/founding-member-*.json
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 /path/to/founding-member-*.json"
  exit 1
fi

SRC="$1"
if [[ ! -f "$SRC" ]]; then
  echo "ERROR: file not found: $SRC"
  exit 1
fi

if ! grep -q '"type": "founding_member_attestation"' "$SRC"; then
  echo "ERROR: not a founding_member_attestation"
  exit 1
fi

ID_DIR="${HOME}/.local/share/remote-viewer/identity"
FOUNDING_DIR="${ID_DIR}/founding"
mkdir -p "$FOUNDING_DIR"
chmod 700 "$ID_DIR" "$FOUNDING_DIR" 2>/dev/null || true

# Place a canonical copy
DEST="${FOUNDING_DIR}/founding-member.json"
cp "$SRC" "$DEST"
chmod 600 "$DEST" 2>/dev/null || true

# Also keep a timestamped archive copy
TS=$(date +%Y%m%dT%H%M%S)
cp "$SRC" "${FOUNDING_DIR}/founding-member-${TS}.json"
chmod 600 "${FOUNDING_DIR}/founding-member-${TS}.json" 2>/dev/null || true

echo "=== Founding Member Attestation Installed ==="
echo "canonical: $DEST"
echo
echo "Integrity Verifier option is now available for this identity path."
echo "Run: bash modules/path-b-recognition/status.sh"
echo "Destroy = Restart will remove this status along with the identity."
exit 0
