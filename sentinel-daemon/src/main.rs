use ethers::{
    prelude::*,
    utils::keccak256,
};
use pqcrypto_dilithium::dilithium3::{detached_sign, keypair};
use pqcrypto_traits::sign::{PublicKey as _, SecretKey as _, DetachedSignature as _};

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
    println!(" [Sentinel Daemon] Initializing Hybrid ECDSA + Post-Quantum (Dilithium3) Engine...");

    // 1. Classic ECDSA Setup
    let ecdsa_key = "0x00000000000000000000000000000000000000000000000000000000000a11ce";
    let ecdsa_wallet: LocalWallet = ecdsa_key.parse::<LocalWallet>()?.with_chain_id(1u64);

    // 2. Post-Quantum Keypair Generation (Dilithium3)
    let (pqc_pk, pqc_sk) = keypair();

    println!(" [Sentinel Daemon] ECDSA Signer: {:?}", ecdsa_wallet.address());
    println!(" [Sentinel Daemon] PQC Public Key (Bytes): {}", pqc_pk.as_bytes().len());

    // 3. Construct Authorization Action
    let action = SentinelAction {
        target: "0x1111111111111111111111111111111111111111".parse()?,
        payload_hash: keccak256(b"EMERGENCY_PAUSE_DEPOSIT_VAULT"),
        nonce: U256::from(1),
        deadline: U256::from(1700000000u64),
    };

    // 4. Generate Classic ECDSA EIP-712 Signature
    let ecdsa_sig = ecdsa_wallet.sign_typed_data(&action).await?;

    // 5. Generate Quantum-Resistant Detached Signature over EIP-712 Digest
    let eip712_digest = action.encode_eip712()?;
    let pqc_sig = detached_sign(&eip712_digest, &pqc_sk);

    println!(" [Sentinel Daemon] Hybrid Signatures Generated Successfully!");
    println!("    ECDSA Sig: 0x{}", hex::encode(ecdsa_sig.to_vec()));
    println!("    PQC (Dilithium3) Sig Bytes: {}", pqc_sig.as_bytes().len());

    Ok(())
}
