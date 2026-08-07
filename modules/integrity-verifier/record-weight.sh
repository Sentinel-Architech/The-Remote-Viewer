#!/usr/bin/env bash
# Integrity Verifier — record verification outcome as contribution weight
# Locked role: docs/locked/17-Validator-Node-First-Role.md
# Uses modules/contribution/record.sh — kind=verification
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CONTRIB="${ROOT}/modules/contribution"

OUTCOME="${1:-}"
NOTE="${2:-}"

if [[ "$OUTCOME" != "pass" && "$OUTCOME" != "fail" ]]; then
  echo "Usage: $0 <pass|fail> [note]"
  echo "  Records kind=verification into the local contribution ledger."
  exit 1
fi

# pass → amount 1.0 ; fail → amount 0 (still recorded for anti-Sybil trail)
if [[ "$OUTCOME" == "pass" ]]; then
  AMOUNT="1"
else
  AMOUNT="0"
fi

NOTE_SAFE="integrity-verifier:${OUTCOME}"
if [[ -n "$NOTE" ]]; then
  NOTE_SAFE="${NOTE_SAFE}: $(printf '%s' "$NOTE" | tr -d '\n\r"\\' | head -c 120)"
fi

bash "${CONTRIB}/record.sh" verification "$AMOUNT" "$NOTE_SAFE"
echo "Weight recorded: outcome=$OUTCOME amount=$AMOUNT"
echo "(False/negligent attestations should be recorded as fail — reduces effective weight.)"
