#!/data/data/com.termux/files/usr/bin/bash
# List Stage B local models
set -euo pipefail

ROOT="${TRV_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi
REG="${TRV_MODELS:-$ROOT/modules/moe-router/models.json}"

if [[ ! -f "$REG" ]]; then
  echo "FAIL: models registry not found: $REG" >&2
  exit 1
fi

python3 - "$REG" <<'PY'
import json, sys, os
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
print(f"MoE Stage B models ({path})")
print("-" * 60)
for m in data.get("models", []):
    tags = ", ".join(m.get("tags", []))
    p = m.get("path") or "(none)"
    if p and p.startswith("$HOME"):
        p = p.replace("$HOME", os.path.expanduser("~"), 1)
    exists = ""
    if m.get("path"):
        exists = " [file OK]" if os.path.isfile(p) else " [path missing]"
    print(f"{m.get('id','?'):24} backend={m.get('backend','?'):10} tags=[{tags}]")
    print(f"  path: {p}{exists}")
    if m.get("notes"):
        print(f"  note: {m['notes']}")
    print()
PY
