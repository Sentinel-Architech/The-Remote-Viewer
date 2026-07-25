use anyhow::{Context, Result};
use std::collections::HashSet;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::UdpSocket;
use tokio::sync::Mutex;
use crate::merkle::StateMerkleTree;

const GOSSIP_PORT: u16 = 9999;
const MULTICAST_ADDR: &str = "224.0.0.251";
const ANNOUNCE_INTERVAL_SECS: u64 = 5;

pub async fn start_gossip_daemon(state: Arc<Mutex<StateMerkleTree>>) -> Result<()> {
    let socket = UdpSocket::bind(format!("0.0.0.0:{}", GOSSIP_PORT))
        .await
        .context("Failed to bind gossip socket")?;

    socket
        .join_multicast_v4(MULTICAST_ADDR.parse()?, "0.0.0.0".parse()?)
        .context("Failed to join multicast group")?;

    let socket = Arc::new(socket);
    let known_peers = Arc::new(Mutex::new(HashSet::<SocketAddr>::new()));

    // === Broadcaster task ===
    {
        let socket = socket.clone();
        let state = state.clone();
        tokio::spawn(async move {
            loop {
                let root = {
                    let tree = state.lock().await;
                    tree.root_hash.clone()
                };

                let msg = format!("ROOT|{}", root);
                let _ = socket
                    .send_to(msg.as_bytes(), format!("{}:{}", MULTICAST_ADDR, GOSSIP_PORT))
                    .await;

                tokio::time::sleep(tokio::time::Duration::from_secs(ANNOUNCE_INTERVAL_SECS)).await;
            }
        });
    }

    // === Listener task ===
    let mut buf = [0u8; 1024];
    loop {
        let (len, peer_addr) = socket.recv_from(&mut buf).await?;
        let msg = String::from_utf8_lossy(&buf[..len]);

        // Track the peer
        {
            let mut peers = known_peers.lock().await;
            peers.insert(peer_addr);
        }

        if let Some(peer_root) = msg.strip_prefix("ROOT|") {
            let local_root = {
                let tree = state.lock().await;
                tree.root_hash.clone()
            };

            if peer_root != local_root && !local_root.is_empty() {
                tracing::info!(
                    "[*] State mismatch with {} (theirs: {} | ours: {})",
                    peer_addr,
                    &peer_root[..8.min(peer_root.len())],
                    &local_root[..8.min(local_root.len())]
                );
                // Future: trigger proper state sync here
            }
        }
    }
}
