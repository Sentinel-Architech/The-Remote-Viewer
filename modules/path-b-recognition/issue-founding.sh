#!/usr/bin/env bash
# Path B — originator issues Founding Member attestation after successful verification
# Usage: bash modules/path-b-recognition/issue-founding.sh /path/to/verified-path-b-attest-*.json
#
# Stage 1 liveness (optional but recommended once a list exists):
#   export TRV_PATH_B_REQUIRE_LIVENESS=1
#   export TRV_VALIDATOR_LIST=/path/to/validator-list-epoch-1.json
#   # originator must have a fresh signed beacon (emit.sh)
# Escape hatch for pure Stage 0:
#   export TRV_PATH_B_STAGE0=1
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 /path/to/verified-path-b-attest-*.json"
  exit 1
fi

SRC="$1"
if [[ ! -f "$SRC" ]]; then
  echo "ERROR: source attestation not found: $SRC"
  exit 1
fi

# Quick guard
if ! grep -q '"overall_ok": 1' "$SRC"; then
  echo "ERROR: source attestation does not show overall_ok=1. Run verify-submission.sh first."
  exit 1
fi

# --- Stage 1: require active validator when enabled ---
REQUIRE=0
if [[ "${TRV_PATH_B_STAGE0:-0}" == "1" ]]; then
  REQUIRE=0
elif [[ "${TRV_PATH_B_REQUIRE_LIVENESS:-0}" == "1" ]]; then
  REQUIRE=1
elif [[ -n "${TRV_VALIDATOR_LIST:-}" ]]; then
  REQUIRE=1
elif [[ -f "docs/public/validator-list-epoch-1.json" || -f "$HOME/The-Remote-Viewer/docs/public/validator-list-epoch-1.json" || -f "$HOME/trv-beacon/validator-list.json" ]]; then
  # List exists on disk — default to requiring liveness for honesty once populated
  REQUIRE=1
fi

if [[ "$REQUIRE" -eq 1 ]]; then
  ROOT=$(cd "$(dirname "$0")/../.." && pwd)
  REQ="$ROOT/modules/beacon/require-active.sh"
  echo "=== Stage 1 liveness check ==="
  if ! bash "$REQ"; then
    echo "ERROR: issuer is not an active listed validator (fresh signed beacon required)."
    echo "  1. bash modules/beacon/emit.sh --validator <id> --key \$HOME/trv-beacon/validator.pem --once"
    echo "  2. re-run issue-founding.sh"
    echo "  Or set TRV_PATH_B_STAGE0=1 to issue under pure Stage 0 rules."
    exit 1
  fi
  echo
fi

OUT_DIR="${HOME}/.local/share/remote-viewer/path-b-recognition/issued"
mkdir -p "$OUT_DIR"
chmod 700 "${HOME}/.local/share/remote-viewer/path-b-recognition" 2>/dev/null || true

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ID=$(date +%Y%m%dT%H%M%S)
HOST=$(uname -n 2>/dev/null || echo unknown)

RECIP=$(grep -o '"recipient_hint": "[^"]*"' "$SRC" | head -1 | cut -d'"' -f4 || echo "")
SRC_HASH=""
if command -v sha256sum >/dev/null 2>&1; then
  SRC_HASH=$(sha256sum "$SRC" | awk '{print $1}')
elif command -v shasum >/dev/null 2>&1; then
  SRC_HASH=$(shasum -a 256 "$SRC" | awk '{print $1}')
else
  SRC_HASH="unavailable"
fi

OUT="${OUT_DIR}/founding-member-${ID}.json"

LIVENESS_NOTE="Stage 0 (liveness not required for this issuance)"
if [[ "$REQUIRE" -eq 1 ]]; then
  LIVENESS_NOTE="Stage 1: issuer passed require-active (listed + fresh ed25519 beacon)"
fi

cat > "$OUT" <<EOF
{
  "type": "founding_member_attestation",
  "version": 1,
  "ts": "$TS",
  "issuer_host": "$HOST",
  "status": "Founding Member (Path B — Independent Completion)",
  "grants": [
    "Founding Sovereign Viewer recognition",
    "Lifetime highest paid tier (no recurring fee)",
    "Additional 2.50% native shop discount",
    "Option to operate Integrity Verifier role"
  ],
  "source_attestation_sha256": "$SRC_HASH",
  "recipient_hint": "$RECIP",
  "issuer_liveness": "$LIVENESS_NOTE",
  "constraints": [
    "No free packs",
    "No yield",
    "No custody",
    "No permanent privilege beyond identity path",
    "Destroy = Restart extinguishes this status and all grants"
  ],
  "role_option_ref": "docs/locked/17-Validator-Node-First-Role.md",
  "checklist_ref": "docs/public/PATH-B-FINISHED.md",
  "statement": "Recognition of Independent Completion. Bound to the builder identity path. Transfer by file or optical path. Not a mint. Not a token. Not custody."
}
EOF

chmod 600 "$OUT" 2>/dev/null || true

echo "=== Founding Member Attestation Issued ==="
echo "status: Founding Member (Path B)"
echo "source_sha256: $SRC_HASH"
echo "issuer_liveness: $LIVENESS_NOTE"
echo "written: $OUT"
echo
echo "Return this file (or optical frame) to the builder by offline / out-of-band channel."
echo "The builder places it in their local identity surface to activate the Integrity Verifier option."
exit 0
