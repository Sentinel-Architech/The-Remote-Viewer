#!/data/data/com.termux/files/usr/bin/bash
# Offline "merkle tip": commit to current ledger tip sha + counts
# Not a full binary Merkle tree yet — tip hash of chained events is the commitment.
set -euo pipefail

DIR="${HOME}/.local/share/remote-viewer/contribution"
FILE="${DIR}/events.jsonl"
OUT_DIR="${DIR}/commitments"
mkdir -p "$OUT_DIR"

if [[ ! -f "$FILE" ]] || [[ ! -s "$FILE" ]]; then
  echo "FAIL: no events" >&2
  exit 1
fi

# Prefer verify before committing
if [[ -x "$(dirname "$0")/verify.sh" ]] || [[ -f "$(dirname "$0")/verify.sh" ]]; then
  if ! bash "$(dirname "$0")/verify.sh"; then
    echo "FAIL: chain verify failed — no commitment" >&2
    exit 1
  fi
fi

LAST=$(tail -n 1 "$FILE")
TIP=$(printf '%s' "$LAST" | sed -n 's/.*"sha":"\([^"]*\)".*/\1/p')
N=$(wc -l < "$FILE" | tr -d ' ')
TS=$(date -Iseconds)
ID=$(date +%Y%m%dT%H%M%S)

if [[ -z "$TIP" ]]; then
  echo "FAIL: tip sha missing (run Stage 2 records)" >&2
  exit 1
fi

# Body committed
BODY=$(printf '{"type":"ledger_tip","ts":"%s","event_count":%s,"tip_sha":"%s"}' "$TS" "$N" "$TIP")
if command -v sha256sum >/dev/null 2>&1; then
  COMMIT=$(printf '%s' "$BODY" | sha256sum | awk '{print $1}')
else
  COMMIT=$(printf '%s' "$BODY" | sha256 | awk '{print $1}')
fi

OUT="${OUT_DIR}/tip-${ID}.json"
printf '%s,"commit":"%s"}\n' "${BODY%\}"" "$COMMIT" > "$OUT"
chmod 600 "$OUT" 2>/dev/null || true

echo "Commitment written: $OUT"
echo "tip_sha=$TIP"
echo "commit=$COMMIT"
echo "events=$N"
