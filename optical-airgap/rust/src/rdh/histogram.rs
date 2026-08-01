//! Histogram-shifting RDH — port of optical-airgap/rdh/histogram-shifting.ts
//! Encrypt-first: `secret` must already be ciphertext.

use sha2::{Digest, Sha256};

use crate::{Result, TrvError};

pub const HEADER_BITS: usize = 8 + 8 + 32 + 64;

#[derive(Debug, Clone)]
pub struct RdhEmbedResult {
    pub stego: Vec<u8>,
    pub peak: u8,
    pub zero: u8,
    pub embedded_bits: usize,
    pub secret_len: usize,
}

#[derive(Debug, Clone)]
pub struct RdhExtractResult {
    pub secret: Vec<u8>,
    pub restored_cover: Vec<u8>,
    pub checksum_ok: bool,
}

fn histogram(data: &[u8]) -> [u32; 256] {
    let mut h = [0u32; 256];
    for &b in data {
        h[b as usize] += 1;
    }
    h
}

pub fn estimate_capacity(cover: &[u8]) -> usize {
    let h = histogram(cover);
    let mut peak = 0usize;
    for i in 1..256 {
        if h[i] > h[peak] {
            peak = i;
        }
    }
    h[peak] as usize
}

fn find_peak_zero(h: &[u32; 256]) -> (u8, u8) {
    let mut peak = 0usize;
    for i in 1..256 {
        if h[i] > h[peak] {
            peak = i;
        }
    }
    let mut zero = None;
    for i in (peak + 1)..256 {
        if h[i] == 0 {
            zero = Some(i);
            break;
        }
    }
    let zero = zero.unwrap_or_else(|| {
        let mut z = (peak + 1).min(255);
        let mut min_v = h[z];
        for i in (peak + 1)..256 {
            if h[i] < min_v {
                min_v = h[i];
                z = i;
            }
        }
        z
    });
    (peak as u8, zero as u8)
}

fn checksum8(data: &[u8]) -> [u8; 8] {
    let hash = Sha256::digest(data);
    let mut out = [0u8; 8];
    out.copy_from_slice(&hash[..8]);
    out
}

fn bytes_to_bits(data: &[u8]) -> Vec<bool> {
    let mut bits = Vec::with_capacity(data.len() * 8);
    for &b in data {
        for i in (0..8).rev() {
            bits.push(((b >> i) & 1) == 1);
        }
    }
    bits
}

fn bits_to_bytes(bits: &[bool]) -> Vec<u8> {
    let mut out = vec![0u8; (bits.len() + 7) / 8];
    for (i, &bit) in bits.iter().enumerate() {
        if bit {
            out[i / 8] |= 1 << (7 - (i % 8));
        }
    }
    out
}

pub fn embed_histogram_shifting(cover: &[u8], secret: &[u8]) -> Result<RdhEmbedResult> {
    let capacity = estimate_capacity(cover);
    let need = HEADER_BITS + secret.len() * 8;
    if capacity < need {
        return Err(TrvError::Rdh(format!(
            "capacity {capacity} bits < required {need}"
        )));
    }

    let h = histogram(cover);
    let (peak, zero) = find_peak_zero(&h);
    if peak == zero {
        return Err(TrvError::Rdh("peak and zero collide".into()));
    }

    let cs = checksum8(secret);
    let mut header = Vec::with_capacity(14);
    header.push(peak);
    header.push(zero);
    let len = secret.len() as u32;
    header.extend_from_slice(&len.to_be_bytes());
    header.extend_from_slice(&cs);

    let mut payload_bits = bytes_to_bits(&header);
    payload_bits.extend(bytes_to_bits(secret));

    let mut stego = cover.to_vec();
    let shift_right = zero > peak;

    for v in stego.iter_mut() {
        let x = *v;
        if shift_right {
            if x > peak && x < zero {
                *v = x.wrapping_add(1);
            }
        } else if x < peak && x > zero {
            *v = x.wrapping_sub(1);
        }
    }

    let mut bit_idx = 0usize;
    for v in stego.iter_mut() {
        if bit_idx >= payload_bits.len() {
            break;
        }
        if *v == peak {
            if payload_bits[bit_idx] {
                *v = if shift_right {
                    peak.wrapping_add(1)
                } else {
                    peak.wrapping_sub(1)
                };
            }
            bit_idx += 1;
        }
    }

    Ok(RdhEmbedResult {
        stego,
        peak,
        zero,
        embedded_bits: bit_idx,
        secret_len: secret.len(),
    })
}

pub fn extract_histogram_shifting(stego: &[u8], peak: u8, zero: u8) -> Result<RdhExtractResult> {
    let shift_right = zero > peak;
    let freed = if shift_right {
        peak.wrapping_add(1)
    } else {
        peak.wrapping_sub(1)
    };

    let mut restored = stego.to_vec();
    let mut bits = Vec::new();

    for (i, &v) in stego.iter().enumerate() {
        if v == peak {
            bits.push(false);
        } else if v == freed {
            bits.push(true);
            restored[i] = peak;
        }
    }

    if bits.len() < HEADER_BITS {
        return Err(TrvError::Rdh("insufficient bits for header".into()));
    }

    let header_bytes = bits_to_bytes(&bits[..HEADER_BITS]);
    let hdr_peak = header_bytes[0];
    let hdr_zero = header_bytes[1];
    let secret_len = u32::from_be_bytes([
        header_bytes[2],
        header_bytes[3],
        header_bytes[4],
        header_bytes[5],
    ]) as usize;
    let stored_cs = &header_bytes[6..14];

    let use_peak = hdr_peak;
    let use_zero = hdr_zero;
    let use_shift_right = use_zero > use_peak;

    for v in restored.iter_mut() {
        let x = *v;
        if use_shift_right {
            if x > use_peak && x <= use_zero {
                *v = x.wrapping_sub(1);
            }
        } else if x < use_peak && x >= use_zero {
            *v = x.wrapping_add(1);
        }
    }

    let need_bits = HEADER_BITS + secret_len * 8;
    if bits.len() < need_bits {
        return Err(TrvError::Rdh("insufficient bits for secret".into()));
    }
    let secret = bits_to_bytes(&bits[HEADER_BITS..need_bits]);
    let secret = secret[..secret_len].to_vec();
    let actual = checksum8(&secret);
    let checksum_ok = actual.as_slice() == stored_cs;

    Ok(RdhExtractResult {
        secret,
        restored_cover: restored,
        checksum_ok,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rdh_roundtrip_on_flat_cover() {
        let cover = vec![128u8; 50_000];
        let secret = b"age-ciphertext-placeholder".to_vec();
        let emb = embed_histogram_shifting(&cover, &secret).unwrap();
        let ext = extract_histogram_shifting(&emb.stego, emb.peak, emb.zero).unwrap();
        assert!(ext.checksum_ok);
        assert_eq!(ext.secret, secret);
    }
}
