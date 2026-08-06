#!/data/data/com.termux/files/usr/bin/bash
# Keyword retrieve top chunks (local only)
set -euo pipefail

CHUNKS="${HOME}/.local/share/remote-viewer/rag/chunks"
QUERY="${*:-}"
TOP="${RAG_TOP:-4}"

if [[ -z "$QUERY" ]]; then
  echo "Usage: $0 <query words>" >&2
  exit 1
fi

if [[ ! -d "$CHUNKS" ]] || [[ -z "$(ls -A "$CHUNKS" 2>/dev/null || true)" ]]; then
  echo "No chunks. Run: bash modules/rag/ingest.sh" >&2
  exit 2
fi

# Score: count query term hits (case insensitive)
python3 - "$CHUNKS" "$TOP" "$QUERY" <<'PY'
import os, sys, re
chunk_dir, top, query = sys.argv[1], int(sys.argv[2]), sys.argv[3]
terms = [t.lower() for t in re.findall(r"[a-zA-Z0-9_]{2,}", query)]
if not terms:
    terms = [query.lower()]
scored = []
for name in os.listdir(chunk_dir):
    if not name.endswith(".chunk"):
        continue
    path = os.path.join(chunk_dir, name)
    try:
        text = open(path, encoding="utf-8", errors="ignore").read()
    except OSError:
        continue
    low = text.lower()
    score = sum(low.count(t) for t in terms)
    if score > 0:
        scored.append((score, path, text.strip()))
scored.sort(key=lambda x: (-x[0], x[1]))
for score, path, text in scored[:top]:
    print(f"--- chunk score={score} file={os.path.basename(path)} ---")
    print(text[:1200])
    print()
PY
