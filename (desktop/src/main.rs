mod storage;
mod identity;
mod merkle;
mod p2p;

use std::sync::Arc;
use tokio::sync::Mutex;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    sodiumoxide::init().map_err(|_| anyhow::anyhow!("Failed to init sodiumoxide"))?;

    tracing::info!("[*] Initializing The Remote Viewer...");

    let storage = Arc::new(storage::StorageEngine::new()?);
    tracing::info!("[+] Storage online");

    let mut wot = identity::WebOfTrust::new();
    wot.provision_node(&[0u8; 32]); // placeholder key
    let _wot = Arc::new(Mutex::new(wot));

    let merkle = Arc::new(Mutex::new(merkle::StateMerkleTree::new()));

    // Start P2P gossip
    let merkle_clone = merkle.clone();
    tokio::spawn(async move {
        if let Err(e) = p2p::start_gossip_daemon(merkle_clone).await {
            tracing::error!("P2P error: {}", e);
        }
    });

    tracing::info!("[+] All systems online (sovereign mode)");

    tokio::signal::ctrl_c().await?;
    tracing::info!("[*] Shutting down gracefully");
    Ok(())
}
