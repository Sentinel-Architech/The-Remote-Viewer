#!/usr/bin/env bash
# TRV validator beacon emitter — local, offline
# Writes $HOME/trv-beacon/latest (and history)
# See docs/public/BEACON.md
set -euo pipefail

BEACON_DIR="${TRV_BEACON_DIR:-$HOME/trv-beacon}"
STATE="$BEACON_DIR/state"
LATEST="$BEACON_DIR/latest"
VALIDATOR="${TRV_VALIDATOR_ID:-}"
EPOCH="${TRV_BEACON_EPOCH:-1}"
INTERVAL="${TRV_BEACON_INTERVAL:-300}"

usage() {
  cat <<EOF
Usage: bash modules/beacon/emit.sh [--validator <id>] [--epoch <n>] [--once]

  --validator   Public identity (age1… / npub… / did:key:…). Or set TRV_VALIDATOR_ID.
  --epoch       Recognition epoch (default: 1 or TRV_BEACON_EPOCH).
  --once        Emit a single beacon and exit (default).
  --loop        Emit every TRV_BEACON_INTERVAL seconds (default 300).

Writes:
  $LATEST
  $BEACON_DIR/history.log

Signature: until Stage 1 signing is wired, sig=DEV-UNSIGNED.
Structure and liveness path are real. See docs/public/BEACON.md.
EOF
}

ONCE=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --validator) VALIDATOR="$2"; shift 2 ;;
    --epoch) EPOCH="$2"; shift 2 ;;
    --once) ONCE=1; shift ;;
    --loop) ONCE=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$VALIDATOR" ]]; then
  echo "error: set --validator or TRV_VALIDATOR_ID" >&2
  exit 1
fi

mkdir -p "$BEACON_DIR"
chmod 700 "$BEACON_DIR" 2>/dev/null || true

if [[ ! -f "$STATE" ]]; then
  echo "seq=0" > "$STATE"
fi

emit_one() {
  # shellcheck disable=SC1090
  source "$STATE"
  seq=$(( ${seq:-0} + 1 ))
  ts=$(date +%s)
  echo "seq=$seq" > "$STATE"

  # Canonical body (sig covers this form once real signing is wired)
  body="TRV-BEACON/1|validator=${VALIDATOR}|seq=${seq}|ts=${ts}|epoch=${EPOCH}"

  # DEV-UNSIGNED: honest placeholder until validator key tooling lands
  sig="DEV-UNSIGNED"

  {
    echo "TRV-BEACON/1"
    echo "validator=${VALIDATOR}"
    echo "seq=${seq}"
    echo "ts=${ts}"
    echo "epoch=${EPOCH}"
    echo "sig=${sig}"
  } > "$LATEST"

  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) seq=${seq} ts=${ts} epoch=${EPOCH}" >> "$BEACON_DIR/history.log"

  echo "==> beacon written: $LATEST"
  cat "$LATEST"
  echo
  echo "canonical: $body"
  echo "(sig=DEV-UNSIGNED — wire real signature in Stage 1)"
}

if [[ "$ONCE" -eq 1 ]]; then
  emit_one
  exit 0
fi

echo "==> looping every ${INTERVAL}s (Ctrl+C to stop)"
while true; do
  emit_one
  sleep "$INTERVAL"
done
