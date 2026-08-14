#!/usr/bin/env bash
# Start continuous beacon in background (Termux-friendly)
set -euo pipefail

BEACON_DIR="${TRV_BEACON_DIR:-$HOME/trv-beacon}"
LOG="$BEACON_DIR/loop.log"
PIDFILE="$BEACON_DIR/loop.pid"
ROOT=$(cd "$(dirname "$0")/../.." && pwd)

if [[ -z "${TRV_VALIDATOR_ID:-}" ]]; then
  echo "error: export TRV_VALIDATOR_ID='age1…' first" >&2
  exit 1
fi

export TRV_BEACON_KEY="${TRV_BEACON_KEY:-$BEACON_DIR/validator.pem}"
export TRV_BEACON_INTERVAL="${TRV_BEACON_INTERVAL:-300}"

if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "already running pid=$(cat "$PIDFILE")"
  exit 0
fi

mkdir -p "$BEACON_DIR"
nohup bash "$ROOT/modules/beacon/run-loop.sh" >>"$LOG" 2>&1 &
echo "started pid=$! interval=${TRV_BEACON_INTERVAL}s log=$LOG"
echo "stop with: bash modules/beacon/termux-stop.sh"
