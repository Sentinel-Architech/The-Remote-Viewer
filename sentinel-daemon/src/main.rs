use ethers::{
    prelude::*,
    types::transaction::eip712::Eip712,
    utils::keccak256,
};
use fips204::mldsa65;
use fips204::traits::{SerDes, Signer};

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
    println!(" [Sentinel Daemon] Initializing Pure-Rust ML-DSA-65 Engine...");

    let ecdsa_key = "0x00000000000000000000000000000000000000000000000000000000000a11ce";
    let ecdsa_wallet: LocalWallet = ecdsa_key.parse::<LocalWallet>()?.with_chain_id(1u64);

    let (pk, sk) = mldsa65::try_keygen()?;

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
    let pqc_sig = sk.try_sign(&eip712_digest)?;

    println!(" [Sentinel Daemon] Hybrid Signatures Generated Successfully!");
    println!("    ECDSA Sig: 0x{}", hex::encode(ecdsa_sig.to_vec()));
    println!("    PQC (ML-DSA-65) Sig Bytes: {}", pqc_sig.len());

    Ok(())
}
