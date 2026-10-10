use crate::storage::StorageEngine;
use crate::search;
use std::sync::Arc;

pub struct AgentCoordinator {
    storage: Arc<StorageEngine>,
}

impl AgentCoordinator {
    pub fn new(storage: Arc<StorageEngine>) -> Self {
        Self { storage }
    }

    pub async fn execute_loop(&self, objective: &str) -> anyhow::Result<String> {
        tracing::info!("[*] Agent Reasoning: Evaluating objective -> '{}'", objective);

        // Step 1: Check local encrypted memory tool first (zero-trust offline recall)
        match self.storage.get_decrypted_record("search_001") {
            Ok(cached_data) => {
                tracing::info!("[+] Tool Selection [Memory]: Retrieved verified intelligence from local encrypted store.");
                return Ok(format!("(Memory Tool Result):\n{}", cached_data));
            }
            Err(_) => {
                tracing::info!("[*] Tool Selection [Memory]: No valid local cache found. Escalating to live tools.");
            }
        }

        // Step 2: Fallback to live search tool if local memory misses (with explicit error mapping)
        tracing::info!("[*] Tool Selection [Web Scraper]: Executing live query against DuckDuckGo endpoint.");
        let live_results = search::execute_live_search(objective)
            .await
            .map_err(|e| anyhow::anyhow!("Search error: {}", e))?;

        // Step 3: Persist new intelligence back to encrypted local storage
        self.storage.store_encrypted_record("search_001", &live_results)?;
        tracing::info!("[+] Tool Action [Storage]: Encrypted and committed live tool output to local cache.");

        Ok(format!("(Web Scraper Tool Result):\n{}", live_results))
    }
}
