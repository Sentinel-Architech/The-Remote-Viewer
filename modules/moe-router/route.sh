#!/data/data/com.termux/files/usr/bin/bash
# Stage A MoE router: match tag → local expert command
# Default: print only. --exec runs the command (still local).
set -euo pipefail

ROOT="${TRV_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi
REG="${TRV_EXPERTS:-$ROOT/modules/moe-router/experts.json}"

TAG="${1:-}"
MODE="${2:-}"

if [[ -z "$TAG" || "$TAG" == "-h" || "$TAG" == "--help" ]]; then
  echo "Usage: $0 <tag> [--exec]"
  echo "Example: $0 optical"
  echo "Example: $0 sovereignty --exec"
  exit 1
fi

if [[ ! -f "$REG" ]]; then
  echo "FAIL: no expert registry at $REG" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "FAIL: python3 required for routing" >&2
  exit 1
fi

RESULT="$(python3 - "$REG" "$TAG" <<'PY'
import json, sys
reg_path, tag = sys.argv[1], sys.argv[2].lower()
with open(reg_path) as f:
    data = json.load(f)
matches = []
for e in data.get("experts", []):
    tags = [t.lower() for t in e.get("tags", [])]
    if tag in tags or tag == e.get("id", "").lower():
        matches.append(e)
if not matches:
    print("NONE")
    sys.exit(0)
# Prefer exact id match, else first tag match
exact = [m for m in matches if m.get("id", "").lower() == tag]
chosen = exact[0] if exact else matches[0]
print(chosen.get("command", ""))
print(chosen.get("id", ""))
PY
)"

if [[ "$RESULT" == "NONE" || -z "$RESULT" ]]; then
  echo "FAIL: no expert for tag '$TAG' (fail closed)" >&2
  exit 2
fi

CMD="$(printf '%s\n' "$RESULT" | sed -n '1p')"
EID="$(printf '%s\n' "$RESULT" | sed -n '2p')"

echo "expert: $EID"
echo "command: $CMD"

if [[ "$MODE" == "--exec" ]]; then
  cd "$ROOT"
  # shellcheck disable=SC2086
  exec bash -c "$CMD"
fi
