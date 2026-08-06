# MoE Router

| Stage | Status | Entry |
|-------|--------|-------|
| A Process experts | SCAFFOLD | `list.sh` / `route.sh` |
| B Dense local models | **PROVEN** | `list-models.sh` / `run-model.sh` + dual GGUF |
| C Sparse MoE weights | **DESIGN** | [STAGE-C.md](./STAGE-C.md) · optional `moe.gguf` |
| D IA of IA | DESIGN | architecture doc |

## Stage B (works today)

```bash
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
bash modules/moe-router/run-model.sh general "Hello"
bash modules/moe-router/run-model.sh code "bash one-liner"
```

## Stage C (research)

```bash
# only after you place a sparse-MoE GGUF:
ls -lh ~/.local/share/remote-viewer/models/moe.gguf
bash modules/moe-router/run-model.sh moe "test"
```

Do not mark PROVEN until STAGE-C.md checklist is satisfied on-device.
