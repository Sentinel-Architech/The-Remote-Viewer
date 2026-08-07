#!/usr/bin/env bash
# verify-seal.sh — compare critical paths to baseline.sha256
# Exit 0 = match (or no seal yet → warn only if ALLOW_NO_SEAL=1)
# Exit 1 = mismatch / missing file that was sealed
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
BASE="${HOME}/.local/share/remote-viewer/defense"
SEAL="${BASE}/baseline.sha256"
ALLOW_NO_SEAL="${ALLOW_NO_SEAL:-0}"

if [[ ! -f "$SEAL" ]]; then
  echo "WARN: no baseline seal at $SEAL (run seal-baseline.sh)"
  if [[ "$ALLOW_NO_SEAL" == "1" ]]; then
    exit 0
  fi
  exit 1
fi

FAIL=0
while read -r sum path; do
  [[ "$sum" == \#* ]] && continue
  [[ -z "${path:-}" ]] && continue
  f="$ROOT/$path"
  if [[ "$sum" == "MISSING" ]]; then
    if [[ -f "$f" ]]; then
      echo "FAIL: was MISSING in seal, now present: $path"
      FAIL=1
    fi
    continue
  fi
  if [[ ! -f "$f" ]]; then
    echo "FAIL: sealed file missing: $path"
    FAIL=1
    continue
  fi
  got=$(sha256sum "$f" | awk '{print $1}')
  if [[ "$got" != "$sum" ]]; then
    echo "FAIL: hash mismatch: $path"
    echo "  want $sum"
    echo "  got  $got"
    FAIL=1
  fi
done < <(grep -v '^#' "$SEAL" | grep -v '^$' || true)

if [[ "$FAIL" -eq 0 ]]; then
  echo "OK: seal matches"
  exit 0
fi
echo "RESULT: SEAL FAIL"
exit 1
