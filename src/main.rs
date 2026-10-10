use std::sync::Arc;
use tokio::sync::Mutex;
use axum::{routing::get, Router, extract::State, response::Html};
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

async fn dapp_ui_handler(State(_state): State<AppState>) -> Html<&'static str> {
    Html(r#"
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The Remote Viewer | Native DApp</title>
        <style>
            :root {
                --bg: #0d1117;
                --card: #161b22;
                --border: #30363d;
                --text: #c9d1d9;
                --accent: #58a6ff;
                --green: #3fb950;
            }
            body {
                background-color: var(--bg);
                color: var(--text);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                border-bottom: 1px solid var(--border);
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .status {
                color: var(--green);
                font-weight: bold;
                font-size: 0.9em;
            }
            .card {
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 16px;
            }
            h1 { font-size: 1.5em; color: var(--accent); margin: 0 0 8px 0; }
            p { margin: 4px 0; font-size: 0.95em; }
            .badge {
                display: inline-block;
                background: #21262d;
                border: 1px solid var(--border);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.8em;
                color: var(--accent);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>The Remote Viewer</h1>
                <span class="status">● Node Active & Local-First</span>
            </div>
            
            <div class="card">
                <h3>Subsystem Architecture</h3>
                <p><span class="badge">Encryption</span> ChaCha20-Poly1305 Local Storage</p>
                <p><span class="badge">Network</span> P2P Gossip & Merkle State Sync</p>
                <p><span class="badge">Agent</span> Dynamic Reasoning & Memory Recall</p>
            </div>

            <div class="card">
                <h3>Node Intelligence State</h3>
                <p>Local loopback endpoint connected to <code>127.0.0.1:3000</code>.</p>
                <p>Use your local agent terminal CLI to query or cache new intelligence.</p>
            </div>
        </div>
    </body>
    </html>
    "#)
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

    // 1. Spawn Local DApp HTTP Server with HTML UI
    let app = Router::new()
        .route("/", get(dapp_ui_handler))
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
    println!("DApp UI active locally at http://127.0.0.1:3000");
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
