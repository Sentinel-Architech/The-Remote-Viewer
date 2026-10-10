use std::sync::Arc;
use tokio::sync::Mutex;
use crate::merkle::StateMerkleTree;

pub async fn start_gossip_daemon(_tree: Arc<Mutex<StateMerkleTree>>) -> anyhow::Result<()> {
    Ok(())
}
