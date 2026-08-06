# Vector embeddings (on-device)

## Methods

| Method | When |
|--------|------|
| **TF-IDF sparse vectors** | Default — pure Python, no extra model, always works on Termux |
| **llama.cpp embeddings** | If `llama-embedding` or `llama-cli --embedding` + GGUF work on your build |

## Build / rebuild

```bash
bash modules/rag/seed-trv-docs.sh   # includes ingest + embed
# or
bash modules/rag/ingest.sh          # chunk + embed-index
bash modules/rag/embed-index.sh     # vectors only
```

Index file: `~/.local/share/remote-viewer/rag/vectors.jsonl`

## Retrieve

`retrieve.sh` is **hybrid**: keyword score + vector cosine (TF-IDF).

```bash
RAG_PLAIN=0 bash modules/rag/retrieve.sh "what can you do"
# shows score / kw / vec components
```

## Neural upgrade later

Install/build `llama-embedding`, set:

```bash
export LLAMA_EMBED=$HOME/llama.cpp/build/bin/llama-embedding
export EMBED_MODEL=$HOME/.local/share/remote-viewer/models/general.gguf
bash modules/rag/embed-index.sh
```

If neural embed fails, index falls back to TF-IDF automatically.
