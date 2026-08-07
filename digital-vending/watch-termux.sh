#!/usr/bin/env bash
# Termux-friendly sales watcher wrapper — free, phone-only.
# Lighter polling, $HOME state, optional wake-lock + notification.
#
# Usage:
#   export SALES_ADDRESS='your-solana-address'
#   bash watch-termux.sh
#
# Optional env:
#   POLL_SECONDS=90          (default 90 on Termux; watcher default was 45)
#   TERMUX_WAKE_LOCK=1       (default 1 — hold CPU while script runs)
#   TERMUX_NOTIFY=1          (default 1 — toast on new sale if termux-api installed)
#   SOLANA_RPC_URL=...       (optional private/public RPC)

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -z "${SALES_ADDRESS:-}" ]]; then
  echo "ERROR: export SALES_ADDRESS='your-public-solana-address' first" >&2
  exit 1
fi

# Sanitize (paste noise)
export SALES_ADDRESS
SALES_ADDRESS="$(printf '%s' "$SALES_ADDRESS" | tr -d '[:space:]')"
export SALES_ADDRESS

export DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
export STATE_FILE="${STATE_FILE:-$DELIVER_DIR/last-sig}"
export POLL_SECONDS="${POLL_SECONDS:-90}"
export RPC_RETRIES="${RPC_RETRIES:-2}"
export RPC_RETRY_DELAY_SEC="${RPC_RETRY_DELAY_SEC:-3}"
export CIRCUIT_FAILURE_THRESHOLD="${CIRCUIT_FAILURE_THRESHOLD:-4}"
export CIRCUIT_COOLDOWN_SECONDS="${CIRCUIT_COOLDOWN_SECONDS:-180}"
export MAX_TRANSIENT_RETRIES="${MAX_TRANSIENT_RETRIES:-3}"
# Single public endpoint unless user overrides — fewer flaky demos
export SOLANA_RPC_URLS="${SOLANA_RPC_URLS:-${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}}"

TERMUX_WAKE_LOCK="${TERMUX_WAKE_LOCK:-1}"
TERMUX_NOTIFY="${TERMUX_NOTIFY:-1}"

mkdir -p "$DELIVER_DIR"

release_wake() {
  if [[ "$TERMUX_WAKE_LOCK" == "1" ]] && command -v termux-wake-unlock >/dev/null 2>&1; then
    termux-wake-unlock 2>/dev/null || true
    echo "[termux] wake-lock released" >&2
  fi
}
trap release_wake EXIT INT TERM

if [[ "$TERMUX_WAKE_LOCK" == "1" ]] && command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock
  echo "[termux] wake-lock acquired (disable: TERMUX_WAKE_LOCK=0)" >&2
elif [[ "$TERMUX_WAKE_LOCK" == "1" ]]; then
  echo "[termux] termux-wake-lock not found — pkg install termux-api (optional)" >&2
fi

notify_sale() {
  local msg="$1"
  if [[ "$TERMUX_NOTIFY" == "1" ]] && command -v termux-notification >/dev/null 2>&1; then
    termux-notification -t "TRV sale" -c "$msg" --priority high 2>/dev/null || true
  fi
  if [[ "$TERMUX_NOTIFY" == "1" ]] && command -v termux-toast >/dev/null 2>&1; then
    termux-toast "TRV: $msg" 2>/dev/null || true
  fi
}

# Hook: poll sales.log mtime in background while watcher runs
LOG="${SALES_LOG:-$DELIVER_DIR/sales.log}"
touch "$LOG"
LAST_LOG_SIZE=$(wc -c < "$LOG" 2>/dev/null | tr -d ' ' || echo 0)

monitor_log() {
  while true; do
    sleep 20
    [[ -f "$LOG" ]] || continue
    sz=$(wc -c < "$LOG" 2>/dev/null | tr -d ' ' || echo 0)
    if [[ "$sz" -gt "$LAST_LOG_SIZE" ]]; then
      line=$(tail -n 1 "$LOG" 2>/dev/null || true)
      notify_sale "${line:0:80}"
      LAST_LOG_SIZE=$sz
    fi
  done
}

if [[ "$TERMUX_NOTIFY" == "1" ]]; then
  monitor_log &
  MON_PID=$!
  trap 'kill $MON_PID 2>/dev/null; release_wake' EXIT INT TERM
fi

echo "════════════════════════════════════════"
echo " TRV Termux watcher wrapper"
echo " Address : $SALES_ADDRESS"
echo " Poll    : ${POLL_SECONDS}s"
echo " Deliver : $DELIVER_DIR"
echo " Wake    : $TERMUX_WAKE_LOCK  Notify: $TERMUX_NOTIFY"
echo "════════════════════════════════════════"
echo "Phone sleep can still kill Termux — this is best-effort, not a VPS."
echo

exec bash "$ROOT/watch-sales-notify-v2.sh"
