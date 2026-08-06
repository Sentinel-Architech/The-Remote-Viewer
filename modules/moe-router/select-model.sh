#!/data/data/com.termux/files/usr/bin/bash
# Stage B: tag → local model (fail closed)
set -euo pipefail

ROOT="${TRV_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi
REG="${TRV_MODELS:-$ROOT/modules/moe-router/models.json}"
TAG="${1:-}"

if [[ -z "$TAG" || "$TAG" == "-h" || "$TAG" == "--help" ]]; then
  echo "Usage: $0 <tag>"
  echo "Example: $0 general"
  echo "Example: $0 code"
  exit 1
fi

if [[ ! -f "$REG" ]]; then
  echo "FAIL: no models registry at $REG" >&2
  exit 1
fi

python3 - "$REG" "$TAG" <<'PY'
import json, sys, os
reg_path, tag = sys.argv[1], sys.argv[2].lower()
with open(reg_path) as f:
    data = json.load(f)
matches = []
for m in data.get("models", []):
    tags = [t.lower() for t in m.get("tags", [])]
    if tag in tags or tag == m.get("id", "").lower():
        matches.append(m)
if not matches:
    print("NONE", file=sys.stderr)
    sys.exit(2)
# Prefer exact id, else first tag match; prefer non-stub if multiple
exact = [m for m in matches if m.get("id", "").lower() == tag]
chosen = exact[0] if exact else None
if not chosen:
    nonstub = [m for m in matches if m.get("backend") != "stub"]
    chosen = nonstub[0] if nonstub else matches[0]
path = chosen.get("path") or ""
if path.startswith("$HOME"):
    path = path.replace("$HOME", os.path.expanduser("~"), 1)
print(chosen.get("id", ""))
print(chosen.get("backend", "stub"))
print(path)
PY
