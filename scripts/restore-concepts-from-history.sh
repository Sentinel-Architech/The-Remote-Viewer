#!/usr/bin/env bash
# restore-concepts-from-history.sh
# Restores full original concept docs from pre-cleanup git history.
#
# Usage:
#   chmod +x scripts/restore-concepts-from-history.sh
#   ./scripts/restore-concepts-from-history.sh
#
# Requires: git, checkout of feature/cleanup-structure (or any branch with docs/concepts/)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: not a git repository" >&2
  exit 2
fi

# Commit that still had the full root-level concept files
RESTORE_COMMIT="${RESTORE_COMMIT:-a7947635668eacc57ae40b76bf350e14586bf246}"

if ! git cat-file -e "${RESTORE_COMMIT}^{commit}" 2>/dev/null; then
  echo "Fetching history so ${RESTORE_COMMIT} is available..."
  git fetch origin --unshallow 2>/dev/null || git fetch origin
fi

if ! git cat-file -e "${RESTORE_COMMIT}^{commit}" 2>/dev/null; then
  echo "ERROR: commit ${RESTORE_COMMIT} not found. Run: git fetch origin" >&2
  exit 1
fi

mkdir -p docs/concepts

declare -A MAP=(
  ["Edge Learning"]="docs/concepts/edge-learning.md"
  ["Sentinel Paradigm"]="docs/concepts/sentinel-paradigm.md"
  ["TRV"]="docs/concepts/trv.md"
  ["presence-based"]="docs/concepts/presence-based.md"
  ["In-app shop"]="docs/concepts/in-app-shop.md"
  ["governance smart contract"]="docs/concepts/governance-smart-contract.md"
  ["Smart Contract"]="docs/concepts/smart-contract.md"
  ["P2P Comm"]="docs/concepts/p2p-comm.md"
  ["zero-Trust"]="docs/concepts/zero-trust.md"
  ["Self Heal"]="docs/concepts/self-heal.md"
)

echo "Restoring from ${RESTORE_COMMIT}"
echo

restored=0
failed=0

for src in "${!MAP[@]}"; do
  dest="${MAP[$src]}"
  if git cat-file -e "${RESTORE_COMMIT}:${src}" 2>/dev/null; then
    git show "${RESTORE_COMMIT}:${src}" > "$dest"
    bytes=$(wc -c < "$dest" | tr -d ' ')
    echo "  [ok]  $src  →  $dest  (${bytes} bytes)"
    ((restored++)) || true
  else
    echo "  [miss] ${RESTORE_COMMIT}:${src}" >&2
    ((failed++)) || true
  fi
done

echo
echo "Restored: $restored  Failed: $failed"
echo
echo "Next:"
echo "  git add docs/concepts/"
echo "  git commit -m 'docs: restore full concept content from pre-cleanup history'"
echo "  git push origin HEAD"

exit "$(( failed > 0 ? 3 : 0 ))"
