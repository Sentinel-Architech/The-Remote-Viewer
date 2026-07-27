use sodiumoxide::crypto::sign;
use std::collections::HashSet;
use tracing::{info, warn};

/// Local-first Web of Trust + Identity foundation
/// 
/// Rules (locked principles):
/// - Keys live only on this device
/// - No central authority
/// - Destroy = Restart from Square One
/// - Still scaffold — real DID/VC work comes in Phase 1
pub struct WebOfTrust {
    trusted_keys: HashSet<[u8; sign::PUBLICKEYBYTES]>,
    /// Placeholder for future local DID
    local_did: Option<String>,
}

impl WebOfTrust {
    pub fn new() -> Self {
        Self {
            trusted_keys: HashSet::new(),
            local_did: None,
        }
    }

    /// Provision a node into the local Web of Trust
    pub fn provision_node(&mut self, public_key: &[u8]) {
        if public_key.len() != sign::PUBLICKEYBYTES {
            warn!("[!] Invalid public key length — rejected");
            return;
        }

        let mut key_array = [0u8; sign::PUBLICKEYBYTES];
        key_array.copy_from_slice(public_key);
        self.trusted_keys.insert(key_array);

        info!("[*] Node provisioned into local Web of Trust");
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

        if !self.trusted_keys.contains(&key_array) {
            warn!("[!] REJECTED: Key not present in local Web of Trust");
            return false;
        }

        let pk = sign::PublicKey(key_array);
        let mut sig_array = [0u8; sign::SIGNATUREBYTES];
        sig_array.copy_from_slice(signature_bytes);
        let sig = sign::Signature(sig_array);

        let valid = sign::verify_detached(&sig, payload, &pk);

        if valid {
            info!("[+] Packet signature verified successfully");
        } else {
            warn!("[!] REJECTED: Invalid cryptographic signature");
        }

        valid
    }

    /// Generate a new Ed25519 keypair (for future Phase 1 DID use)
    pub fn generate_keypair() -> (sign::PublicKey, sign::SecretKey) {
        sign::gen_keypair()
    }

    /// Placeholder — real DID creation comes in Phase 1
    pub fn set_local_did_placeholder(&mut self, did: String) {
        self.local_did = Some(did);
        info!("[*] Local DID placeholder set (scaffold only)");
    }

    pub fn local_did(&self) -> Option<&str> {
        self.local_did.as_deref()
    }
}

impl Default for WebOfTrust {
    fn default() -> Self {
        Self::new()
    }
}
