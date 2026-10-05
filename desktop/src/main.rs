mod storage;
mod identity;
mod merkle;
mod p2p;
mod token;
mod minimind;
mod minimind_exec;
#[cfg(feature = "runtime")]
mod runtime;

use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use anyhow::Result;

fn measure_weights_and_exit() -> Result<()> {
    let mut args = std::env::args().skip(1);
    let mut explicit = None;
    while let Some(arg) = args.next() {
        if arg == "--measure-weights" {
            explicit = args.next().map(PathBuf::from);
            break;
        }
    }
    let measure = minimind::measure_first_present(explicit.as_deref())
        .map_err(|err| anyhow::anyhow!(err))?;
    println!("{}", minimind::report(&measure));
    if !measure.matches_shipped {
        std::process::exit(1);
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    if std::env::args().any(|arg| arg == "--measure-weights") {
        return measure_weights_and_exit();
    }
    if std::env::args().any(|arg| arg == "--run-minimind") {
        return minimind_exec::run_and_exit();
    }

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
