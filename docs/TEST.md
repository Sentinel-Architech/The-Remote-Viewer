# How others can test TRV

Branch: `TheRemoteViewer`  
Goal: reproduce **claims**, not marketing demos.

## 0. Clone

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
```

## 1. Zero-model tests (anyone with bash)

```bash
bash modules/defense/integrity-pulse.sh
# Expect: RESULT: PASS or clear FAIL reasons (missing optional models = WARN)

bash modules/contribution/record.sh verification 1 "test from clone"
bash modules/contribution/verify.sh
# Expect: VERIFY OK

bash apps/ui/serve-ui.sh
# Browser: http://127.0.0.1:8765/
# Expect: The Sentinel console; Ctrl+C stops server only
```

## 2. Optical (needs `age` + vault setup)

Follow `optical-airgap/INSTALL.md`, then:

```bash
bash optical-airgap/scripts/e2e-age-lt.sh "hello tester"
# Expect: peel ok / decrypt success on a configured device
```

Reference PROVEN environment: GrapheneOS + Termux.

## 3. MoE (optional — large downloads)

```bash
# llama-cli on PATH or:
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
export LLAMA_ARGS="-n 64 -c 2048 -t 4"

bash modules/moe-router/fetch-weights.sh
bash modules/moe-router/fetch-moe-weights.sh
bash modules/moe-router/list-models.sh
bash modules/moe-router/run-model.sh general "Say hello in one sentence."
bash modules/moe-router/run-model.sh moe "Say hello."
```

Expect: model loads and generates. Stage C prose quality is weak by design (tiny MoE).

## 4. RAG

```bash
bash modules/rag/seed-trv-docs.sh
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
bash modules/rag/ask.sh general "How does optical e2e work in TRV?"
```

Expect: retrieved CONTEXT lines from local chunks. Models may still hallucinate — trust chunks over fluent lies.

## 5. Front door

```bash
bash scripts/trv.sh help
bash scripts/trv.sh pulse
```

## Reporting

Open an issue with: OS, Termux yes/no, command, full output, and whether you claim PROVEN reproduction or only SCAFFOLD smoke test.

Do **not** paste age secret keys or vault identity material.
