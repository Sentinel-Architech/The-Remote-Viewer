use sodiumoxide::crypto::sign;
use std::collections::HashSet;
use tracing::{info, warn};

/// Local-first Web of Trust
/// Keys are stored only on this device — no central authority.
pub struct WebOfTrust {
    trusted_keys: HashSet<[u8; sign::PUBLICKEYBYTES]>,
}

impl WebOfTrust {
    pub fn new() -> Self {
        Self {
            trusted_keys: HashSet::new(),
        }
    }

    /// Add a trusted public key to the local Web of Trust
    pub fn provision_node(&mut self, public_key: &[u8]) {
        if public_key.len() != sign::PUBLICKEYBYTES {
            warn!("[!] Invalid public key length — rejected");
            return;
        }

        let mut key_array = [0u8; sign::PUBLICKEYBYTES];
        key_array.copy_from_slice(public_key);
        self.trusted_keys.insert(key_array);

        info!("[*] New node provisioned into local Web of Trust");
    }

    /// Verify a signed packet against the local Web of Trust
    pub fn verify_packet(
        &self,
        payload: &[u8],
        signature_bytes: &[u8],
        public_key_bytes: &[u8],
    ) -> bool {
        if signature_bytes.len() != sign::SIGNATUREBYTES
            || public_key_bytes.len() != sign::PUBLICKEYBYTES
        {
            warn!("[!] Invalid signature or public key length");
            return false;
        }

        let mut key_array = [0u8; sign::PUBLICKEYBYTES];
        key_array.copy_from_slice(public_key_bytes);

        // Is this key in our local trust set?
        if !self.trusted_keys.contains(&key_array) {
            warn!("[!] REJECTED: Key not present in local Web of Trust");
            return false;
        }

        let pk = sign::PublicKey(key_array);
        let mut sig_array = [0u8; sign::SIGNATUREBYTES];
        sig_array.copy_from_slice(signature_bytes);
        let sig = sign::Signature(sig_array);

        // Cryptographic verification (Ed25519)
        let valid = sign::verify_detached(&sig, payload, &pk);

        if valid {
            info!("[+] Packet signature verified successfully");
        } else {
            warn!("[!] REJECTED: Invalid cryptographic signature");
        }

        valid
    }

    /// Optional helper: generate a new keypair (for future use)
    pub fn generate_keypair() -> (sign::PublicKey, sign::SecretKey) {
        sign::gen_keypair()
    }
}
