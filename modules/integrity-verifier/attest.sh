#!/usr/bin/env bash
# Integrity Verifier — run checks + emit local attestation (optical-transferable)
# Locked role: docs/locked/17-Validator-Node-First-Role.md
# No private keys required. No network required for validity.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IV="${ROOT}/modules/integrity-verifier"
OUT_DIR="${HOME}/.local/share/remote-viewer/integrity-verifier/attestations"
mkdir -p "$OUT_DIR"
chmod 700 "${HOME}/.local/share/remote-viewer/integrity-verifier" 2>/dev/null || true

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ID=$(date +%Y%m%dT%H%M%S)
HOST=$(uname -n 2>/dev/null || echo unknown)

# Capture contribution result without aborting whole script on fail
CONTRIB_OUT=$(bash "${IV}/verify-contribution.sh" 2>&1) || true
CONTRIB_OK=$(printf '%s\n' "$CONTRIB_OUT" | sed -n 's/^CONTRIB_OK=\([0-9]*\).*/\1/p' | tail -1)
CONTRIB_EVENTS=$(printf '%s\n' "$CONTRIB_OUT" | sed -n 's/^CONTRIB_EVENTS=\([0-9]*\).*/\1/p' | tail -1)
CONTRIB_TIP=$(printf '%s\n' "$CONTRIB_OUT" | sed -n 's/^CONTRIB_TIP=\(.*\)/\1/p' | tail -1)
CONTRIB_OK="${CONTRIB_OK:-0}"
CONTRIB_EVENTS="${CONTRIB_EVENTS:-0}"
CONTRIB_TIP="${CONTRIB_TIP:-}"

SALES_OUT=$(bash "${IV}/verify-sales.sh" 2>&1) || true
SALES_OK=$(printf '%s\n' "$SALES_OUT" | sed -n 's/^SALES_OK=\([0-9]*\).*/\1/p' | tail -1)
SALES_LINES=$(printf '%s\n' "$SALES_OUT" | sed -n 's/^SALES_LINES=\([0-9]*\).*/\1/p' | tail -1)
SALES_FAILS=$(printf '%s\n' "$SALES_OUT" | sed -n 's/^SALES_FAILS=\([0-9]*\).*/\1/p' | tail -1)
SALES_OK="${SALES_OK:-0}"
SALES_LINES="${SALES_LINES:-0}"
SALES_FAILS="${SALES_FAILS:-0}"

OVERALL=0
if [[ "$CONTRIB_OK" == "1" && "$SALES_OK" == "1" ]]; then
  OVERALL=1
fi

# Optional public recipient hint only (never secret)
RECIP=""
if [[ -f "$HOME/vault-recipient.txt" ]]; then
  RECIP=$(tr -d '\n\r' < "$HOME/vault-recipient.txt" | head -c 120)
fi

BODY=$(printf '{"type":"integrity_verifier_attestation","version":1,"role":"Contribution+SalesIntegrityVerifier","ts":"%s","host":"%s","overall_ok":%s,"contribution":{"ok":%s,"events":%s,"tip_sha":"%s"},"sales":{"ok":%s,"lines":%s,"fails":%s},"recipient_hint":"%s","statement":"Local integrity attestation. Not a mint. Not custody. Not a chain transaction. Transfer by file or optical path."}' \
  "$TS" "$HOST" "$OVERALL" \
  "$CONTRIB_OK" "$CONTRIB_EVENTS" "$CONTRIB_TIP" \
  "$SALES_OK" "$SALES_LINES" "$SALES_FAILS" \
  "$RECIP")

if command -v sha256sum >/dev/null 2>&1; then
  COMMIT=$(printf '%s' "$BODY" | sha256sum | awk '{print $1}')
elif command -v shasum >/dev/null 2>&1; then
  COMMIT=$(printf '%s' "$BODY" | shasum -a 256 | awk '{print $1}')
else
  COMMIT="unavailable"
fi

OUT="${OUT_DIR}/attest-${ID}.json"
# Insert commit field before final }
printf '%s,"commit":"%s"}\n' "${BODY%\}"" "$COMMIT" > "$OUT"
chmod 600 "$OUT" 2>/dev/null || true

echo "=== Attestation ==="
echo "overall_ok=$OVERALL"
echo "contribution_ok=$CONTRIB_OK events=$CONTRIB_EVENTS"
echo "sales_ok=$SALES_OK lines=$SALES_LINES fails=$SALES_FAILS"
echo "commit=$COMMIT"
echo "written: $OUT"
echo
echo "Transfer this file by copy or optical path. No live network required for validity."

if [[ "$OVERALL" -eq 1 ]]; then
  exit 0
fi
exit 1
