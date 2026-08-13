#!/usr/bin/env bash
# Collect published tips and derive distinct identity-path count
# Tips directory can be local or a folder of received tips.
set -euo pipefail

TIPS_DIR="${1:-$HOME/.local/share/remote-viewer/nodes/tips}"

echo "=== Validated Node Tip Collection ==="
echo "tips_dir: $TIPS_DIR"
echo

if [[ ! -d "$TIPS_DIR" ]]; then
  echo "No tips directory found."
  echo "Operators publish tips with: bash modules/nodes/publish-tip.sh"
  echo "Then place received tips into this directory (or pass a path)."
  exit 0
fi

COUNT=0
DECLARED=0

# Count distinct recipient_hint values from valid tips that also show IV ok
declare -A SEEN 2>/dev/null || SEEN_FALLBACK=1

for f in "$TIPS_DIR"/tip-*.json; do
  [[ -f "$f" ]] || continue
  DECLARED=$((DECLARED + 1))
  IV=$(grep -o '"integrity_verifier_ok": [01]' "$f" | head -1 | awk '{print $2}' || echo 0)
  if [[ "$IV" != "1" ]]; then
    continue
  fi
  HINT=$(grep -o '"recipient_hint": "[^"]*"' "$f" | head -1 | cut -d'"' -f4 || echo "")
  KEY="${HINT:-$(basename "$f")}"
  if [[ -z "${SEEN_FALLBACK:-}" ]]; then
    if [[ -z "${SEEN[$KEY]:-}" ]]; then
      SEEN[$KEY]=1
      COUNT=$((COUNT + 1))
    fi
  else
    # Fallback without associative arrays: simple increment (may over-count if same hint repeats)
    COUNT=$((COUNT + 1))
  fi
done

echo "tips examined: $DECLARED"
echo "distinct identity paths with IV ok: $COUNT"
echo
echo "This count is derived only from tips present in $TIPS_DIR."
echo "It is not a global live network claim. Anyone can re-run with the same tips."
exit 0
