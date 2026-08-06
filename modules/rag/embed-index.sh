#!/data/data/com.termux/files/usr/bin/bash
# Build vector index for all chunks
# Prefer llama.cpp embeddings; else pure-Python TF-IDF (always works offline)
set -euo pipefail

ROOT="${TRV_ROOT:-$HOME/The-Remote-Viewer}"
CHUNKS="${HOME}/.local/share/remote-viewer/rag/chunks"
VEC="${HOME}/.local/share/remote-viewer/rag/vectors.jsonl"
META="${HOME}/.local/share/remote-viewer/rag/vectors.meta"
mkdir -p "$(dirname "$VEC")"

if [[ ! -d "$CHUNKS" ]] || [[ -z "$(ls -A "$CHUNKS" 2>/dev/null || true)" ]]; then
  echo "No chunks. Run ingest/seed first."
  exit 1
fi

EMBED_BIN="${LLAMA_EMBED:-}"
if [[ -z "$EMBED_BIN" ]]; then
  for c in llama-embedding embedding \
    "$HOME/llama.cpp/build/bin/llama-embedding" \
    "$HOME/llama.cpp/build/bin/llama-cli"; do
    if command -v "$c" >/dev/null 2>&1; then EMBED_BIN=$(command -v "$c"); break; fi
    [[ -x "$c" ]] && EMBED_BIN="$c" && break
  done
fi

MODEL="${EMBED_MODEL:-$HOME/.local/share/remote-viewer/models/general.gguf}"
METHOD="tfidf"

# Try neural embeddings if binary + model exist (llama-cli --embedding or llama-embedding)
if [[ -n "$EMBED_BIN" && -f "$MODEL" ]]; then
  if "$EMBED_BIN" --help 2>&1 | grep -qi embed; then
    METHOD="llama"
  fi
fi

echo "[embed] method=$METHOD chunks=$(ls "$CHUNKS"/*.chunk 2>/dev/null | wc -l)"
: > "$VEC"

python3 - "$CHUNKS" "$VEC" "$METHOD" "$EMBED_BIN" "$MODEL" <<'PY'
import json, os, sys, re, math, subprocess, collections
chunk_dir, out_path, method, embed_bin, model = sys.argv[1:6]

def tokenize(t):
    return re.findall(r"[a-z0-9]{2,}", t.lower())

files = sorted(f for f in os.listdir(chunk_dir) if f.endswith(".chunk"))
docs = []
for name in files:
    path = os.path.join(chunk_dir, name)
    text = open(path, encoding="utf-8", errors="ignore").read().strip()
    docs.append((name, path, text))

if method == "llama" and embed_bin and os.path.isfile(model):
    def embed_text(text):
        text = text[:800].replace("\n", " ")
        # Prefer dedicated embedding binary; fall back to cli flags used by recent llama.cpp
        cmds = [
            [embed_bin, "-m", model, "-p", text, "--embedding", "-n", "0"],
            [embed_bin, "-m", model, "--embedding", "-p", text],
        ]
        for cmd in cmds:
            try:
                p = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
                raw = (p.stdout or "") + "\n" + (p.stderr or "")
                nums = re.findall(r"[-+]?\d*\.\d+(?:[eE][-+]?\d+)?", raw)
                # take a trailing float run as vector (best-effort across builds)
                if len(nums) >= 32:
                    vec = [float(x) for x in nums[-min(len(nums), 2048):]]
                    # normalize
                    n = math.sqrt(sum(v*v for v in vec)) or 1.0
                    return [v/n for v in vec]
            except Exception:
                continue
        return None

    ok = 0
    with open(out_path, "w", encoding="utf-8") as out:
        for name, path, text in docs:
            vec = embed_text(text)
            if not vec:
                continue
            rec = {"file": name, "method": "llama", "dim": len(vec), "vec": vec, "text": text[:200]}
            out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            ok += 1
    if ok:
        print(f"[embed] llama vectors={ok}")
        open(os.environ.get("META", out_path + ".meta"), "w").write("method=llama\n")
        sys.exit(0)
    print("[embed] llama failed — falling back to TF-IDF")

# TF-IDF sparse vectors (portable, no extra models)
df = collections.Counter()
tok_docs = []
for name, path, text in docs:
    toks = tokenize(text)
    tok_docs.append((name, text, toks))
    for t in set(toks):
        df[t] += 1
N = max(len(tok_docs), 1)
idf = {t: math.log((N + 1) / (c + 1)) + 1.0 for t, c in df.items()}

def tfidf_vec(toks):
    tf = collections.Counter(toks)
    L = max(len(toks), 1)
    vec = {t: (tf[t] / L) * idf.get(t, 0.0) for t in tf}
    n = math.sqrt(sum(v*v for v in vec.values())) or 1.0
    return {t: v / n for t, v in vec.items()}

with open(out_path, "w", encoding="utf-8") as out:
    for name, text, toks in tok_docs:
        vec = tfidf_vec(toks)
        rec = {"file": name, "method": "tfidf", "dim": len(vec), "vec": vec, "text": text[:200]}
        out.write(json.dumps(rec, ensure_ascii=False) + "\n")
print(f"[embed] tfidf vectors={len(tok_docs)} → {out_path}")
PY

echo "method=$(grep -q llama "$VEC" 2>/dev/null && echo llama || echo tfidf)" > "$META" 2>/dev/null || true
echo "[embed] wrote $VEC"
