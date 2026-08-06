# Ranking: BM25 + vectors

## BM25 (Python)

```bash
python3 modules/rag/bm25.py "what can you do"
python3 modules/rag/bm25.py --plain -k 3 "optical e2e"
```

Tunable: `--k1 1.5` (default), `-b 0.75` (default).

Env for retrieve:

```bash
BM25_K1=1.5 BM25_B=0.75 RAG_PLAIN=0 bash modules/rag/retrieve.sh "what can you do"
```

## Hybrid score

```text
score = BM25(query, chunk) + 2.0 * cosine_tfidf(query, chunk) + ability_boost
```

## Vectors

```bash
bash modules/rag/embed-index.sh   # TF-IDF default; llama if available
```

`~/.local/share/remote-viewer/rag/vectors.jsonl`
