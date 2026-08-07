#!/usr/bin/env bash
# hydra-gate.sh — fail closed for vending deliver when Hydra says FAIL
# Exit 0 = allow deliver
# Exit 11 = quarantine (integrity FAIL)
# Env: HYDRA_GATE=0 to bypass (not recommended)
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
BASE="${HOME}/.local/share/remote-viewer/defense"
FLAG="${BASE}/QUARANTINE"

if [[ "${HYDRA_GATE:-1}" == "0" ]]; then
  echo "[hydra-gate] bypass HYDRA_GATE=0" >&2
  exit 0
fi

# Explicit quarantine flag (set by pulse on FAIL)
if [[ -f "$FLAG" ]]; then
  echo "[hydra-gate] QUARANTINE active — deliver blocked" >&2
  echo "[hydra-gate] clear: bash modules/defense/integrity-pulse.sh  (must PASS)" >&2
  exit 11
fi

# Fast path: recent PASS marker (5 min) optional
PASS="${BASE}/LAST_PASS"
if [[ -f "$PASS" ]]; then
  now=$(date +%s)
  ts=$(stat -c '%Y' "$PASS" 2>/dev/null || stat -f '%m' "$PASS" 2>/dev/null || echo 0)
  if [[ $((now - ts)) -le 300 ]]; then
    exit 0
  fi
fi

# Otherwise run pulse (ALLOW_NO_SEAL for first-run friendliness only if no seal)
set +e
ALLOW_NO_SEAL=1 bash "$ROOT/modules/defense/integrity-pulse.sh" >/dev/null 2>&1
rc=$?
set -e
if [[ $rc -ne 0 ]]; then
  echo "[hydra-gate] integrity-pulse FAIL — deliver blocked" >&2
  exit 11
fi
exit 0
