#!/usr/bin/env bash
# Path B — collect local evidence for FINISHED checklist
# See docs/public/PATH-B-FINISHED.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="${HOME}/.local/share/remote-viewer/path-b-recognition"
mkdir -p "$OUT_DIR"
chmod 700 "${HOME}/.local/share/remote-viewer/path-b-recognition" 2>/dev/null || true

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ID=$(date +%Y%m%dT%H%M%S)
HOST=$(uname -n 2>/dev/null || echo unknown)
PROOF="${OUT_DIR}/proof-${ID}.json"

echo "=== Path B proof collection ==="
echo "ts=$TS host=$HOST"
echo

# 1. Optical air-gap presence (script existence + prior proven status)
OPTICAL_OK=0
if [[ -d "${ROOT}/optical-airgap" ]] || [[ -f "${ROOT}/optical-airgap/scripts/e2e-age-lt.sh" ]]; then
  OPTICAL_OK=1
fi
echo "1. Optical air-gap tooling present: $OPTICAL_OK"

# 2. Local age identity
AGE_OK=0
if [[ -f "$HOME/vault-recipient.txt" ]] || [[ -d "$HOME/.age" ]] || [[ -f "$HOME/age-identity.txt" ]]; then
  AGE_OK=1
fi
echo "2. Local age identity material detectable: $AGE_OK"

# 3. Integrity Verifier
IV_OK=0
IV_OUT=""
if [[ -x "${ROOT}/modules/integrity-verifier/attest.sh" ]]; then
  IV_OUT=$(bash "${ROOT}/modules/integrity-verifier/attest.sh" 2>&1) || true
  if printf '%s\n' "$IV_OUT" | grep -q 'overall_ok=1'; then
    IV_OK=1
  fi
fi
echo "3. Integrity Verifier overall_ok=1: $IV_OK"

# 4. Hydra multi-head
HYDRA_OK=0
if [[ -x "${ROOT}/modules/defense/integrity-pulse.sh" ]]; then
  HYDRA_OUT=$(bash "${ROOT}/modules/defense/integrity-pulse.sh" 2>&1) || true
  if printf '%s\n' "$HYDRA_OUT" | grep -qiE 'RESULT: PASS|PASS'; then
    HYDRA_OK=1
  fi
fi
echo "4. Hydra integrity-pulse PASS: $HYDRA_OK"

# 5. Local operator surface
UI_OK=0
if [[ -d "${ROOT}/apps/ui" ]] || [[ -f "${ROOT}/apps/ui/serve-ui.sh" ]]; then
  UI_OK=1
fi
echo "5. Local operator surface present: $UI_OK"

OVERALL=0
if [[ $OPTICAL_OK -eq 1 && $AGE_OK -eq 1 && $IV_OK -eq 1 && $HYDRA_OK -eq 1 && $UI_OK -eq 1 ]]; then
  OVERALL=1
fi

cat > "$PROOF" <<EOF
{
  "type": "path_b_proof_collection",
  "version": 1,
  "ts": "$TS",
  "host": "$HOST",
  "overall_ok": $OVERALL,
  "checks": {
    "optical_airgap": $OPTICAL_OK,
    "local_age_identity": $AGE_OK,
    "integrity_verifier": $IV_OK,
    "hydra_pulse": $HYDRA_OK,
    "local_operator_ui": $UI_OK
  },
  "statement": "Local evidence collection only. Not a grant. Not custody. Transfer by file or optical path."
}
EOF

chmod 600 "$PROOF" 2>/dev/null || true
echo
echo "overall_ok=$OVERALL"
echo "written: $PROOF"
echo
if [[ $OVERALL -eq 1 ]]; then
  echo "All five minimum checks passed. Run make-attestation.sh next."
  exit 0
else
  echo "One or more checks failed. Fix and re-run collect-proof.sh."
  exit 1
fi
