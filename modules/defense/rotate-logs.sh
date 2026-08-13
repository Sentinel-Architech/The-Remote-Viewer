#!/usr/bin/env bash
# Local log rotation for Hydra (no external tools required)
# - defense.log : size-based, keep last 3
# - incidents/events.jsonl : archive when large, start fresh chain
set -euo pipefail

BASE="${HOME}/.local/share/remote-viewer"
DEF="${BASE}/defense"
LOG="${BASE}/defense.log"
INC_DIR="${DEF}/incidents"
INC_FILE="${INC_DIR}/events.jsonl"
ARCHIVE_DIR="${INC_DIR}/archive"

mkdir -p "$DEF" "$INC_DIR" "$ARCHIVE_DIR"
chmod 700 "$DEF" "$INC_DIR" "$ARCHIVE_DIR" 2>/dev/null || true

# --- plain defense.log ---
MAX_LOG_BYTES=$((512 * 1024))   # 512 KB
KEEP=3

if [[ -f "$LOG" ]]; then
  SIZE=$(stat -c '%s' "$LOG" 2>/dev/null || stat -f '%z' "$LOG" 2>/dev/null || echo 0)
  if [[ "$SIZE" -gt "$MAX_LOG_BYTES" ]]; then
    # shift existing rotations
    for i in $(seq $((KEEP-1)) -1 1); do
      if [[ -f "${LOG}.$i" ]]; then
        mv "${LOG}.$i" "${LOG}.$((i+1))"
      fi
    done
    mv "$LOG" "${LOG}.1"
    : > "$LOG"
    chmod 600 "$LOG" 2>/dev/null || true
    echo "[$(date -Iseconds)] rotated defense.log (size was $SIZE)" >> "$LOG"
  fi
fi

# --- hash-chained incidents ---
MAX_INC_LINES=150
MAX_INC_BYTES=$((100 * 1024))   # 100 KB

if [[ -f "$INC_FILE" ]] && [[ -s "$INC_FILE" ]]; then
  LINES=$(wc -l < "$INC_FILE" | tr -d ' ')
  SIZE=$(stat -c '%s' "$INC_FILE" 2>/dev/null || stat -f '%z' "$INC_FILE" 2>/dev/null || echo 0)

  if [[ "$LINES" -gt "$MAX_INC_LINES" ]] || [[ "$SIZE" -gt "$MAX_INC_BYTES" ]]; then
    TS=$(date -u +%Y%m%dT%H%M%SZ)
    ARCHIVE="${ARCHIVE_DIR}/${TS}.jsonl"
    mv "$INC_FILE" "$ARCHIVE"
    chmod 600 "$ARCHIVE" 2>/dev/null || true

    # Start a new chain. Record the rotation itself as the first event.
    if [[ -f "$(dirname "$0")/record-incident.sh" ]]; then
      bash "$(dirname "$0")/record-incident.sh" \
        "rotation" \
        "incidents" \
        "archived previous chain to ${TS}.jsonl (lines=$LINES size=$SIZE)" || true
    else
      # Fallback: create a minimal genesis if recorder is missing
      echo '{"id":"genesis-rotation","ts":"'$(date -Iseconds)'","kind":"rotation","heads":"incidents","details":"new chain after archive","prev":"genesis","sha":"manual"}' > "$INC_FILE"
      chmod 600 "$INC_FILE" 2>/dev/null || true
    fi

    echo "[$(date -Iseconds)] archived incidents to $ARCHIVE and started new chain" >> "$LOG"
  fi
fi

echo "rotation check complete"
