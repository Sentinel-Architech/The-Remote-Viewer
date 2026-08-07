#!/usr/bin/env bash
# Seller station helpers — Pixel / any open-stack host.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DELIVER_DIR="${DELIVER_DIR:-$HOME/trv-deliver}"

usage() {
  echo "Usage: $0 list|status|deliver <catalog-id> <age1-recipient> [outfile]" >&2
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
    ;;
  deliver)
    id="${2:-}"; recip="${3:-}"; out="${4:-$DELIVER_DIR/${id}-$(date +%Y%m%d%H%M).trvl}"
    [[ -n "$id" && -n "$recip" ]] || usage
    mkdir -p "$DELIVER_DIR"
    "$ROOT/seller-deliver.sh" "$id" "$recip" > "$out"
    echo "Wrote $out ($(wc -l < "$out") lines)" >&2
    echo "$out"
    ;;
  *)
    usage
    ;;
esac
