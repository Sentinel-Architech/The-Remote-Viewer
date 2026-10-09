use ethers::{
    contract::abigen,
    providers::{Provider, StreamExt, Ws},
    types::Address,
};
use std::sync::Arc;

// Generate type-safe bindings for The Sentinel Protocol event interface
abigen!(
    TheSentinelProtocol,
    r#"[
        event EmergencyPauseTriggered(address indexed reporter)
        event EmergencyUnpaused(address indexed admin)
    ]"#
);

#[tokio::main]
async fn main() -> eyre::Result<()> {
    println!(" [Sentinel Daemon] Initializing real-time WebSocket event listener...");

    // Replace with your local or remote EVM WebSocket RPC endpoint
    let wss_url = "wss://eth-mainnet.g.alchemy.com/v2/your-api-key";
    let provider = Provider::<Ws>::connect(wss_url).await?;
    let client = Arc::new(provider);

    // Target deployed Sentinel Security Protocol address
    let sentinel_address: Address = "0x0000000000000000000000000000000000000000".parse()?;
    let contract = TheSentinelProtocol::new(sentinel_address, client);

    println!(" [Sentinel Daemon] Monitoring contract events at: {:?}", sentinel_address);

    // Subscribe to EmergencyPauseTriggered events
    let events = contract.event::<EmergencyPauseTriggeredFilter>();
    let mut stream = events.stream().await?;

    while let Some(Ok(log)) = stream.next().await {
        println!(" [ALERT] Emergency Pause Triggered!");
        println!("    Reporter Address: {:?}", log.reporter);
        // Trigger local zero-trust revocation / shutdown sequence here
    }

    Ok(())
}
