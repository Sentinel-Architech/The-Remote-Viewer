# MoE Router

**Stage A (processes):** `list.sh` · `route.sh` · `experts.json`  
**Stage B (models):** `list-models.sh` · `select-model.sh` · `run-model.sh` · `models.json`

See [STAGE-B.md](./STAGE-B.md) and `docs/architecture/sentinel-moe.md`.

## Stage A

```bash
bash modules/moe-router/list.sh
bash modules/moe-router/route.sh optical
```

## Stage B

```bash
bash modules/moe-router/list-models.sh
bash modules/moe-router/select-model.sh general
bash modules/moe-router/run-model.sh general
bash modules/moe-router/run-model.sh stub "ping"
```

GGUF path example: `~/.local/share/remote-viewer/models/general.gguf`  
CLI: `LLAMA_CLI=/path/to/llama-cli`

Fail closed. No cloud. Stage C sparse weights still DESIGN.
