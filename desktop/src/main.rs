mod storage;
mod identity;
mod merkle;
mod p2p;
mod nullifier_cache;
mod ota;
// mod zk_auth;        // enable later when you add the zk feature
// mod ws_server;

use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt::init();

    tracing::info!("[*] Initializing The Remote Viewer Master Orchestrator...");

    // 1. Initialize storage
    let storage_engine = Arc::new(storage::StorageEngine::new()?);
    tracing::info!("[+] Storage engine online");

    // 2. Initialize Web-of-Trust
    let mut wot = identity::WebOfTrust::new();
    // Example: provision a placeholder master key (replace with real key later)
    wot.provision_node(&[0u8; 32]);
    let wot = Arc::new(Mutex::new(wot));

    // 3. Initialize Merkle tree
    let merkle_tree = Arc::new(Mutex::new(merkle::StateMerkleTree::new()));

    // 4. Broadcast channel for future WebSocket dashboard
    let (tx, _rx) = broadcast::channel(100);

    // 5. Spawn P2P gossip daemon
    let gossip_merkle = merkle_tree.clone();
    tokio::spawn(async move {
        if let Err(e) = p2p::start_gossip_daemon(gossip_merkle).await {
            tracing::error!("P2P gossip error: {:?}", e);
        }
    });

    tracing::info!("[+] All subsystems online. Operating in sovereign zero-trust state.");

    // Keep the process alive
    tokio::signal::ctrl_c().await?;
    tracing::info!("[*] Shutting down orchestr
