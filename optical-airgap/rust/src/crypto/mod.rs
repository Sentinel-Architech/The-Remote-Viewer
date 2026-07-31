//! age helpers — interoperable with Go age, rage, and TS age-encryption.

use age::x25519::{Identity, Recipient};
use age::{Decryptor, Encryptor};
use std::io::{Read, Write};
use zeroize::Zeroize;

use crate::{Result, TrvError};

pub struct AgeKeyPair {
    pub identity: Identity,
    pub recipient: Recipient,
}

impl AgeKeyPair {
    pub fn generate() -> Self {
        let identity = Identity::generate();
        let recipient = identity.to_public();
        Self {
            identity,
            recipient,
        }
    }
}

pub fn generate_identity_pair() -> AgeKeyPair {
    AgeKeyPair::generate()
}

pub fn encrypt_for_recipient(plaintext: &[u8], recipient: &Recipient) -> Result<Vec<u8>> {
    let encryptor = Encryptor::with_recipients(std::iter::once(recipient as &dyn age::Recipient))
        .map_err(|e| TrvError::Age(e.to_string()))?;
    let mut ciphertext = Vec::new();
    {
        let mut writer = encryptor
            .wrap_output(&mut ciphertext)
            .map_err(|e| TrvError::Age(e.to_string()))?;
        writer
            .write_all(plaintext)
            .map_err(|e| TrvError::Age(e.to_string()))?;
        writer
            .finish()
            .map_err(|e| TrvError::Age(e.to_string()))?;
    }
    Ok(ciphertext)
}

pub fn decrypt_blob(ciphertext: &[u8], identity: &Identity) -> Result<Vec<u8>> {
    let decryptor = match Decryptor::new(ciphertext).map_err(|e| TrvError::Age(e.to_string()))? {
        Decryptor::Recipients(d) => d,
        _ => return Err(TrvError::Age("passphrase file not supported here".into())),
    };
    let mut reader = decryptor
        .decrypt(std::iter::once(identity as &dyn age::Identity))
        .map_err(|e| TrvError::Age(e.to_string()))?;
    let mut plaintext = Vec::new();
    reader
        .read_to_end(&mut plaintext)
        .map_err(|e| TrvError::Age(e.to_string()))?;
    Ok(plaintext)
}

/// Best-effort wipe of a secret buffer.
pub fn secure_zero(buf: &mut [u8]) {
    buf.zeroize();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn age_roundtrip() {
        let kp = generate_identity_pair();
        let msg = b"TRV rust age smoke";
        let ct = encrypt_for_recipient(msg, &kp.recipient).unwrap();
        let pt = decrypt_blob(&ct, &kp.identity).unwrap();
        assert_eq!(pt, msg);
    }
}
