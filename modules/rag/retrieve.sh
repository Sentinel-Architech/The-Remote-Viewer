#!/data/data/com.termux/files/usr/bin/bash
# Hybrid retrieve: keyword + vector (TF-IDF or llama embeddings)
set -euo pipefail

CHUNKS="${HOME}/.local/share/remote-viewer/rag/chunks"
VEC="${HOME}/.local/share/remote-viewer/rag/vectors.jsonl"
QUERY="${*:-}"
TOP="${RAG_TOP:-6}"
PLAIN="${RAG_PLAIN:-1}"

if [[ -z "$QUERY" ]]; then
  echo "Usage: $0 <query words>" >&2
  exit 1
fi

if [[ ! -d "$CHUNKS" ]] || [[ -z "$(ls -A "$CHUNKS" 2>/dev/null || true)" ]]; then
  echo "No chunks. Run seed/ingest." >&2
  exit 2
fi

# Auto-build vector index if missing
if [[ ! -s "$VEC" ]]; then
  bash "${TRV_ROOT:-$HOME/The-Remote-Viewer}/modules/rag/embed-index.sh" >/dev/null 2>&1 || true
fi

python3 - "$CHUNKS" "$VEC" "$TOP" "$QUERY" "$PLAIN" <<'PY'
import json, os, sys, re, math, collections
chunk_dir, vec_path, top, query, plain = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5] == "1"
q_low = query.lower()
terms = re.findall(r"[a-z0-9]{2,}", q_low) or [q_low]
ability = any(w in q_low for w in ("what can", "what do you", "capabilities", "help", "how do i", "what is trv", "what is sentinel"))

def tok(t):
    return re.findall(r"[a-z0-9]{2,}", t.lower())

# load vectors
entries = []
if os.path.isfile(vec_path):
    with open(vec_path, encoding="utf-8") as f:
        for line in f:
            line=line.strip()
            if line:
                try: entries.append(json.loads(line))
                except Exception: pass

# query vector
method = entries[0]["method"] if entries else "keyword"
if method == "tfidf" and entries:
    # rebuild idf from sparse keys roughly via document frequencies in index
    df = collections.Counter()
    for e in entries:
        for t in e["vec"]:
            df[t] += 1
    N = max(len(entries), 1)
    idf = {t: math.log((N+1)/(c+1))+1.0 for t,c in df.items()}
    qtf = collections.Counter(tok(query))
    L = max(sum(qtf.values()), 1)
    qv = {t: (qtf[t]/L)*idf.get(t, 0.0) for t in qtf}
    n = math.sqrt(sum(v*v for v in qv.values())) or 1.0
    qv = {t: v/n for t,v in qv.items()}
    def cos(a, b):
        # sparse
        if not a or not b: return 0.0
        keys = set(a) & set(b)
        return sum(a[k]*b[k] for k in keys)
elif method == "llama" and entries:
    # without re-embedding query via binary here, fall back to keyword-heavy hybrid
    qv = None
    def cos(a, b):
        return 0.0
else:
    qv = None
    def cos(a, b):
        return 0.0

scored = []
for name in os.listdir(chunk_dir):
    if not name.endswith(".chunk"): continue
    path = os.path.join(chunk_dir, name)
    try: text = open(path, encoding="utf-8", errors="ignore").read().strip()
    except OSError: continue
    low = text.lower()
    kw = sum(low.count(t) for t in terms)
    if ability and ("capabilities" in name or "can do on this device" in low):
        kw += 20
    vscore = 0.0
    for e in entries:
        if e.get("file") == name:
            if method == "tfidf" and qv is not None and isinstance(e.get("vec"), dict):
                vscore = cos(qv, e["vec"])
            break
    # hybrid
    score = kw + 5.0 * vscore
    if score > 0:
        scored.append((score, kw, vscore, path, text))

if ability and not scored:
    for name in sorted(os.listdir(chunk_dir)):
        if any(x in name for x in ("capabilities", "how-to", "trv-core")):
            path = os.path.join(chunk_dir, name)
            text = open(path, encoding="utf-8", errors="ignore").read().strip()
            scored.append((1, 0, 0, path, text))

scored.sort(key=lambda x: (-x[0], x[3]))
for score, kw, vs, path, text in scored[:top]:
    if plain:
        print(text[:1500]); print()
    else:
        print(f"--- score={score:.3f} kw={kw} vec={vs:.3f} file={os.path.basename(path)} ---")
        print(text[:1500]); print()
PY
