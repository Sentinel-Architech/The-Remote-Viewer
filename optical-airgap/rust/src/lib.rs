//! TRV optical air-gap — Rust path
//!
//! Encrypt-first (age) → reversible histogram shifting → LT TRVL frames.

pub mod crypto;
pub mod fountain;
pub mod identity;
pub mod rdh;

pub use crypto::{decrypt_blob, encrypt_for_recipient, generate_identity_pair, AgeKeyPair};
pub use fountain::frame::{decode_lt_frame, encode_lt_frame, LtFrameMeta, LtSymbol};
pub use fountain::lt::{LtDecoder, LtEncoder};
pub use identity::{generate_local_address, is_valid_local_address};
pub use rdh::histogram::{embed_histogram_shifting, estimate_capacity, extract_histogram_shifting};

use thiserror::Error;

#[derive(Debug, Error)]
pub enum TrvError {
    #[error("age: {0}")]
    Age(String),
    #[error("rdh: {0}")]
    Rdh(String),
    #[error("frame: {0}")]
    Frame(String),
    #[error("io: {0}")]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, TrvError>;

/// age encrypt then RDH-embed into cover. Fails if capacity insufficient.
pub fn encrypt_then_rdh(
    plaintext: &[u8],
    recipient: &age::x25519::Recipient,
    cover: &[u8],
) -> Result<(Vec<u8>, rdh::histogram::RdhEmbedResult)> {
    let ciphertext = encrypt_for_recipient(plaintext, recipient)?;
    let embedded = embed_histogram_shifting(cover, &ciphertext)?;
    Ok((ciphertext, embedded))
}
