mod storage;
mod identity;
mod merkle;
mod p2p;
mod token;
#[cfg(feature = "runtime")]
mod runtime;

use std::sync::Arc;
use tokio::sync::Mutex;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    sodiumoxide::init().map_err(|_| anyhow::anyhow!("Failed to initialize sodiumoxide"))?;

    tracing::info!("[*] Initializing The Remote Viewer (sovereign mode)...");

    let _storage = Arc::new(storage::StorageEngine::new()?);
    tracing::info!("[+] Storage engine online");

    #[cfg(feature = "runtime")]
    {
        let node_store = runtime::LocalStateStore::open_default()
            .map_err(|e| anyhow::anyhow!("Failed to initialize sovereign node store: {e}"))?;
        tracing::info!("[+] Unified sovereign node store (sled) online");
        let _node_store = Arc::new(node_store);
    }

    let mut wot = identity::WebOfTrust::new();

    let (public_key, mut secret_key) = identity::WebOfTrust::generate_keypair();
    wot.provision_node(public_key.as_ref());
    identity::zeroize_secret_key(&mut secret_key);

    wot.set_local_did_placeholder("did:key:placeholder-scaffold".to_string());

    let _wot = Arc::new(Mutex::new(wot));
    tracing::info!("[+] Web of Trust + identity foundation online");

    let merkle = Arc::new(Mutex::new(merkle::StateMerkleTree::new()));
    tracing::info!("[+] Merkle state tree online");

    let _token_ledger = token::ArTokenLedger::new();
    tracing::info!("[+] AR Token ledger online");

    let merkle_for_p2p = merkle.clone();
    tokio::spawn(async move {
        if let Err(e) = p2p::start_gossip_daemon(merkle_for_p2p).await {
            tracing::error!("P2P gossip failed: {}", e);
        }
    });

    tracing::info!("[+] All core subsystems online — operating in sovereign zero-trust state");

    tokio::signal::ctrl_c().await?;
    tracing::info!("[*] Shutting down gracefully");
    Ok(())
}
