#!/data/data/com.termux/files/usr/bin/bash
# Seed TRV facts into local RAG docs (device-only knowledge base)
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

cat > "$DOCS/capabilities.txt" <<'EOF'
What The Sentinel can do on this device:

1. Answer questions using local RAG documents you placed under ~/.local/share/remote-viewer/rag/docs/ plus the seed facts.
2. Run local language models (general TinyLlama, code Qwen2.5-Coder, sparse TinyMixtral) via llama.cpp. Weights are fixed until you replace the GGUF files.
3. Optical end-to-end encrypt and transfer path: age + Soliton LT + peel + decrypt.
4. Defense integrity pulse: check that critical scripts, model files, vault modes, and the contribution chain are intact.
5. Contribution ledger: record verification events as a local hash-chain and verify the chain.
6. Local browser console at http://127.0.0.1:8765/ that only shows copy-paste Termux commands.
7. Git sync of the public code from GitHub when you run git-sync; keys and ledger stay on device.

What it cannot do:
- It does not learn world news in real time.
- It does not phone home or use a cloud AI API as the core path.
- It is not a live multi-operator DePIN network.
- Small models may still invent details not in CONTEXT; trust the retrieved source chunks over fluent guesses.
EOF

cat > "$DOCS/how-to-ask.txt" <<'EOF'
How to interact:
Open Termux and run: bash $HOME/The-Remote-Viewer/scripts/chat.sh
Or after alias setup: trv
You see you> then type a question. Type /exit to quit.
For one-shot: bash $HOME/The-Remote-Viewer/scripts/trv.sh talk Your question here
Add your own reliable notes as .txt or .md files in ~/.local/share/remote-viewer/rag/docs/ then run: bash modules/rag/ingest.sh
Answers that cite CONTEXT chunks are grounded in those files. Answers without matching chunks are model-only and less reliable.
EOF

echo "Seeded $DOCS/{trv-core,capabilities,how-to-ask}.txt"
bash "$(cd "$(dirname "$0")" && pwd)/ingest.sh"
