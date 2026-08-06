#!/data/data/com.termux/files/usr/bin/bash
# Hybrid retrieve: BM25 + TF-IDF cosine (if vectors exist)
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
CHUNKS="${HOME}/.local/share/remote-viewer/rag/chunks"
VEC="${HOME}/.local/share/remote-viewer/rag/vectors.jsonl"
QUERY="${*:-}"
TOP="${RAG_TOP:-6}"
PLAIN="${RAG_PLAIN:-1}"
K1="${BM25_K1:-1.5}"
B="${BM25_B:-0.75}"

if [[ -z "$QUERY" ]]; then
  echo "Usage: $0 <query words>" >&2
  exit 1
fi

if [[ ! -d "$CHUNKS" ]] || [[ -z "$(ls -A "$CHUNKS" 2>/dev/null || true)" ]]; then
  echo "No chunks. Run seed/ingest." >&2
  exit 2
fi

if [[ ! -s "$VEC" ]]; then
  bash "$ROOT/modules/rag/embed-index.sh" >/dev/null 2>&1 || true
fi

python3 - "$ROOT/modules/rag/bm25.py" "$CHUNKS" "$VEC" "$TOP" "$QUERY" "$PLAIN" "$K1" "$B" <<'PY'
import importlib.util, json, math, os, re, sys, collections

bm25_path, chunk_dir, vec_path, top, query, plain = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), sys.argv[5], sys.argv[6] == "1"
k1, b = float(sys.argv[7]), float(sys.argv[8])

spec = importlib.util.spec_from_file_location("bm25", bm25_path)
bm25_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bm25_mod)

names, paths, texts = bm25_mod.load_chunks(chunk_dir)
if not texts:
    sys.exit(0)

bm = bm25_mod.BM25(texts, k1=k1, b=b)
bm_scores = bm.score(query)

# optional TF-IDF cosine from vectors.jsonl
vscore = [0.0] * len(texts)
entries = []
if os.path.isfile(vec_path):
    with open(vec_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except Exception:
                    pass

if entries and entries[0].get("method") == "tfidf":
    df = collections.Counter()
    for e in entries:
        for t in e.get("vec", {}):
            df[t] += 1
    N = max(len(entries), 1)
    idf = {t: math.log((N + 1) / (c + 1)) + 1.0 for t, c in df.items()}
    qtf = collections.Counter(bm25_mod.tokenize(query))
    L = max(sum(qtf.values()), 1)
    qv = {t: (qtf[t] / L) * idf.get(t, 0.0) for t in qtf}
    nrm = math.sqrt(sum(v * v for v in qv.values())) or 1.0
    qv = {t: v / nrm for t, v in qv.items()}

    def cos(a, b):
        if not a or not b:
            return 0.0
        return sum(a[k] * b[k] for k in set(a) & set(b))

    by_file = {e["file"]: e for e in entries if isinstance(e.get("vec"), dict)}
    for i, name in enumerate(names):
        e = by_file.get(name)
        if e:
            vscore[i] = cos(qv, e["vec"])

q_low = query.lower()
ability = any(w in q_low for w in (
    "what can", "what do you", "capabilities", "help", "how do i",
    "what is trv", "what is sentinel",
))

hybrid = []
for i, name in enumerate(names):
    s = bm_scores[i] + 2.0 * vscore[i]
    if ability and ("capabilities" in name or "can do on this device" in texts[i].lower()):
        s += 2.0
    if s > 0:
        hybrid.append((s, bm_scores[i], vscore[i], i))

hybrid.sort(key=lambda x: (-x[0], x[3]))
if ability and not hybrid:
    for i, name in enumerate(names):
        if any(x in name for x in ("capabilities", "how-to", "trv-core")):
            hybrid.append((1.0, 0.0, 0.0, i))

for s, bs, vs, i in hybrid[:top]:
    if plain:
        print(texts[i][:1500])
        print()
    else:
        print(f"--- score={s:.4f} bm25={bs:.4f} vec={vs:.4f} file={names[i]} ---")
        print(texts[i][:1500])
        print()
PY
