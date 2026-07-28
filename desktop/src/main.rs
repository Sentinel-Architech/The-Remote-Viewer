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

    // 1. Storage
    let storage = Arc::new(storage::StorageEngine::new()?);
    tracing::info!("[+] Storage engine online");

    // 2. Web of Trust + Identity foundation
    let mut wot = identity::WebOfTrust::new();

    // Generate a real keypair. Secret key is zeroized immediately after we take the public key.
    let (public_key, mut secret_key) = identity::WebOfTrust::generate_keypair();
    wot.provision_node(public_key.as_ref());
    identity::zeroize_secret_key(&mut secret_key); // destroy secret material as soon as possible

    // Set a scaffold-only DID placeholder (Phase 1 will replace this)
    wot.set_local_did_placeholder("did:key:placeholder-scaffold".to_string());

    let wot = Arc::new(Mutex::new(wot));
    tracing::info!("[+] Web of Trust + identity foundation online");

    // 3. Merkle state tree
    let merkle = Arc::new(Mutex::new(merkle::StateMerkleTree::new()));
    tracing::info!("[+] Merkle state tree online");

    // 4. AR Token ledger
    let _token_ledger = token::ArTokenLedger::new();
    tracing::info!("[+] AR Token ledger online");

    // 5. Start P2P gossip daemon
    let merkle_for_p2p = merkle.clone();
    tokio::spawn(async move {
        if let Err(e) = p2p::start_gossip_daemon(merkle_for_p2p).await {
            tracing::error!("P2P gossip failed: {}", e);
        }
    });

    tracing::info!("[+] All core subsystems online — operating in sovereign zero-trust state");

    // Keep the process alive
    tokio::signal::ctrl_c().await?;
    tracing::info!("[*] Shutting down gracefully");
    Ok(())
}
