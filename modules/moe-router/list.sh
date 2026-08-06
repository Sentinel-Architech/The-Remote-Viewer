#!/data/data/com.termux/files/usr/bin/bash
# List local MoE Stage A experts
set -euo pipefail

ROOT="${TRV_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi
REG="${TRV_EXPERTS:-$ROOT/modules/moe-router/experts.json}"

if [[ ! -f "$REG" ]]; then
  echo "FAIL: registry not found: $REG" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Registry: $REG"
  cat "$REG"
  exit 0
fi

python3 - "$REG" <<'PY'
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
print(f"MoE Stage A experts ({path})")
print("-" * 60)
for e in data.get("experts", []):
    tags = ", ".join(e.get("tags", []))
    print(f"{e.get('id', '?'):24}  tags=[{tags}]")
    print(f"  cmd: {e.get('command', '')}")
    if e.get("notes"):
        print(f"  note: {e['notes']}")
    print()
PY
