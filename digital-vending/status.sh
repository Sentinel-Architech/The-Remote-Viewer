#!/usr/bin/env bash
# Inventory delivery chute state under $HOME (no network).
set -euo pipefail

DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"
mkdir -p "$DELIVER_DIR"

echo "=== TRV vending status ==="
echo "DELIVER_DIR=$DELIVER_DIR"
echo

n_pending=$(find "$DELIVER_DIR" -maxdepth 1 -name '*.PENDING' 2>/dev/null | wc -l | tr -d ' ')
n_trvl=$(find "$DELIVER_DIR" -maxdepth 1 -name '*.trvl' 2>/dev/null | wc -l | tr -d ' ')
n_recip=$(find "$DELIVER_DIR" -maxdepth 1 -name '*.recipient' 2>/dev/null | wc -l | tr -d ' ')
n_dm=$(find "$DELIVER_DIR" -maxdepth 1 -name '*_dm.txt' 2>/dev/null | wc -l | tr -d ' ')

echo "PENDING markers : $n_pending"
echo "Frame packs     : $n_trvl"
echo "Recipient drops : $n_recip"
echo "DM notes        : $n_dm"
echo

if [[ -f "$DELIVER_DIR/.circuit-rpc" ]]; then
  echo "--- circuit ---"
  cat "$DELIVER_DIR/.circuit-rpc"
  echo
fi

if [[ "$n_pending" != "0" ]]; then
  echo "--- PENDING ---"
  for f in "$DELIVER_DIR"/*.PENDING; do
    [[ -f "$f" ]] || continue
    echo "* $(basename "$f")"
    sed 's/^/  /' "$f"
    echo
  done
fi

if [[ "$n_trvl" != "0" ]]; then
  echo "--- frames ---"
  ls -la "$DELIVER_DIR"/*.trvl 2>/dev/null | sed 's/^/  /' || true
fi
