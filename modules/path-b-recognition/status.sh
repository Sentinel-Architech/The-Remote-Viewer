#!/usr/bin/env bash
# Path B — show local recognition + Integrity Verifier option status
set -euo pipefail

ID_DIR="${HOME}/.local/share/remote-viewer/identity"
FOUNDING="${ID_DIR}/founding/founding-member.json"

echo "=== Path B / Founding Member Status ==="
echo

if [[ ! -f "$FOUNDING" ]]; then
  echo "Founding Member: NOT PRESENT"
  echo "Integrity Verifier option: unavailable"
  echo
  echo "To activate: receive a founding-member-*.json from the originator,"
  echo "then run: bash modules/path-b-recognition/install-founding.sh <file>"
  exit 1
fi

echo "Founding Member: PRESENT"
echo "file: $FOUNDING"

# Extract key fields if present
STATUS=$(grep -o '"status": "[^"]*"' "$FOUNDING" | head -1 | cut -d'"' -f4 || echo "unknown")
TS=$(grep -o '"ts": "[^"]*"' "$FOUNDING" | head -1 | cut -d'"' -f4 || echo "unknown")
RECIP=$(grep -o '"recipient_hint": "[^"]*"' "$FOUNDING" | head -1 | cut -d'"' -f4 || echo "")

echo "status: $STATUS"
echo "issued: $TS"
if [[ -n "$RECIP" ]]; then
  echo "recipient_hint: $RECIP"
fi
echo
echo "Integrity Verifier option: AVAILABLE"
echo "Constraints remain those locked in docs/locked/17-Validator-Node-First-Role.md"
echo "(no custody, no yield, no free packs, Destroy = Restart extinguishes)"
echo
echo "To exercise the role:"
echo "  bash modules/integrity-verifier/attest.sh"
exit 0
