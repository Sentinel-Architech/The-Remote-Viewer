#!/usr/bin/env bash
# Continuous validator beacon emit — local process, optional Termux wake lock
# See docs/public/BEACON.md
set -euo pipefail

BEACON_DIR="${TRV_BEACON_DIR:-$HOME/trv-beacon}"
INTERVAL="${TRV_BEACON_INTERVAL:-300}"
VALIDATOR="${TRV_VALIDATOR_ID:-}"
KEY="${TRV_BEACON_KEY:-$BEACON_DIR/validator.pem}"
LOG="$BEACON_DIR/loop.log"
PIDFILE="$BEACON_DIR/loop.pid"
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
EMIT="$ROOT/modules/beacon/emit.sh"

if [[ -z "$VALIDATOR" ]]; then
  echo "error: set TRV_VALIDATOR_ID" >&2
  exit 1
fi
if [[ ! -f "$KEY" ]]; then
  echo "error: key not found: $KEY" >&2
  exit 1
fi
if [[ ! -f "$EMIT" ]]; then
  echo "error: emit.sh not found at $EMIT" >&2
  exit 1
fi

mkdir -p "$BEACON_DIR"
chmod 700 "$BEACON_DIR" 2>/dev/null || true

if [[ -f "$PIDFILE" ]]; then
  old=$(cat "$PIDFILE" 2>/dev/null || true)
  if [[ -n "$old" ]] && kill -0 "$old" 2>/dev/null; then
    echo "error: loop already running pid=$old" >&2
    exit 1
  fi
  rm -f "$PIDFILE"
fi

echo $$ > "$PIDFILE"

WAKE=0
if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock && WAKE=1 || true
fi

cleanup() {
  [[ "$WAKE" -eq 1 ]] && termux-wake-unlock 2>/dev/null || true
  rm -f "$PIDFILE"
}
trap cleanup EXIT INT TERM

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) start interval=${INTERVAL}s validator=$VALIDATOR" | tee -a "$LOG"

while true; do
  if bash "$EMIT" --validator "$VALIDATOR" --key "$KEY" --once >>"$LOG" 2>&1; then
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) emit ok" >>"$LOG"
  else
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) emit FAIL" >>"$LOG"
  fi
  sleep "$INTERVAL"
done
