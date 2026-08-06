#!/data/data/com.termux/files/usr/bin/bash
# Seed a few TRV facts into RAG docs (from known PROVEN status)
set -euo pipefail
DOCS="${HOME}/.local/share/remote-viewer/rag/docs"
mkdir -p "$DOCS"

cat > "$DOCS/trv-core.txt" <<'EOF'
The Remote Viewer (TRV) / The Sentinel is a local-first stack on GrapheneOS and Termux.

Optical air-gap is PROVEN: age encrypt, then Robust Soliton LT frame-stream, then peel, then age decrypt. Script: optical-airgap/scripts/e2e-age-lt.sh.

MoE Stage B is PROVEN with two dense GGUFs: TinyLlama general and Qwen2.5-Coder code, selected by modules/moe-router.

MoE Stage C is PROVEN with TinyMixtral-4x248M-MoE sparse weights as moe.gguf. Quality is limited by size; architecture is real MoE.

Contribution ledger is an offline JSONL hash-chain under ~/.local/share/remote-viewer/contribution/. verify.sh checks the chain. It is not a blockchain mint.

Defense / Hydra is local integrity only: integrity-pulse.sh checks scripts, vault modes, models, and contribution verify. No offensive tooling. No telemetry.

The browser UI is served on 127.0.0.1 only via apps/ui/serve-ui.sh. It does not execute shell or read keys.

There is no required cloud account. Desktop unlock is optional local passphrase wrap for age keys.
EOF

echo "Seeded $DOCS/trv-core.txt"
bash "$(cd "$(dirname "$0")" && pwd)/ingest.sh"
