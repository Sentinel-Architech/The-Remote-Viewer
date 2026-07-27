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
# Exit codes:
#   0  success (or dry-run completed)
#   1  usage / argument error
#   2  not inside a git repository (when --apply)
#   3  one or more move failures

set -euo pipefail

# ---------- helpers ----------
log()  { printf '%s\n' "$*"; }
err()  { printf 'ERROR: %s\n' "$*" >&2; }
die()  { err "$*"; exit "${2:-1}"; }

# ---------- argument parsing ----------
APPLY=false
case "${1:-}" in
  "")          APPLY=false ;;
  --apply)     APPLY=true  ;;
  -h|--help)
    cat <<'EOF'
Usage: ./scripts/rename-concepts.sh [--apply]

  (no args)   Dry-run: print planned moves only
  --apply     Perform the moves (git mv preferred, falls back to mv)
  -h, --help  Show this help

Safe defaults: never overwrites existing targets, skips missing sources.
EOF
    exit 0
    ;;
  *)
    die "Unknown argument: $1  (use --help)" 1
    ;;
esac

# ---------- map (source -> kebab name without .md) ----------
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

# ---------- paths ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$ROOT/docs/concepts"

if [[ ! -d "$ROOT" ]]; then
  die "Cannot resolve repository root from $SCRIPT_DIR" 1
fi

# When applying, insist we are inside a git work tree
if [[ $APPLY == true ]]; then
  if ! git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    die "Not inside a git repository. Refuse to --apply." 2
  fi
fi

# Ensure target directory exists (create only when applying)
if [[ $APPLY == true ]]; then
  if ! mkdir -p "$TARGET_DIR"; then
    die "Failed to create $TARGET_DIR" 3
  fi
else
  # Dry-run still needs the path for display; create if missing is harmless
  mkdir -p "$TARGET_DIR" 2>/dev/null || true
fi

log "Root:       $ROOT"
log "Target dir: $TARGET_DIR"
log "Mode:       $([[ $APPLY == true ]] && echo APPLY || echo DRY-RUN)"
log ""

# ---------- counters ----------
moved=0
skipped=0
missing=0
failed=0

# ---------- main loop ----------
for src in "${!MAP[@]}"; do
  dest_name="${MAP[$src]}.md"
  src_path="$ROOT/$src"
  dest_path="$TARGET_DIR/$dest_name"

  # Source missing
  if [[ ! -e "$src_path" ]]; then
    log "  [missing]  $src"
    ((missing++)) || true
    continue
  fi

  # Source is a directory (unexpected) — refuse
  if [[ -d "$src_path" ]]; then
    err "  [refuse]   $src is a directory (expected a file)"
    ((failed++)) || true
    continue
  fi

  # Target already exists
  if [[ -e "$dest_path" ]]; then
    log "  [skip]     $src  →  docs/concepts/$dest_name  (already exists)"
    ((skipped++)) || true
    continue
  fi

  if [[ $APPLY == true ]]; then
    # Prefer git mv so history is preserved; fall back to plain mv
    if git -C "$ROOT" mv -- "$src_path" "$dest_path" 2>/dev/null; then
      log "  [moved]    $src  →  docs/concepts/$dest_name  (git mv)"
      ((moved++)) || true
    elif mv -- "$src_path" "$dest_path" 2>/dev/null; then
      log "  [moved]    $src  →  docs/concepts/$dest_name  (mv — not tracked by git yet)"
      # Stage the new file so the user can commit easily
      git -C "$ROOT" add -- "$dest_path" 2>/dev/null || true
      ((moved++)) || true
    else
      err "  [FAILED]   $src  →  docs/concepts/$dest_name"
      ((failed++)) || true
    fi
  else
    log "  [would]    $src  →  docs/concepts/$dest_name"
    ((moved++)) || true
  fi
done

# ---------- summary ----------
log ""
log "Summary: $moved moved/planned, $skipped skipped, $missing missing, $failed failed"

if [[ $APPLY == false ]]; then
  log ""
  log "Re-run with --apply to perform the moves:"
  log "  ./scripts/rename-concepts.sh --apply"
fi

if [[ $failed -gt 0 ]]; then
  err "$failed file(s) failed to move."
  exit 3
fi

exit 0
