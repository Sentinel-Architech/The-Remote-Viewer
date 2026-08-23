//! Embedded state & identity store (sled).
//!
//! Public identity is always persisted. The 32-byte Ed25519 seed is stored
//! only on this device — Destroy = Restart. Callers must zeroize copies
//! after use.

use directories::ProjectDirs;
use hex::{decode as hex_decode, encode as hex_encode};
use sha2::{Digest, Sha256};
use sled::{Db, Result as SledResult};
use sodiumoxide::crypto::sign;
use std::path::{Path, PathBuf};
use zeroize::Zeroize;

const IDENTITY_PREFIX: &str = "identity:";
const NONCE_PREFIX: &str = "nonce:";

pub struct LocalStateStore {
    db: Db,
}

impl LocalStateStore {
    pub fn new<P: AsRef<Path>>(path: P) -> SledResult<Self> {
        let db = sled::open(path)?;
        Ok(Self { db })
    }

    pub fn open_default() -> SledResult<Self> {
        let path = ProjectDirs::from("com", "sentinel", "remote-viewer")
            .map(|p| p.data_dir().join("sled"))
            .unwrap_or_else(|| PathBuf::from("./sentinel_db"));
        let _ = std::fs::create_dir_all(&path);
        Self::new(path)
    }

    /// Persist pubkey → 32-byte secret seed. Local only.
    pub fn set_node_identity(&self, pubkey_hex: &str, secret_seed: &[u8]) -> SledResult<()> {
        self.db
            .insert(format!("{IDENTITY_PREFIX}{pubkey_hex}"), secret_seed)?;
        self.db.flush()?;
        Ok(())
    }

    pub fn get_node_identity(&self, pubkey_hex: &str) -> SledResult<Option<Vec<u8>>> {
        let val = self.db.get(format!("{IDENTITY_PREFIX}{pubkey_hex}"))?;
        Ok(val.map(|v| v.to_vec()))
    }

    /// Destroy = Restart. Removes the seed for this pubkey.
    pub fn destroy_node_identity(&self, pubkey_hex: &str) -> SledResult<()> {
        self.db.remove(format!("{IDENTITY_PREFIX}{pubkey_hex}"))?;
        self.db.flush()?;
        Ok(())
    }

    pub fn cache_auth_nonce(&self, nonce: &str) -> SledResult<()> {
        self.db
            .insert(format!("{NONCE_PREFIX}{nonce}"), b"valid".as_ref())?;
        Ok(())
    }

    pub fn is_nonce_used(&self, nonce: &str) -> SledResult<bool> {
        Ok(self.db.contains_key(format!("{NONCE_PREFIX}{nonce}"))?)
    }

    /// Provision a fresh Ed25519 node. Returns (pubkey_hex, seed). Caller zeroizes seed.
    pub fn provision_node(&self) -> anyhow::Result<(String, Vec<u8>)> {
        let (pk, mut sk) = sign::gen_keypair();
        let seed = sk.0[..32].to_vec();
        sk.0.zeroize();
        let pubkey_hex = hex_encode(pk.0);
        self.set_node_identity(&pubkey_hex, &seed)?;
        tracing::info!(
            "[+] Node identity provisioned {}",
            &pubkey_hex[..16.min(pubkey_hex.len())]
        );
        Ok((pubkey_hex, seed))
    }

    /// Sign a one-time nonce. Rejects replayed nonces.
    pub fn attest_challenge(&self, pubkey_hex: &str, nonce: &str) -> anyhow::Result<Attestation> {
        if self.is_nonce_used(nonce)? {
            anyhow::bail!("Nonce already consumed");
        }
        let Some(mut seed) = self.get_node_identity(pubkey_hex)? else {
            anyhow::bail!("Node identity not found in local state store.");
        };
        if seed.len() < 32 {
            seed.zeroize();
            anyhow::bail!("Corrupt seed length");
        }
        let seed_arr: [u8; 32] = seed[..32]
            .try_into()
            .map_err(|_| anyhow::anyhow!("seed"))?;
        let sign_seed =
            sign::Seed::from_slice(&seed_arr).ok_or_else(|| anyhow::anyhow!("bad seed"))?;
        seed.zeroize();
        let (pk, mut sk) = sign::keypair_from_seed(&sign_seed);
        let message = format!("TRV-NODE-ATTEST|1|{pubkey_hex}|{nonce}");
        let sig = sign::sign_detached(message.as_bytes(), &sk);
        sk.0.zeroize();
        self.cache_auth_nonce(nonce)?;
        Ok(Attestation {
            pubkey_hex: hex_encode(pk.0),
            nonce: nonce.to_string(),
            message,
            signature_hex: hex_encode(sig.as_ref()),
        })
    }

    pub fn execute_node_attestation(&self, pubkey_hex: &str) -> Result<String, String> {
        match self.get_node_identity(pubkey_hex) {
            Ok(Some(_)) => Ok(format!("Node verified: {pubkey_hex}")),
            _ => Err("Node identity not found in local state store.".into()),
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Attestation {
    pub pubkey_hex: String,
    pub nonce: String,
    pub message: String,
    pub signature_hex: String,
}

pub fn sha256_hex(bytes: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(bytes);
    hex_encode(h.finalize())
}

#[allow(dead_code)]
pub fn decode_hex(s: &str) -> anyhow::Result<Vec<u8>> {
    Ok(hex_decode(s)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmp_store() -> LocalStateStore {
        let dir = std::env::temp_dir().join(format!(
            "sentinel-sled-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let _ = std::fs::create_dir_all(&dir);
        LocalStateStore::new(&dir).expect("sled")
    }

    #[test]
    fn identity_roundtrip_and_nonce_replay() {
        let store = tmp_store();
        store
            .set_node_identity("abc", b"0123456789abcdef0123456789abcdef")
            .unwrap();
        assert_eq!(
            store.get_node_identity("abc").unwrap().unwrap(),
            b"0123456789abcdef0123456789abcdef"
        );
        assert!(!store.is_nonce_used("n1").unwrap());
        store.cache_auth_nonce("n1").unwrap();
        assert!(store.is_nonce_used("n1").unwrap());
        assert!(store.execute_node_attestation("abc").is_ok());
        assert!(store.execute_node_attestation("missing").is_err());
    }
}
