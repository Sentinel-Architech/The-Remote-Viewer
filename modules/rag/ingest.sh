#!/data/data/com.termux/files/usr/bin/bash
# Chunk local docs into RAG store
set -euo pipefail

BASE="${HOME}/.local/share/remote-viewer/rag"
DOCS="${BASE}/docs"
CHUNKS="${BASE}/chunks"
mkdir -p "$DOCS" "$CHUNKS"

# Clear old chunks
rm -f "$CHUNKS"/*.chunk 2>/dev/null || true

n=0
shopt -s nullglob
for f in "$DOCS"/*; do
  [[ -f "$f" ]] || continue
  case "$f" in
    *.md|*.txt|*.markdown|*.rst) ;;
    *) continue ;;
  esac
  # Split on blank lines into chunks; fallback: whole file
  awk -v out="$CHUNKS" -v src="$(basename "$f")" -v nref="$n" '
    BEGIN { c=0; buf="" }
    /^\s*$/ {
      if (length(buf)>40) {
        c++
        fn=sprintf("%s/%s_%04d.chunk", out, src, c)
        print buf > fn
        close(fn)
      }
      buf=""
      next
    }
    { buf = (buf=="" ? $0 : buf "\n" $0) }
    END {
      if (length(buf)>40) {
        c++
        fn=sprintf("%s/%s_%04d.chunk", out, src, c)
        print buf > fn
        close(fn)
      }
      if (c==0 && length(buf)>0) {
        fn=sprintf("%s/%s_0001.chunk", out, src)
        print buf > fn
      }
    }
  ' "$f"
  n=$((n+1))
done

count=$(find "$CHUNKS" -name '*.chunk' 2>/dev/null | wc -l | tr -d ' ')
echo "Ingested from $DOCS → $count chunks in $CHUNKS"
if [[ "$count" -eq 0 ]]; then
  echo "Add .txt/.md files under $DOCS then re-run."
fi
