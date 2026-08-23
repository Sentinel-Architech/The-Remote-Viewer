//! Tauri IPC command bridge (feature `tauri-ipc`).
//! Does not replace the existing tokio daemon in `main.rs`.

use super::store::LocalStateStore;

pub struct AppState {
    pub state_store: LocalStateStore,
    #[cfg(feature = "ollama")]
    pub orchestrator: super::ModelOrchestrator,
}

#[tauri::command]
async fn execute_node_attestation(
    state: tauri::State<'_, AppState>,
    pubkey_hex: String,
) -> Result<String, String> {
    state.state_store.execute_node_attestation(&pubkey_hex)
}

#[tauri::command]
async fn provision_node(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let (pubkey, mut seed) = state
        .state_store
        .provision_node()
        .map_err(|e| e.to_string())?;
    seed.fill(0);
    Ok(pubkey)
}

#[tauri::command]
async fn attest_node(
    state: tauri::State<'_, AppState>,
    pubkey_hex: String,
    nonce: String,
) -> Result<super::store::Attestation, String> {
    state
        .state_store
        .attest_challenge(&pubkey_hex, &nonce)
        .map_err(|e| e.to_string())
}

#[cfg(feature = "ollama")]
#[allow(dead_code)]
#[tauri::command]
async fn generate_stream(
    state: tauri::State<'_, AppState>,
    prompt: String,
) -> Result<String, String> {
    let mut out = String::new();
    state
        .orchestrator
        .generate_stream_response(prompt, |chunk| out.push_str(&chunk))
        .await
        .map_err(|e| e.to_string())?;
    Ok(out)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state_store =
        LocalStateStore::open_default().expect("Failed to initialize state store");

    #[cfg(feature = "ollama")]
    let orchestrator = super::ModelOrchestrator::local_llama3();

    tauri::Builder::default()
        .manage(AppState {
            state_store,
            #[cfg(feature = "ollama")]
            orchestrator,
        })
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let _ = handle;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            execute_node_attestation,
            provision_node,
            attest_node,
        ])
        .run(tauri::generate_context())
        .expect("error while running unified sentinel runtime");
}
