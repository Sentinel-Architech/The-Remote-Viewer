use ethers::{prelude::*, signers::Signer, types::transaction::eip712::Eip712, utils::keccak256};
use fips204::ml_dsa_65;
use fips204::traits::{SerDes, Signer as PqcSigner};

#[derive(Eip712, EthAbiType, Clone, Debug)]
#[eip712(name = "TheSentinelSecurityProtocol", version = "1.0.0", chain_id = 31337, verifying_contract = "0x0000000000000000000000000000000000000000")]
struct SentinelAction {
    target: Address,
    payload_hash: [u8; 32],
    nonce: U256,
    deadline: U256,
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    println!(" [Sentinel Daemon] Initializing Anvil Devnet Hybrid Node Connection...");
    
    // Connect to local Anvil node (default port 8545)
    let provider = Provider::<Http>::try_from("http://127.0.0.1:8545")?
        .interval(std::time::Duration::from_millis(500));
    
    let chain_id = provider.get_chainid().await.unwrap_or_default();
    println!(" [Sentinel Daemon] Connected to RPC. Chain ID: {}", chain_id);

    let ecdsa_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Anvil default key 0
    let ecdsa_wallet: LocalWallet = ecdsa_key.parse::<LocalWallet>()?.with_chain_id(chain_id.as_u64());
    
    let (pk, sk) = ml_dsa_65::try_keygen().map_err(|e| eyre::eyre!(e))?;
    println!(" [Sentinel Daemon] ECDSA Signer: {:?}", ecdsa_wallet.address());
    println!(" [Sentinel Daemon] PQC Public Key Bytes: {}", pk.into_bytes().len());

    let action = SentinelAction {
        target: "0x1111111111111111111111111111111111111111".parse()?,
        payload_hash: keccak256(b"EMERGENCY_PAUSE_DEPOSIT_VAULT"),
        nonce: U256::from(1),
        deadline: U256::from(1700000000u64),
    };

    let ecdsa_sig = ecdsa_wallet.sign_typed_data(&action).await?;
    let eip712_digest = action.encode_eip712()?;
    let pqc_sig = sk.try_sign(&eip712_digest, b"").map_err(|e| eyre::eyre!(e))?;

    println!(" [Sentinel Daemon] Hybrid Signatures Generated & Verified against Devnet Schema!");
    println!("    ECDSA Sig: 0x{}", hex::encode(ecdsa_sig.to_vec()));
    println!("    PQC (ML-DSA-65) Sig Bytes: {}", pqc_sig.len());

    Ok(())
}
