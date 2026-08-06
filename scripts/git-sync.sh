#!/data/data/com.termux/files/usr/bin/bash
# TRV local git sync — phone/Termux friendly
# Pulls latest for current (or pinned) branch. Never force-pushes. Never phones home beyond git remote.

set -euo pipefail

ROOT="${TRV_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  if ROOT="$(cd "$(dirname "$0")/.." && pwd 2>/dev/null)"; then
    :
  else
    ROOT="$HOME/The-Remote-Viewer"
  fi
fi

BRANCH_ARG="${1:-}"
ALLOW_DIRTY=0
DO_PUSH=0

for a in "$@"; do
  case "$a" in
    --allow-dirty) ALLOW_DIRTY=1 ;;
    --push) DO_PUSH=1 ;;
    -h|--help)
      echo "Usage: $0 [branch] [--allow-dirty] [--push]"
      echo "  Default branch: current, or \$TRV_BRANCH, or TheRemoteViewer"
      echo "  --allow-dirty  continue even if tracked files are modified"
      echo "  --push         after pull, push current branch (requires auth)"
      echo "  Untracked files alone do NOT block sync."
      exit 0
      ;;
  esac
done

if [[ ! -d "$ROOT/.git" ]]; then
  echo "FAIL: not a git repo: $ROOT" >&2
  echo "Clone first: git clone <url> ~/The-Remote-Viewer" >&2
  exit 1
fi

cd "$ROOT"

if [[ -n "$BRANCH_ARG" && "$BRANCH_ARG" != --* ]]; then
  BRANCH="$BRANCH_ARG"
elif [[ -n "${TRV_BRANCH:-}" ]]; then
  BRANCH="$TRV_BRANCH"
else
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo TheRemoteViewer)"
  if [[ "$BRANCH" == "HEAD" ]]; then
    BRANCH="TheRemoteViewer"
  fi
fi

echo "[git-sync] root=$ROOT"
echo "[git-sync] branch=$BRANCH"

# Dirty check: tracked changes only (ignore untracked ?? lines)
TRACKED_DIRTY="$(git status --porcelain 2>/dev/null | grep -v '^??' || true)"
if [[ -n "$TRACKED_DIRTY" ]]; then
  if [[ "$ALLOW_DIRTY" -eq 0 ]]; then
    echo "FAIL: tracked files modified. Commit/stash, or re-run with --allow-dirty" >&2
    git status -sb
    exit 2
  fi
  echo "WARN: dirty tracked files allowed; pull may conflict"
fi

git fetch origin

CURRENT="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT" != "$BRANCH" ]]; then
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git checkout "$BRANCH"
  elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
    git checkout -B "$BRANCH" "origin/$BRANCH"
  else
    echo "FAIL: branch not found locally or on origin: $BRANCH" >&2
    exit 3
  fi
fi

if git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
  if git merge-base --is-ancestor HEAD "origin/$BRANCH" 2>/dev/null; then
    git merge --ff-only "origin/$BRANCH"
    echo "[git-sync] fast-forwarded to origin/$BRANCH"
  elif git merge-base --is-ancestor "origin/$BRANCH" HEAD 2>/dev/null; then
    echo "[git-sync] already up to date (local ahead or equal)"
  else
    echo "FAIL: histories diverged. Manual merge needed." >&2
    echo "  git status && git log --oneline HEAD..origin/$BRANCH" >&2
    exit 4
  fi
else
  echo "FAIL: origin/$BRANCH missing after fetch" >&2
  exit 3
fi

echo "[git-sync] HEAD=$(git rev-parse --short HEAD)"

if [[ "$DO_PUSH" -eq 1 ]]; then
  echo "[git-sync] pushing $BRANCH..."
  git push -u origin "$BRANCH"
fi

echo "[git-sync] done"
