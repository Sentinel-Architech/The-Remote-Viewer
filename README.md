# The Remote Viewer (TRV) / The Sentinel

**Local-first sovereign node** for GrapheneOS + Termux (and desktop Linux/macOS).

Not a cloud AI product. Not a live DePIN network. Not an always-on oracle.

**Working branch:** [`TheRemoteViewer`](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/tree/TheRemoteViewer)  
**Truth file:** [`docs/REALITY.md`](docs/REALITY.md) — PROVEN means ran on a real device under user control.  
**Reproduce:** [`docs/TEST.md`](docs/TEST.md)

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh    # no models required
bash scripts/chat.sh                       # local assistant (after llama.cpp + weights optional)
```

---

## Status (2026-08-06)

| Capability | Status | Notes |
|------------|--------|-------|
| Optical air-gap | **PROVEN** | age → Soliton LT → peel → decrypt |
| MoE Stage B (dense) | **PROVEN** | TinyLlama + Qwen2.5-Coder via llama.cpp |
| MoE Stage C (sparse) | **PROVEN** | TinyMixtral-4x248M-MoE load + generate |
| Local RAG | **SCAFFOLD** | BM25 + TF-IDF vectors + session memory + chat |
| Defense / Hydra | **SCAFFOLD** | integrity-pulse only; no offensive tooling |
| Contribution ledger | **SCAFFOLD** | offline JSONL hash-chain |
| Local UI | **SCAFFOLD** | `http://127.0.0.1:8765/` |
| Chain settlement | **NOT STARTED** | |

---

## 60-second paths

### Phone (Termux)

```bash
pkg update && pkg install git python -y
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
bash modules/rag/seed-trv-docs.sh          # local notes index (BM25 + vectors)
# optional models: build llama.cpp, fetch-weights, then:
bash scripts/chat.sh                      # you> prompt — remembers what you say
```

### RAG without the model

```bash
RAG_PLAIN=0 bash modules/rag/retrieve.sh "what can you do"
python3 modules/rag/bm25.py "optical e2e"
```

### UI

```bash
bash apps/ui/serve-ui.sh
# http://127.0.0.1:8765/  (leave process running)
```

---

## Layout

```text
optical-airgap/          PROVEN transport
modules/moe-router/      MoE B/C
modules/rag/             BM25, vectors, memory, pipeline
modules/defense/         Hydra integrity
modules/contribution/    hash-chain ledger
modules/reminders/       Termux:API notifications (optional)
apps/ui/                 localhost console
scripts/chat.sh          front door assistant
scripts/trv.sh           pulse | sync | ui | talk
docs/REALITY.md          status authority
docs/TEST.md             how others verify
```

---

## What this is not

- No required cloud login  
- No public hosted EI endpoint  
- No live multi-operator DePIN  
- Keys, GGUFs, personal notes, and ledger events stay on **your** device  

---

## License

See [LICENSE](LICENSE).
