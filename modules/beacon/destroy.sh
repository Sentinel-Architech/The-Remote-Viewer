#!/usr/bin/env bash
# Destroy = Restart for validator beacon keys and local beacon state
# See docs/public/BEACON.md and locked key-loss model
set -euo pipefail

BEACON_DIR="${TRV_BEACON_DIR:-$HOME/trv-beacon}"

usage() {
  cat <<EOF
Usage: bash modules/beacon/destroy.sh [--yes]

Wipes local validator beacon material under:
  $BEACON_DIR

This is Destroy = Restart for the validator role on this device.
After destroy you must generate a new keypair and, if you were published,
publish a new list entry (new pubkey) under a new or same id per VALIDATOR-LIST.md.

Requires --yes to proceed.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "${1:-}" != "--yes" ]]; then
  echo "Refusing to destroy without --yes"
  usage
  exit 1
fi

if [[ ! -d "$BEACON_DIR" ]]; then
  echo "==> no beacon dir at $BEACON_DIR — nothing to destroy"
  exit 0
fi

echo "==> Destroy = Restart (validator beacon)"
rm -f \
  "$BEACON_DIR/validator.pem" \
  "$BEACON_DIR/validator.pub" \
  "$BEACON_DIR/latest" \
  "$BEACON_DIR/state" \
  "$BEACON_DIR/history.log" 2>/dev/null || true

# Remove empty dir if possible
rmdir "$BEACON_DIR" 2>/dev/null || true

echo "==> wiped validator key material and local beacon state"
echo "==> generate a new keypair before emitting again"
echo "    openssl genpkey -algorithm ed25519 -out \$HOME/trv-beacon/validator.pem"
