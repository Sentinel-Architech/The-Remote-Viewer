#!/usr/bin/env bash
# Integrity Verifier — contribution ledger check (offline)
# Locked role: docs/locked/17-Validator-Node-First-Role.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CONTRIB="${ROOT}/modules/contribution"
DIR="${HOME}/.local/share/remote-viewer/contribution"
FILE="${DIR}/events.jsonl"

echo "=== Integrity Verifier: contribution ==="

if [[ ! -f "$FILE" ]] || [[ ! -s "$FILE" ]]; then
  echo "RESULT: empty (no events)"
  echo "CONTRIB_OK=0"
  echo "CONTRIB_EVENTS=0"
  echo "CONTRIB_TIP="
  exit 0
fi

if ! bash "${CONTRIB}/verify.sh"; then
  echo "RESULT: FAIL (chain broken)"
  echo "CONTRIB_OK=0"
  exit 1
fi

N=$(wc -l < "$FILE" | tr -d ' ')
LAST=$(tail -n 1 "$FILE")
TIP=$(printf '%s' "$LAST" | sed -n 's/.*"sha":"\([^"]*\)".*/\1/p')

if [[ -z "$TIP" ]]; then
  echo "RESULT: FAIL (tip sha missing)"
  echo "CONTRIB_OK=0"
  exit 1
fi

echo "RESULT: OK"
echo "CONTRIB_OK=1"
echo "CONTRIB_EVENTS=$N"
echo "CONTRIB_TIP=$TIP"
exit 0
