use std::sync::Arc;
use tokio::sync::Mutex;
use axum::{routing::get, Router, extract::State, response::IntoResponse};
use std::io::{self, Write};

mod storage;
mod identity;
mod merkle;
mod p2p;
mod token;
mod search;
mod agent;

#[derive(Clone)]
struct AppState {
    coordinator: Arc<agent::AgentCoordinator>,
}

async fn dapp_root_handler(State(state): State<AppState>) -> impl IntoResponse {
    match state.coordinator.execute_loop("zero trust architecture").await {
        Ok(res) => format!("=== The Remote Viewer Native DApp Node ===\n\n{}", res),
        Err(e) => format!("Node Error: {}", e),
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    tracing::info!("[*] Initializing The Remote Viewer");

    let storage = Arc::new(storage::StorageEngine::new()?);
    let mut wot = identity::WebOfTrust::new();
    wot.provision_node(&[0u8; 32]);

    let coordinator = Arc::new(agent::AgentCoordinator::new(Arc::clone(&storage)));
    let app_state = AppState { coordinator: Arc::clone(&coordinator) };

    // 1. Spawn Local DApp HTTP Server on loopback port 3000
    let app = Router::new()
        .route("/", get(dapp_root_handler))
        .with_state(app_state);

    tokio::spawn(async {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
        tracing::info!("[+] Native DApp active at http://127.0.0.1:3000");
        axum::serve(listener, app).await.unwrap();
    });

    // 2. Start P2P Gossip Daemon background worker
    let merkle_tree = Arc::new(Mutex::new(merkle::StateMerkleTree::new()));
    let merkle_for_p2p = Arc::clone(&merkle_tree);
    tokio::spawn(async move {
        if let Err(e) = p2p::start_gossip_daemon(merkle_for_p2p).await {
            tracing::error!("P2P gossip failed: {}", e);
        }
    });

    println!("\n=== The Remote Viewer Agent Online ===");
    println!("DApp endpoint listening locally at http://127.0.0.1:3000");
    println!("Type an objective/query and press Enter (or type 'exit' to quit):\n");

    loop {
        print!("agent> ");
        io::stdout().flush()?;

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let query = input.trim();

        if query.eq_ignore_ascii_case("exit") {
            println!("[*] Shutting down gracefully");
            break;
        }

        if query.is_empty() {
            continue;
        }

        match coordinator.execute_loop(query).await {
            Ok(response) => println!("\n{}\n", response),
            Err(e) => eprintln!("[-] Execution error: {}\n", e),
        }
    }

    Ok(())
}
