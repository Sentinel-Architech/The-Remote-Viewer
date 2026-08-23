# Unified sovereign node runtime

**Status:** IN SOURCE (2026-08-23). Hub station ships in `apps/hub`. Desktop
sled store ships in `desktop/src/runtime`. Not PROVEN — has not yet run as
the desktop daemon on a device under user control.

The pasted unified runtime (sled identity, ollama-rs stream, tract-onnx
inference, Tauri `execute_node_attestation`) is now in the tree. It does
**not** replace the existing heed / sodiumoxide daemon.

## Surfaces

| Surface | Identity | Orchestrator | Inference |
|---------|----------|--------------|-----------|
| Hub `/hub/node` | IndexedDB (`sentinel-node`) Ed25519 via WebCrypto | **xAI grok-4.5** via existing `askSentinel` — **button press only** | Published linear twin `sentinel-zkml-linear-v1` + SHA-256 commitment |
| Desktop daemon | **sled** `identity:<pubkey>` next to heed | Feature `ollama` → ollama-rs llama3 at `127.0.0.1:11434` | Feature `zkml` → tract-onnx 0.21 `into_runnable` |
| Tauri shell | same sled | optional | optional |

Seeds never leave the device. Destroy = Restart.

## Cargo features

Default CI (`cargo check --manifest-path desktop/Cargo.toml`) enables
`runtime` = sled only. `ollama`, `zkml`, and `tauri-ipc` stay off so the
required cargo-check job does not pull those crates.

See [desktop/RUNTIME.md](../desktop/RUNTIME.md).

## What this is not

- Not a SNARK. The commitment is SHA-256 of a canonical string.
- Not cloud custody of keys. Hub accounts are a separate hosted surface.
- Not a silent LLM call. Hub generate is user-initiated and auth-gated.
- `TypedModel::run` is not the tract 0.21 API. Desktop uses `into_runnable()`.
