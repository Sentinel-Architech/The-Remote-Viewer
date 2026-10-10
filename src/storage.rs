use chacha20poly1305::{aead::{Aead, KeyInit}, ChaCha20Poly1305, Key, Nonce};
use std::fs;
use std::path::Path;

pub struct StorageEngine {
    key: Key,
    path: String,
}

impl StorageEngine {
    pub fn new() -> anyhow::Result<Self> {
        let key = Key::from_slice(b"an-example-32-byte-secret-key!!!");
        let path = "encrypted_cache.db";
        
        if !Path::new(path).exists() {
            fs::write(path, "")?;
        }

        Ok(Self { key: *key, path: path.to_string() })
    }

    pub fn store_encrypted_record(&self, id: &str, plaintext: &str) -> anyhow::Result<()> {
        let cipher = ChaCha20Poly1305::new(&self.key);
        let nonce_bytes: [u8; 12] = rand::random();
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes())
            .map_err(|e| anyhow::anyhow!("Encryption failed: {:?}", e))?;

        let mut packed = nonce_bytes.to_vec();
        packed.extend_from_slice(&ciphertext);

        use std::io::Write;
        let mut file = fs::OpenOptions::new()
            .append(true)
            .open(&self.path)?;
        
        writeln!(file, "ID: {} | DATA: {}", id, hex::encode(packed))?;
        Ok(())
    }

    pub fn get_decrypted_record(&self, target_id: &str) -> anyhow::Result<String> {
        let content = fs::read_to_string(&self.path)?;
        for line in content.lines() {
            if line.contains(&format!("ID: {}", target_id)) {
                if let Some(pos) = line.find(" | DATA: ") {
                    let hex_data = &line[pos + 9..];
                    let packed = hex::decode(hex_data)?;
                    if packed.len() < 12 {
                        anyhow::bail!("Invalid record length");
                    }
                    let (nonce_bytes, ciphertext) = packed.split_at(12);
                    let cipher = ChaCha20Poly1305::new(&self.key);
                    let nonce = Nonce::from_slice(nonce_bytes);
                    let plaintext_bytes = cipher.decrypt(nonce, ciphertext)
                        .map_err(|e| anyhow::anyhow!("Decryption failed: {:?}", e))?;
                    return Ok(String::from_utf8(plaintext_bytes)?);
                }
            }
        }
        anyhow::bail!("Record not found")
    }
}
