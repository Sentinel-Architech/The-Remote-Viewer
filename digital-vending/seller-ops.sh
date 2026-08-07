#!/usr/bin/env bash
# Seller station helpers — Pixel / any open-stack host.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRV_ROOT="$(cd "$ROOT/.." && pwd)"
DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"

usage() {
  echo "Usage: $0 list|status|log|deliver <catalog-id> <age1-recipient> [outfile]" >&2
  exit 1
}

cmd="${1:-}"
case "$cmd" in
  list)
    if command -v jq >/dev/null 2>&1; then
      jq -r '.[] | "\(.id)\t\(.price)\t\(.title)"' "$ROOT/catalog.json"
    else
      grep -E '"id"|"title"|"price"' "$ROOT/catalog.json" | sed 's/[," ]//g'
    fi
    ;;
  status)
    bash "$ROOT/status.sh"
    if [[ -f "${SALES_LOG:-$DELIVER_DIR/sales.log}" ]]; then
      echo
      echo "--- sales.log (last 10) ---"
      tail -n 10 "${SALES_LOG:-$DELIVER_DIR/sales.log}"
    fi
    if [[ -f "$HOME/.local/share/remote-viewer/defense/QUARANTINE" ]]; then
      echo
      echo "--- HYDRA QUARANTINE ACTIVE ---"
      cat "$HOME/.local/share/remote-viewer/defense/QUARANTINE"
    fi
    ;;
  log)
    f="${SALES_LOG:-$DELIVER_DIR/sales.log}"
    if [[ -f "$f" ]]; then cat "$f"; else echo "(no sales.log yet)"; fi
    ;;
  deliver)
    id="${2:-}"; recip="${3:-}"; out="${4:-$DELIVER_DIR/${id}-$(date +%Y%m%d%H%M).trvl}"
    [[ -n "$id" && -n "$recip" ]] || usage
    if [[ -f "$TRV_ROOT/modules/defense/hydra-gate.sh" ]]; then
      set +e
      bash "$TRV_ROOT/modules/defense/hydra-gate.sh"
      gate_rc=$?
      set -e
      if [[ $gate_rc -ne 0 ]]; then
        echo "ERROR: Hydra gate blocked deliver (rc=$gate_rc)" >&2
        exit 11
      fi
    fi
    mkdir -p "$DELIVER_DIR"
    set +e
    "$ROOT/seller-deliver.sh" "$id" "$recip" > "$out"
    rc=$?
    set -e
    if [[ $rc -ne 0 ]]; then
      echo "ERROR: seller-deliver failed (exit $rc)" >&2
      rm -f "$out"
      exit "$rc"
    fi
    if [[ ! -s "$out" ]]; then
      echo "ERROR: frames output is empty: $out" >&2
      echo "ERROR: not logging — check trv-optical / payload / recipient" >&2
      rm -f "$out"
      exit 3
    fi
    echo "Wrote $out ($(wc -c < "$out" | tr -d ' ') bytes, $(wc -l < "$out" | tr -d ' ') lines)" >&2
    bash "$ROOT/log-sale.sh" "$id" "manual deliver" "$out"
    echo "$out"
    ;;
  *)
    usage
    ;;
esac
