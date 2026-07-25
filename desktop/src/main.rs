mod storage;
mod identity;
mod merkle;
mod p2p;
mod nullifier_cache;
mod ota;

use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    tracing::info!("[*] Initializing The Remote Viewer Master Orchestrator...");

    let storage_engine = Arc::new(storage::StorageEngine::new()?);
    tracing::info!("[+] Storage engine online");

    let mut wot = identity::WebOfTrust::new();
    wot.provision_node(&[0u8; 32]);
    let wot = Arc::new(Mutex::new(wot));

    let merkle_tree = Arc::new(Mutex::new(merkle::StateMerkleTree::new()));

    let (tx, _rx) = broadcast::channel(100);

    let gossip_merkle = merkle_tree.clone();
    tokio::spawn(async move {
        if let Err(e) = p2p::start_gossip_daemon(gossip_merkle).await {
            tracing::error!("P2P gossip error: {:?}", e);
        }
    });

    tracing::info!("[+] All subsystems online. Operating in sovereign zero-trust state.");

    tokio::signal::ctrl_c().await?;
    tracing::info!("[*] Shutting down orchestrator gracefully.");

    Ok(())
}
