#!/usr/bin/env bash
# rename-concepts.sh
# Moves remaining root-level concept/design files into docs/concepts/
# with clean kebab-case Markdown names.
#
# Usage:
#   chmod +x scripts/rename-concepts.sh
#   ./scripts/rename-concepts.sh          # dry-run (prints planned moves)
#   ./scripts/rename-concepts.sh --apply  # actually move the files
#
# Safe: never overwrites existing targets. Skips missing source files.

set -euo pipefail

APPLY=false
if [[ "${1:-}" == "--apply" ]]; then
  APPLY=true
fi

# source_name -> target_kebab_name (without .md)
declare -A MAP=(
  ["DApp"]="dapp"
  ["DApp Development"]="dapp-development"
  ["DApp Frontend"]="dapp-frontend"
  ["Data Minimization System"]="data-minimization-system"
  ["Data Portability"]="data-portability"
  ["Data loss Prevention"]="data-loss-prevention"
  ["DePIN Flywheel"]="depin-flywheel"
  ["Edge Learning"]="edge-learning"
  ["Education Framework"]="education-framework"
  ["Hyper"]="hyper"
  ["Hyper protocol"]="hyper-protocol"
  ["In-app shop"]="in-app-shop"
  ["Legal Gap Analysis"]="legal-gap-analysis"
  ["Network Security"]="network-security"
  ["New Infrastructure"]="new-infrastructure"
  ["P2P Comm"]="p2p-comm"
  ["Policy Overview"]="policy-overview"
  ["Project Structure"]="project-structure"
  ["Self Heal"]="self-heal"
  ["Sentinel Paradigm"]="sentinel-paradigm"
  ["Slh-dsa"]="slh-dsa"
  ["Smart Contract"]="smart-contract"
  ["TOKENOMICS.md"]="tokenomics"
  ["TRV"]="trv"
  ["Threat Detection"]="threat-detection"
  ["Tree Structure"]="tree-structure"
  ["UI master"]="ui-master"
  ["Zk-STARKs"]="zk-starks"
  ["governance smart contract"]="governance-smart-contract"
  ["presence-based"]="presence-based"
  ["zero-Trust"]="zero-trust"
)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$ROOT/docs/concepts"

mkdir -p "$TARGET_DIR"

echo "Root:       $ROOT"
echo "Target dir: $TARGET_DIR"
echo "Mode:       $([[ $APPLY == true ]] && echo APPLY || echo DRY-RUN)"
echo

moved=0
skipped=0
missing=0

for src in "${!MAP[@]}"; do
  dest_name="${MAP[$src]}.md"
  src_path="$ROOT/$src"
  dest_path="$TARGET_DIR/$dest_name"

  if [[ ! -e "$src_path" ]]; then
    echo "  [missing]  $src"
    ((missing++)) || true
    continue
  fi

  if [[ -e "$dest_path" ]]; then
    echo "  [skip]     $src  →  docs/concepts/$dest_name  (already exists)"
    ((skipped++)) || true
    continue
  fi

  if [[ $APPLY == true ]]; then
    # Preserve content; just move + ensure .md extension
    git mv "$src_path" "$dest_path" 2>/dev/null || mv "$src_path" "$dest_path"
    echo "  [moved]    $src  →  docs/concepts/$dest_name"
  else
    echo "  [would]    $src  →  docs/concepts/$dest_name"
  fi
  ((moved++)) || true
done

echo
echo "Summary: $moved to move, $skipped skipped, $missing missing"
if [[ $APPLY == false ]]; then
  echo
  echo "Re-run with --apply to perform the moves:"
  echo "  ./scripts/rename-concepts.sh --apply"
fi
