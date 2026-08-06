# Local RAG (The Sentinel)

**Status:** SCAFFOLD  
**Meaning:** Your files on device are searched at question time and stuffed into the model prompt. **Not** weight training. **Not** real-time world learning.

## Layout

| Path | Role |
|------|------|
| `~/.local/share/remote-viewer/rag/docs/` | Drop source `.md` / `.txt` |
| `~/.local/share/remote-viewer/rag/chunks/` | Chunk store (generated) |
| `ingest.sh` | Chunk docs |
| `retrieve.sh` | Keyword retrieval |
| `ask.sh` | Retrieve + call MoE `run-model.sh` |

## Usage

```bash
cd ~/The-Remote-Viewer

# 1. Add facts/notes
mkdir -p ~/.local/share/remote-viewer/rag/docs
echo 'Optical e2e uses age encrypt then Soliton LT then peel.' > ~/.local/share/remote-viewer/rag/docs/optical.txt

# 2. Ingest
bash modules/rag/ingest.sh

# 3. Ask (uses Stage B general by default)
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
bash modules/rag/ask.sh general "How does optical e2e work in TRV?"
```

## Limits

- Retrieval is **local keyword** scoring (phone-friendly). Vector embeddings can be added later.
- Model still has fixed GGUF weights; RAG only changes the **prompt**.
- You update facts by editing docs + re-ingest — not automatic web learning.
