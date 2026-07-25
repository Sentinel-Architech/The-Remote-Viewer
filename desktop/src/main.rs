mod storage;
mod identity;
mod merkle;
mod p2p;
mod token;
use std::sync::Arc;
use tokio::sync::Mutex;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    // Logging
    tracing_subscriber::fmt::init();

    // Init crypto
    sodiumoxide::init().map_err(|_| anyhow::anyhow!("Failed to initialize sodiumoxide"))?;

    tracing::info!("[*] Initializing The Remote Viewer (sovereign mode)...");

    // Storage
    let storage = Arc::new(storage::StorageEngine::new()?);
    tracing::info!("[+] Storage engine online");

    // Web of Trust
    let mut wot = identity::WebOfTrust::new();
    wot.provision_node(&[0u8; 32]); // placeholder master key – replace later
    let _wot = Arc::new(Mutex::new(wot));

    // Merkle state tree
    let merkle = Arc::new(Mutex::new(merkle::StateMerkleTree::new()));

    // Start P2P gossip daemon
    let merkle_for_p2p = merkle.clone();
    tokio::spawn(async move {
        if let Err(e) = p2p::start_gossip_daemon(merkle_for_p2p).await {
            tracing::error!("P2P gossip failed: {}", e);
        }
    });

    tracing::info!("[+] All core subsystems online");

    // Keep running
    tokio::signal::ctrl_c().await?;
    tracing::info!("[*] Shutting down gracefully");
    Ok(())
}
