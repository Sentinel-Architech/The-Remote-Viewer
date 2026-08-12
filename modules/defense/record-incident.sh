#!/usr/bin/env bash
# Append a local Hydra incident (offline JSONL + hash chain)
# Used by adaptive learning head — stays on-device only
set -euo pipefail

KIND="${1:-integrity_fail}"
HEADS="${2:-}"
DETAILS="${3:-}"

DIR="${HOME}/.local/share/remote-viewer/defense/incidents"
mkdir -p "$DIR"
chmod 700 "$DIR" 2>/dev/null || true
FILE="${DIR}/events.jsonl"

TS=$(date -Iseconds)
ID="$(date +%s)-$$-$RANDOM"

# Sanitize inputs (no newlines, limited length)
KIND_SAFE=$(printf '%s' "$KIND" | tr -d '\n\r"\\' | head -c 64)
HEADS_SAFE=$(printf '%s' "$HEADS" | tr -d '\n\r"\\' | head -c 256)
DETAILS_SAFE=$(printf '%s' "$DETAILS" | tr -d '\n\r"\\' | head -c 512)

hash_str() {
  if command -v sha256sum >/dev/null 2>&1; then
    printf '%s' "$1" | sha256sum | awk '{print $1}'
  else
    printf '%s' "$1" | sha256 | awk '{print $1}'
  fi
}

if [[ -f "$FILE" ]] && [[ -s "$FILE" ]]; then
  PREV=$(tail -n 1 "$FILE")
  PREV_SHA=$(hash_str "$PREV")
else
  PREV_SHA="genesis"
fi

BODY=$(printf '{"id":"%s","ts":"%s","kind":"%s","heads":"%s","details":"%s","prev":"%s"}' \
  "$ID" "$TS" "$KIND_SAFE" "$HEADS_SAFE" "$DETAILS_SAFE" "$PREV_SHA")
SHA=$(hash_str "$BODY")

BODY_OPEN=$(printf '%s' "$BODY" | sed 's/}$//')
LINE=$(printf '%s,"sha":"%s"}' "$BODY_OPEN" "$SHA")
printf '%s\n' "$LINE" >> "$FILE"

chmod 600 "$FILE" 2>/dev/null || true
echo "Incident recorded: kind=$KIND_SAFE id=$ID sha=${SHA:0:12}..."
