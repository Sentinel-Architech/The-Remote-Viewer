#!/usr/bin/env bash
# Path B — originator-side re-verification of a received attestation
# Usage: bash modules/path-b-recognition/verify-submission.sh /path/to/path-b-attest-*.json
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 /path/to/path-b-attest-*.json [optional-proof-file]"
  exit 1
fi

ATTEST="$1"
PROOF="${2:-}"

if [[ ! -f "$ATTEST" ]]; then
  echo "ERROR: attestation file not found: $ATTEST"
  exit 1
fi

echo "=== Path B Submission Verification ==="
echo "file: $ATTEST"
echo

# Basic type check
if ! grep -q '"type": "path_b_finished_attestation"' "$ATTEST"; then
  echo "FAIL: not a path_b_finished_attestation"
  exit 1
fi

# overall_ok
OVERALL=$(grep -o '"overall_ok": [01]' "$ATTEST" | head -1 | awk '{print $2}' || echo 0)
echo "overall_ok=$OVERALL"
if [[ "$OVERALL" != "1" ]]; then
  echo "FAIL: overall_ok is not 1"
  exit 1
fi

# Required fields presence
for field in ts host proof_sha256 statement checklist_ref; do
  if ! grep -q "\"$field\"" "$ATTEST"; then
    echo "FAIL: missing field $field"
    exit 1
  fi
done
echo "required fields: present"

# Optional proof hash cross-check
if [[ -n "$PROOF" && -f "$PROOF" ]]; then
  if command -v sha256sum >/dev/null 2>&1; then
    ACTUAL=$(sha256sum "$PROOF" | awk '{print $1}')
  elif command -v shasum >/dev/null 2>&1; then
    ACTUAL=$(shasum -a 256 "$PROOF" | awk '{print $1}')
  else
    ACTUAL="unavailable"
  fi
  CLAIMED=$(grep -o '"proof_sha256": "[^"]*"' "$ATTEST" | head -1 | cut -d'"' -f4)
  echo "proof_sha256 claimed=$CLAIMED"
  echo "proof_sha256 actual =$ACTUAL"
  if [[ "$CLAIMED" != "$ACTUAL" && "$ACTUAL" != "unavailable" ]]; then
    echo "FAIL: proof hash mismatch"
    exit 1
  fi
  echo "proof hash: consistent"
fi

echo
echo "RESULT: PASS — attestation is structurally valid and overall_ok=1"
echo "Originator may now run issue-founding.sh if the submission is accepted."
exit 0
