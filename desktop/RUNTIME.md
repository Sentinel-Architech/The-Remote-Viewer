# Unified sovereign node runtime

The desktop crate (`desktop/`) now carries the Sentinel Security Protocol
unified runtime **next to** the existing heed / sodiumoxide daemon.

Default `cargo check --manifest-path desktop/Cargo.toml` (CI) compiles
**sled identity + nonce replay only**. Heavy deps stay feature-gated.

| Feature | Crate | What it does |
|---------|--------|----------------|
| `runtime` **(default)** | `sled` | `LocalStateStore` — identity seed, nonce cache, replay reject |
| `ollama` | `ollama-rs` 0.2 | `ModelOrchestrator` streams llama3 from 127.0.0.1:11434 |
| `zkml` | `tract-onnx` 0.21 | `VerifiableInferenceEngine` — ONNX run + SHA-256 commitment |
| `tauri-ipc` | `tauri` 2 | `execute_node_attestation` / provision / attest commands |

```bash
cargo check --manifest-path desktop/Cargo.toml
cargo run   --manifest-path desktop/Cargo.toml --features ollama
cargo run   --manifest-path desktop/Cargo.toml --features zkml
cargo run   --manifest-path desktop/Cargo.toml --features tauri-ipc
```

Identity is local. Destroy = Restart. Hub station `/hub/node` uses IndexedDB, not sled.
Desktop talks to your Ollama. Hub talks to xAI grok-4.5 only on Generate (auth-gated).
zkML is a SHA-256 commitment, not a SNARK. tract 0.21 uses `into_runnable()`.

See [docs/SOVEREIGN-NODE-RUNTIME.md](../docs/SOVEREIGN-NODE-RUNTIME.md).
