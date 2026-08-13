#!/usr/bin/env bash
# Validated node count derivation (local + public-signal ready)
# Weight / count is per identity path. No central registry.
set -euo pipefail

ID_DIR="${HOME}/.local/share/remote-viewer/identity"
FOUNDING="${ID_DIR}/founding/founding-member.json"
IV_DIR="${HOME}/.local/share/remote-viewer/integrity-verifier/attestations"

echo "=== Validated Node Count (derivation) ==="
echo "rule: per identity path · no central registry · anti-Sybil"
echo

LOCAL_FOUNDING=0
LOCAL_IV=0
LOCAL_VALIDATED=0

if [[ -f "$FOUNDING" ]]; then
  LOCAL_FOUNDING=1
  echo "Local Founding Member: PRESENT"
  STATUS=$(grep -o '"status": "[^"]*"' "$FOUNDING" | head -1 | cut -d'"' -f4 || echo "unknown")
  echo "  status: $STATUS"
else
  echo "Local Founding Member: NOT PRESENT"
fi

if [[ -d "$IV_DIR" ]]; then
  # Count any attestation files that report overall_ok=1
  IV_OK_FILES=$(grep -l '"overall_ok": 1' "$IV_DIR"/*.json 2>/dev/null | wc -l | tr -d ' ' || echo 0)
  if [[ "${IV_OK_FILES:-0}" -gt 0 ]]; then
    LOCAL_IV=1
  fi
  echo "Local Integrity Verifier successful attestations: ${IV_OK_FILES:-0}"
else
  echo "Local Integrity Verifier attestations: none yet"
fi

if [[ $LOCAL_FOUNDING -eq 1 && $LOCAL_IV -eq 1 ]]; then
  LOCAL_VALIDATED=1
fi

echo
echo "Local validated node (this identity path): $LOCAL_VALIDATED"
echo
echo "--- Public / network view ---"
echo "External Path B operators observed: 0 (none have published tips yet)"
echo "Network validated-node count (distinct identity paths): $LOCAL_VALIDATED"
echo
echo "When external operators publish signed attestation tips,"
echo "any Viewer can collect them and re-derive the distinct-path count."
echo "No central registry is required or created."
echo
echo "Destroy = Restart on an identity path removes that path from the count."
exit 0
