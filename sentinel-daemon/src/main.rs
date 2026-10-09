use ethers::{
    prelude::*,
    utils::keccak256,
};

#[derive(Eip712, EthAbiType, Clone, Debug)]
#[eip712(
    name = "TheSentinelSecurityProtocol",
    version = "1.0.0",
    chain_id = 1,
    verifying_contract = "0x0000000000000000000000000000000000000000"
)]
struct SentinelAction {
    target: Address,
    payload_hash: [u8; 32],
    nonce: U256,
    deadline: U256,
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    println!(" [Sentinel Daemon] Starting zero-trust authorization service...");

    let signer_key = "0x00000000000000000000000000000000000000000000000000000000000a11ce";
    let wallet: LocalWallet = signer_key.parse::<LocalWallet>()?.with_chain_id(1u64);

    println!(" [Sentinel Daemon] Signer Address: {:?}", wallet.address());

    let target_vault: Address = "0x1111111111111111111111111111111111111111".parse()?;
    let action_payload = keccak256(b"DEPOSIT_WETH_1000");
    let nonce = U256::from(1);
    let deadline = U256::from(1700000000u64);

    let action = SentinelAction {
        target: target_vault,
        payload_hash: action_payload,
        nonce,
        deadline,
    };

    let signature = wallet.sign_typed_data(&action).await?;
    println!(" [Sentinel Daemon] Signed Action Payload Successfully!");
    println!("    Signature: 0x{}", hex::encode(signature.to_vec()));

    Ok(())
}
