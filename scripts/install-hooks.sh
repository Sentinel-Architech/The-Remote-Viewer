#!/usr/bin/env bash
# Install TRV git hooks via core.hooksPath (tracked scripts/hooks)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d .git ]]; then
  echo "FAIL: run from a git clone (no .git here)" >&2
  exit 1
fi

# Executable bits (GitHub API commits often land as 100644)
chmod +x scripts/hooks/pre-commit scripts/hooks/post-merge scripts/hooks/post-checkout 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
find "$ROOT/modules" -name '*.sh' -type f -exec chmod +x {} + 2>/dev/null || true
find "$ROOT/digital-vending" -name '*.sh' -type f -exec chmod +x {} + 2>/dev/null || true
find "$ROOT/optical-airgap/scripts" -name '*.sh' -type f -exec chmod +x {} + 2>/dev/null || true

git config core.hooksPath scripts/hooks

echo "Installed hooksPath -> scripts/hooks"
echo "  pre-commit    block vault keys / private key material / tokens"
echo "  post-merge    chmod +x scripts after pull"
echo "  post-checkout same on branch switch"
echo
echo "Verify: git config core.hooksPath"
git config core.hooksPath
echo
ls -la scripts/hooks/
