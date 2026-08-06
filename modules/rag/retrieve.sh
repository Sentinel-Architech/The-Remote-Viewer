#!/data/data/com.termux/files/usr/bin/bash
# Keyword retrieve top chunks (local only)
set -euo pipefail

CHUNKS="${HOME}/.local/share/remote-viewer/rag/chunks"
QUERY="${*:-}"
TOP="${RAG_TOP:-6}"

if [[ -z "$QUERY" ]]; then
  echo "Usage: $0 <query words>" >&2
  exit 1
fi

if [[ ! -d "$CHUNKS" ]] || [[ -z "$(ls -A "$CHUNKS" 2>/dev/null || true)" ]]; then
  echo "No chunks. Run: bash modules/rag/seed-trv-docs.sh" >&2
  exit 2
fi

python3 - "$CHUNKS" "$TOP" "$QUERY" <<'PY'
import os, sys, re
chunk_dir, top, query = sys.argv[1], int(sys.argv[2]), sys.argv[3]
q_low = query.lower()
terms = [t.lower() for t in re.findall(r"[a-zA-Z0-9_]{2,}", query)]
if not terms:
    terms = [query.lower()]

# Boost ability / overview questions toward capabilities / how-to docs
ability = any(w in q_low for w in (
    "what can", "what do you", "capabilities", "what are you",
    "help", "how do i", "how to", "what is trv", "what is sentinel",
))

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
    # Prefer capability/overview files for ability-style questions
    if ability and ("capabilities" in name or "how-to" in name or "what the sentinel can" in low):
        score += 50
    if ability and "can do on this device" in low:
        score += 30
    if score > 0:
        scored.append((score, path, text.strip()))

# If ability question and nothing scored, force-load capabilities chunks
if ability and not scored:
    for name in sorted(os.listdir(chunk_dir)):
        if "capabilities" in name or "how-to" in name or "trv-core" in name:
            path = os.path.join(chunk_dir, name)
            try:
                text = open(path, encoding="utf-8", errors="ignore").read().strip()
            except OSError:
                continue
            scored.append((1, path, text))

scored.sort(key=lambda x: (-x[0], x[1]))
for score, path, text in scored[:top]:
    print(f"--- chunk score={score} file={os.path.basename(path)} ---")
    print(text[:1500])
    print()
PY
