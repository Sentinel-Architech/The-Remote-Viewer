use std::sync::Arc;
use tokio::sync::Mutex;
use axum::{
    routing::{get, post},
    Router,
    extract::State,
    response::Html,
    Json,
};
use serde::{Deserialize, Serialize};
use std::path::Path;

mod storage;
mod identity;
mod merkle;
mod p2p;
mod token;
mod search;
mod agent;
pub mod migration;

#[derive(Clone)]
struct AppState {
    coordinator: Arc<agent::AgentCoordinator>,
    posts: Arc<Mutex<Vec<migration::parser::LegacyPost>>>,
}

#[derive(Deserialize)]
struct ImportPayload {
    content: String,
    author_handle: String,
}

#[derive(Serialize)]
struct ApiResponse {
    status: String,
    count: usize,
}

async fn get_posts_handler(State(state): State<AppState>) -> Json<Vec<migration::parser::LegacyPost>> {
    let posts = state.posts.lock().await;
    Json(posts.clone())
}

async fn add_post_handler(
    State(state): State<AppState>,
    Json(payload): Json<ImportPayload>,
) -> Json<ApiResponse> {
    let mut posts = state.posts.lock().await;
    let new_post = migration::parser::LegacyPost {
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        content: payload.content,
        author_handle: payload.author_handle,
    };
    posts.insert(0, new_post);
    ApiResponse {
        status: "success".to_string(),
        count: posts.len(),
    }.into()
}

async fn dapp_ui_handler() -> Html<&'static str> {
    Html(r#"
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The Remote Viewer | Interactive Node</title>
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
            .container { max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 20px; }
            .status { color: var(--green); font-weight: bold; font-size: 0.9em; }
            .card { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 16px; margin-bottom: 16px; }
            h1 { font-size: 1.5em; color: var(--accent); margin: 0 0 8px 0; }
            input, textarea, button {
                width: 100%; box-sizing: border-box; background: #0d1117; border: 1px solid var(--border);
                color: var(--text); padding: 10px; border-radius: 4px; margin-top: 8px; font-family: inherit;
            }
            button { background: #238636; color: white; font-weight: bold; cursor: pointer; border: none; margin-top: 12px; }
            button:hover { background: #2ea043; }
            .btn-secondary { background: #30363d; }
            .btn-secondary:hover { background: #8b949e; }
            .post-item { background: #21262d; border: 1px solid var(--border); border-radius: 4px; padding: 10px; margin-top: 8px; }
            .author { color: var(--accent); font-size: 0.85em; font-weight: bold; }
            .url-display { font-family: monospace; background: #0d1117; padding: 8px; border: 1px solid var(--border); border-radius: 4px; color: var(--accent); word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>The Remote Viewer</h1>
                <span class="status">● Decentralized Node Active</span>
            </div>

            <div class="card">
                <h3>Node Sharing & Network Access</h3>
                <p style="font-size: 0.85em; color: #8b949e;">Share your local node address with peers on your network:</p>
                <div class="url-display" id="node-url">Loading address...</div>
                <button class="btn-secondary" onclick="copyNodeUrl()">Copy Share Link</button>
            </div>

            <div class="card">
                <h3>Local Web2 Migration Console</h3>
                <input type="text" id="author" placeholder="Author Handle (e.g. Architech)" value="Architech">
                <textarea id="content" rows="3" placeholder="Enter social post content to migrate..."></textarea>
                <button onclick="submitPost()">Ingest to Local Zero-Trust Feed</button>
            </div>

            <div class="card">
                <h3>Migrated Social Feed</h3>
                <div id="feed"><p style="color: #8b949e;">Loading local feed...</p></div>
            </div>
        </div>

        <script>
            const hostUrl = window.location.protocol + '//' + window.location.host;
            document.getElementById('node-url').innerText = hostUrl;

            function copyNodeUrl() {
                navigator.clipboard.writeText(hostUrl);
                alert('Node URL copied to clipboard: ' + hostUrl);
            }

            async function loadFeed() {
                const res = await fetch('/api/posts');
                const posts = await res.json();
                const feedEl = document.getElementById('feed');
                if (posts.length === 0) {
                    feedEl.innerHTML = '<p style="color: #8b949e;">No local posts ingested yet.</p>';
                    return;
                }
                feedEl.innerHTML = posts.map(p => `
                    <div class="post-item">
                        <div class="author">@${p.author_handle}</div>
                        <div>${p.content}</div>
                    </div>
                `).join('');
            }

            async function submitPost() {
                const author = document.getElementById('author').value;
                const content = document.getElementById('content').value;
                if (!content) return;

                await fetch('/api/ingest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ author_handle: author, content: content })
                });

                document.getElementById('content').value = '';
                loadFeed();
            }

            loadFeed();
        </script>
    </body>
    </html>
    "#)
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let storage = Arc::new(storage::StorageEngine::new()?);
    let coordinator = Arc::new(agent::AgentCoordinator::new(Arc::clone(&storage)));

    let initial_posts = migration::parser::MigrationParser::parse_json_export(Path::new("test_export.json"))
        .unwrap_or_default();

    let app_state = AppState {
        coordinator,
        posts: Arc::new(Mutex::new(initial_posts)),
    };

    let app = Router::new()
        .route("/", get(dapp_ui_handler))
        .route("/api/posts", get(get_posts_handler))
        .route("/api/ingest", post(add_post_handler))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("[+] Interactive DApp active on 0.0.0.0:3000");
    
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
