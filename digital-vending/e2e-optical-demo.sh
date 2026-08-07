#!/usr/bin/env bash
# P3-C dry run: catalog item → age → Soliton LT → peel → decrypt
# All files under $HOME. Demo keys only — Destroy after.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
ID="${1:-hello-sentinel-demo}"
RECIP_FILE="${VAULT_RECIPIENT:-$HOME/vend-demo-recip.txt}"
ID_FILE="${VAULT_IDENTITY:-$HOME/vend-demo-id.txt}"
FRAMES="${FRAMES_OUT:-$HOME/vend-frames.trvl}"

if [[ ! -d "$REPO/optical-airgap/rust" ]]; then
  echo "error: missing $REPO/optical-airgap/rust — set TRV_ROOT" >&2
  exit 1
fi

echo "==> demo Vault (throwaway)" >&2
if [[ ! -f "$ID_FILE" ]]; then
  (cd "$REPO/optical-airgap/rust" && cargo run --quiet --bin trv-optical -- keygen 2> "$ID_FILE" | tee "$RECIP_FILE" >/dev/null)
  chmod 600 "$ID_FILE"
fi
RECIP=$(tr -d '\r\n' < "$RECIP_FILE")

echo "==> seller-deliver $ID" >&2
"$ROOT/seller-deliver.sh" "$ID" "$RECIP" > "$FRAMES"
echo "==> frames → $FRAMES ($(wc -l < "$FRAMES") lines)" >&2

echo "==> buyer-receive" >&2
"$ROOT/buyer-receive.sh" "$ID_FILE" < "$FRAMES"

echo >&2
echo "==> optical path (optional):" >&2
echo "  python -m http.server 8765  # in optical-airgap/optical" >&2
echo "  open qr-receiver.html → paste $FRAMES → Ingest" >&2
echo "  then: cargo run --bin trv-optical -- decrypt $ID_FILE < peeled-ct" >&2
echo "==> Destroy demo keys when done:" >&2
echo "  rm -f $ID_FILE $RECIP_FILE $FRAMES" >&2
