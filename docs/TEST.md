# How others can test TRV

**Branch:** `TheRemoteViewer`  
**Rule:** Report what you actually ran. Do not paste age secrets.

## 0. Clone

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
```

## 1. Zero-model (anyone with bash + python)

```bash
bash modules/defense/integrity-pulse.sh
bash modules/rag/seed-trv-docs.sh
RAG_PLAIN=0 bash modules/rag/retrieve.sh "what can you do"
python3 modules/rag/bm25.py -k 3 "optical e2e"
bash modules/contribution/record.sh verification 1 "test from clone"
bash modules/contribution/verify.sh
bash apps/ui/serve-ui.sh   # http://127.0.0.1:8765/
```

Expect: pulse output, BM25/hybrid hits on capabilities or optical chunks, VERIFY OK, UI binds localhost.

## 2. Chat (needs llama-cli + GGUF)

```bash
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
bash scripts/chat.sh
# at you> ask something; /memory shows stored turns; /exit to quit
```

## 3. Optical

See `optical-airgap/INSTALL.md`, then `bash optical-airgap/scripts/e2e-age-lt.sh "hello"`.

## Reporting

Open an issue with: OS, Termux yes/no, commands, output. No vault keys.
