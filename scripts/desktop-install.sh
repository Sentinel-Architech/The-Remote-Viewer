#!/usr/bin/env bash
# TRV desktop convenience installer — local only, no cloud account
set -euo pipefail

REPO_URL="${TRV_REPO_URL:-https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git}"
BRANCH="${TRV_BRANCH:-TheRemoteViewer}"
DEST="${TRV_ROOT:-$HOME/The-Remote-Viewer}"

echo "=== TRV desktop install (local) ==="
echo "No cloud account. Optional local unlock only."
echo

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "MISSING: $1"
    return 1
  fi
  echo "OK: $1"
  return 0
}

MISS=0
need git || MISS=1
need python3 || need python || MISS=1
if ! need age 2>/dev/null; then
  echo "WARN: age not installed — identity helpers limited (install age for keygen)"
fi

if [[ "$MISS" -ne 0 ]]; then
  echo
  echo "Install missing tools, then re-run. Barebones path: docs/INSTALL-DESKTOP.md Track A"
  exit 1
fi

if [[ ! -d "$DEST/.git" ]]; then
  echo "Cloning $REPO_URL → $DEST"
  git clone --branch "$BRANCH" "$REPO_URL" "$DEST"
else
  echo "Repo exists: $DEST"
  git -C "$DEST" fetch origin
  git -C "$DEST" checkout "$BRANCH"
  git -C "$DEST" merge --ff-only "origin/$BRANCH" || true
fi

chmod +x "$DEST"/scripts/*.sh "$DEST"/apps/ui/serve-ui.sh 2>/dev/null || true
chmod +x "$DEST"/modules/*/*.sh 2>/dev/null || true

echo
echo "Tracks:"
echo "  A) Barebones — use scripts under $DEST (see docs/INSTALL-DESKTOP.md)"
echo "  B) Local unlock (optional passphrase) then start UI"
echo
read -r -p "Set up local unlock now? [y/N] " ans || true
if [[ "${ans:-}" =~ ^[Yy]$ ]]; then
  bash "$DEST/modules/local-identity/unlock.sh" --setup || true
fi

echo
read -r -p "Start localhost UI now? [Y/n] " ui || true
if [[ ! "${ui:-Y}" =~ ^[Nn]$ ]]; then
  echo "Open http://127.0.0.1:8765/ in your browser"
  bash "$DEST/apps/ui/serve-ui.sh"
else
  echo "Later: bash $DEST/apps/ui/serve-ui.sh"
fi
