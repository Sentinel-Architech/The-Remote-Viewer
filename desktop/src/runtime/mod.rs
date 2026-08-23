//! Unified sovereign node runtime.
//!
//! Local-first identity (sled), optional ollama-rs orchestration,
//! optional tract-onnx verifiable inference, optional Tauri IPC.
//!
//! Enable extras:
//! - `--features ollama`
//! - `--features zkml`
//! - `--features tauri-ipc`

pub mod store;
pub use store::LocalStateStore;

#[cfg(feature = "ollama")]
pub mod orchestrator;
#[cfg(feature = "ollama")]
pub use orchestrator::ModelOrchestrator;

#[cfg(feature = "zkml")]
pub mod inference;
#[cfg(feature = "zkml")]
pub use inference::VerifiableInferenceEngine;

#[cfg(feature = "tauri-ipc")]
pub mod ipc;
