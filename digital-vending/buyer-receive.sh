#!/usr/bin/env bash
# buyer-receive.sh — Peel LT frames + decrypt with local identity
# Usage:
#   ./buyer-receive.sh <identity-file> < frames.trvl
#   or: cat frames.trvl | ./buyer-receive.sh $HOME/vault-identity.txt

set -euo pipefail

ID_FILE="${1:-}"
if [[ -z "$ID_FILE" || ! -f "$ID_FILE" ]]; then
  echo "Usage: $0 <age-identity-file>  < frames.trvl" >&2
  exit 1
fi

TRV_BIN="${TRV_BIN:-$(command -v trv-optical || echo "")}"
if [[ -z "$TRV_BIN" ]]; then
  if [[ -d "$HOME/The-Remote-Viewer/optical-airgap/rust" ]]; then
    TRV_BIN="cargo run --quiet --manifest-path $HOME/The-Remote-Viewer/optical-airgap/rust/Cargo.toml --bin trv-optical --"
  else
    echo "ERROR: trv-optical not found" >&2
    exit 1
  fi
fi

TMP_CT=$(mktemp)
trap 'rm -f "$TMP_CT"' EXIT

# Peel
$TRV_BIN frame-peel > "$TMP_CT"
echo "[peel] ciphertext recovered ($(wc -c < "$TMP_CT") bytes)" >&2

# Decrypt
$TRV_BIN decrypt "$ID_FILE" < "$TMP_CT"
echo "[decrypt] plaintext above" >&2
