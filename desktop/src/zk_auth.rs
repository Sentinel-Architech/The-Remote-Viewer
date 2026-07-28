use ark_bn254::Bn254;
use ark_groth16::{Groth16, Proof, VerifyingKey};
use ark_serialize::CanonicalDeserialize;
use ark_snark::SNARK;
use anyhow::{Context, Result};

pub struct ZkAuthValidator {
    verifying_key: VerifyingKey<Bn254>,
}

impl ZkAuthValidator {
    pub fn new(vk: VerifyingKey<Bn254>) -> Self {
        Self { verifying_key: vk }
    }

    /// Verify a Groth16 membership proof.
    /// Returns Ok(true) if the proof is valid, Ok(false) if invalid,
    /// or Err if the proof bytes cannot be deserialized.
    pub fn verify_node_proof(
        &self,
        proof_bytes: &[u8],
        _current_merkle_root: &[u8],
    ) -> Result<bool> {
        // Deserialize the succinct Groth16 proof. Fail closed on bad input.
        let proof = Proof::<Bn254>::deserialize_compressed(proof_bytes)
            .context("Failed to deserialize Groth16 proof")?;

        // Public inputs vector matching the circuit definition.
        // Placeholder until the real circuit is wired; do not claim verification yet.
        let public_inputs = vec![]; // TODO: convert Merkle root into field element(s)

        let is_authentic = Groth16::<Bn254>::verify(
            &self.verifying_key,
            &public_inputs,
            &proof,
        )
        .unwrap_or(false); // arkworks verify returns Result; treat error as invalid

        if is_authentic {
            tracing::info!("[+] ZK-PoA Verified: Anonymous node belongs to Web of Trust.");
        } else {
            tracing::warn!("[!] ZK-PoA REJECTED: Invalid membership proof.");
        }

        Ok(is_authentic)
    }
}
