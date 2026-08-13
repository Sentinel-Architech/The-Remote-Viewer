#!/usr/bin/env bash
# Path B — package collected proof into transferable attestation
# See docs/public/PATH-B-FINISHED.md
set -euo pipefail

OUT_DIR="${HOME}/.local/share/remote-viewer/path-b-recognition"
mkdir -p "$OUT_DIR"

# Find newest proof
PROOF=$(ls -1t "$OUT_DIR"/proof-*.json 2>/dev/null | head -1 || true)
if [[ -z "$PROOF" || ! -f "$PROOF" ]]; then
  echo "No proof-*.json found. Run collect-proof.sh first."
  exit 1
fi

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ID=$(date +%Y%m%dT%H%M%S)
HOST=$(uname -n 2>/dev/null || echo unknown)
ATTEST="${OUT_DIR}/path-b-attest-${ID}.json"

# Optional public recipient hint only
RECIP=""
if [[ -f "$HOME/vault-recipient.txt" ]]; then
  RECIP=$(tr -d '\n\r' < "$HOME/vault-recipient.txt" | head -c 120)
fi

# Hash the proof
if command -v sha256sum >/dev/null 2>&1; then
  PROOF_HASH=$(sha256sum "$PROOF" | awk '{print $1}')
elif command -v shasum >/dev/null 2>&1; then
  PROOF_HASH=$(shasum -a 256 "$PROOF" | awk '{print $1}')
else
  PROOF_HASH="unavailable"
fi

# Read overall from proof
OVERALL=$(grep -o '"overall_ok": [01]' "$PROOF" | head -1 | awk '{print $2}' || echo 0)

cat > "$ATTEST" <<EOF
{
  "type": "path_b_finished_attestation",
  "version": 1,
  "ts": "$TS",
  "host": "$HOST",
  "overall_ok": $OVERALL,
  "proof_file": "$(basename "$PROOF")",
  "proof_sha256": "$PROOF_HASH",
  "recipient_hint": "$RECIP",
  "statement": "Path B Independent Completion attestation. Bound to builder identity path. Not a mint. Not custody. Not free packs. Transfer by file or optical path. Destroy = Restart extinguishes this status.",
  "checklist_ref": "docs/public/PATH-B-FINISHED.md",
  "role_option": "Integrity Verifier (docs/locked/17-Validator-Node-First-Role.md)"
}
EOF

chmod 600 "$ATTEST" 2>/dev/null || true

echo "=== Path B Attestation ==="
echo "overall_ok=$OVERALL"
echo "proof_sha256=$PROOF_HASH"
echo "written: $ATTEST"
echo
echo "Transfer this file (or an optical frame of it) to the originator for re-verification."
echo "No live network required for validity."

if [[ "$OVERALL" == "1" ]]; then
  exit 0
fi
exit 1
