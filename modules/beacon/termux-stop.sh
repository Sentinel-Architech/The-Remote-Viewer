#!/usr/bin/env bash
# Stop continuous beacon loop
set -euo pipefail

BEACON_DIR="${TRV_BEACON_DIR:-$HOME/trv-beacon}"
PIDFILE="$BEACON_DIR/loop.pid"

if [[ ! -f "$PIDFILE" ]]; then
  echo "not running (no pidfile)"
  exit 0
fi

PID=$(cat "$PIDFILE")
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID" 2>/dev/null || true
  sleep 1
  kill -9 "$PID" 2>/dev/null || true
  echo "stopped pid=$PID"
else
  echo "stale pidfile (process not running)"
fi
rm -f "$PIDFILE"
command -v termux-wake-unlock >/dev/null 2>&1 && termux-wake-unlock 2>/dev/null || true
