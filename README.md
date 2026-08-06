# The Remote Viewer (TRV) / The Sentinel

**Local-first sovereign node** for GrapheneOS + Termux (and desktop Linux/macOS).

Not a cloud AI product. Not a live DePIN network. Not an always-on oracle.

**Active branch:** [`TheRemoteViewer`](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/tree/TheRemoteViewer)  
**Truth file:** [`docs/REALITY.md`](docs/REALITY.md) — PROVEN means ran on a real device under user control.

---

## What is PROVEN on-device (2026-08-06)

| Capability | Status | Notes |
|------------|--------|-------|
| Optical air-gap | **PROVEN** | age → Soliton LT → peel → decrypt (`optical-airgap/`) |
| MoE Stage B (dense) | **PROVEN** | TinyLlama + Qwen2.5-Coder GGUF via `llama.cpp` |
| MoE Stage C (sparse) | **PROVEN** | TinyMixtral-4x248M-MoE GGUF load + generate |
| Contribution ledger | **SCAFFOLD** | Offline JSONL hash-chain; not a blockchain mint |
| Defense / Hydra | **SCAFFOLD** | Local integrity pulse only; no offensive tooling |
| Local RAG | **SCAFFOLD** | Keyword retrieve + prompt; not weight training |
| Local UI | **SCAFFOLD** | `http://127.0.0.1:8765/` only |
| Chain settlement | **NOT STARTED** | |

---

## Quick start — others can test

### A) Phone (Termux / GrapheneOS preferred)

```bash
pkg update && pkg install git python clang cmake make curl -y
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer

# Front door
bash scripts/install-trv-alias.sh && source ~/.bashrc

# Defense (no models required)
bash scripts/trv.sh pulse

# Optical (requires age + vault setup — see optical-airgap/INSTALL.md)
# bash scripts/trv.sh optical

# UI
bash scripts/trv.sh ui
# open http://127.0.0.1:8765/
```

### B) Models (optional, needs disk + RAM)

```bash
# Build llama.cpp once
cd $HOME && git clone https://github.com/ggml-org/llama.cpp.git && cd llama.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j$(nproc) --target llama-cli
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli

cd $HOME/The-Remote-Viewer
bash modules/moe-router/fetch-weights.sh          # TinyLlama + code slot
FORCE_CODE=1 bash modules/moe-router/fetch-weights.sh
bash modules/moe-router/fetch-moe-weights.sh      # sparse MoE ~0.5GB

bash scripts/trv.sh talk "What is TRV?"
```

### C) Desktop convenience

```bash
bash scripts/desktop-install.sh
# or: docs/INSTALL-DESKTOP.md Track A (barebones)
```

### D) Minimal test matrix (what “works” means)

See **[docs/TEST.md](docs/TEST.md)**.

---

## One command (`trv`)

```text
trv talk <question>     # RAG if seeded, else model
trv pulse               # Hydra integrity
trv sync                # git pull + defense check
trv ui                  # localhost console
trv optical [msg]       # optical e2e
trv seed                # seed local RAG docs
```

---

## What this is not

- **Not** a mandatory cloud account or OAuth login  
- **Not** a public hosted EI endpoint  
- **Not** a live DePIN (no multi-operator physical network + settlement)  
- **Not** real-time learning of world facts (RAG = your local files only)  

GitHub holds **code**. Your keys, GGUFs, and ledger stay on **your** device.

---

## Layout (core paths)

```text
optical-airgap/     # PROVEN transport
modules/moe-router/ # MoE A/B/C
modules/defense/    # Hydra integrity
modules/contribution/
modules/rag/
modules/data-sovereignty/
apps/ui/            # 127.0.0.1 console
scripts/trv.sh      # front door
docs/REALITY.md     # status authority
docs/TEST.md        # reproduce steps
```

---

## License

See [LICENSE](LICENSE).
