#!/usr/bin/env bash
# Publish a public tip of local validated-node status (optional)
# The tip contains only public fields. No private keys.
set -euo pipefail

ID_DIR="${HOME}/.local/share/remote-viewer/identity"
FOUNDING="${ID_DIR}/founding/founding-member.json"
TIPS_DIR="${HOME}/.local/share/remote-viewer/nodes/tips"
mkdir -p "$TIPS_DIR"
chmod 700 "${HOME}/.local/share/remote-viewer/nodes" 2>/dev/null || true

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ID=$(date +%Y%m%dT%H%M%S)
HOST=$(uname -n 2>/dev/null || echo unknown)

if [[ ! -f "$FOUNDING" ]]; then
  echo "No local Founding Member attestation found."
  echo "Install one first: bash modules/path-b-recognition/install-founding.sh <file>"
  exit 1
fi

RECIP=$(grep -o '"recipient_hint": "[^"]*"' "$FOUNDING" | head -1 | cut -d'"' -f4 || echo "")
STATUS=$(grep -o '"status": "[^"]*"' "$FOUNDING" | head -1 | cut -d'"' -f4 || echo "Founding Member")

# Check for recent successful IV attestation
IV_OK=0
IV_DIR="${HOME}/.local/share/remote-viewer/integrity-verifier/attestations"
if [[ -d "$IV_DIR" ]]; then
  if grep -l '"overall_ok": 1' "$IV_DIR"/*.json >/dev/null 2>&1; then
    IV_OK=1
  fi
fi

OUT="${TIPS_DIR}/tip-${ID}.json"

cat > "$OUT" <<EOF
{
  "type": "validated_node_tip",
  "version": 1,
  "ts": "$TS",
  "host": "$HOST",
  "founding_status": "$STATUS",
  "integrity_verifier_ok": $IV_OK,
  "recipient_hint": "$RECIP",
  "statement": "Public tip only. No private keys. No custody. Distinct identity paths are counted once. Destroy = Restart removes this path from counts."
}
EOF

chmod 600 "$OUT" 2>/dev/null || true

echo "=== Validated Node Tip Published (local) ==="
echo "written: $OUT"
echo "integrity_verifier_ok: $IV_OK"
echo
echo "Transfer this tip (file or optical) so other Viewers can include it in their count."
echo "No network service is required."
exit 0
