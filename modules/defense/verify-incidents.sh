#!/usr/bin/env bash
# Verify defense incident JSONL hash chain (offline, fail closed)
set -euo pipefail

FILE="${HOME}/.local/share/remote-viewer/defense/incidents/events.jsonl"

if [[ ! -f "$FILE" ]]; then
  echo "No incident events file — nothing to verify."
  exit 0
fi

hash_line() {
  if command -v sha256sum >/dev/null 2>&1; then
    printf '%s' "$1" | sha256sum | awk '{print $1}'
  else
    printf '%s' "$1" | sha256 | awk '{print $1}'
  fi
}

N=0
FAIL=0
PREV_SHA="genesis"

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" ]] && continue
  N=$((N + 1))

  GOT_PREV=$(printf '%s' "$line" | sed -n 's/.*"prev":"\([^"]*\)".*/\1/p')
  GOT_SHA=$(printf '%s' "$line" | sed -n 's/.*"sha":"\([^"]*\)".*/\1/p')

  if [[ -z "$GOT_PREV" || -z "$GOT_SHA" ]]; then
    echo "FAIL line $N: missing prev/sha"
    FAIL=1
    continue
  fi

  if [[ "$GOT_PREV" != "$PREV_SHA" ]]; then
    echo "FAIL line $N: prev mismatch"
    echo "  expected: $PREV_SHA"
    echo "  got:      $GOT_PREV"
    FAIL=1
  fi

  # Rebuild body as hashed at record time: drop ,"sha":"..." and keep closing }
  BODY=$(printf '%s' "$line" | sed 's/,"sha":"[^"]*"}$/}/')
  CALC=$(hash_line "$BODY")
  if [[ "$CALC" != "$GOT_SHA" ]]; then
    echo "FAIL line $N: sha mismatch"
    FAIL=1
  fi

  PREV_SHA=$(hash_line "$line")
done < "$FILE"

if [[ "$FAIL" -eq 0 ]]; then
  echo "VERIFY OK ($N incidents, chain intact)"
  exit 0
fi
echo "VERIFY FAILED"
exit 1
