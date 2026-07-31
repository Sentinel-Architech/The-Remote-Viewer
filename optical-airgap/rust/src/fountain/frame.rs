//! TRVL LT frame — matches optical-airgap/fountain/lt-frame.ts

use crate::{Result, TrvError};

pub const MAGIC: &[u8; 4] = b"TRVL";
pub const VERSION: u8 = 1;
pub const FLAG_EXPLICIT_INDICES: u8 = 1;

#[derive(Debug, Clone)]
pub struct LtFrameMeta {
    pub k: u16,
    pub block_size: u16,
}

#[derive(Debug, Clone)]
pub struct LtSymbol {
    pub degree: u16,
    pub indices: Vec<u16>,
    pub data: Vec<u8>,
    pub seed: u32,
}

pub fn crc16_ibm(data: &[u8]) -> u16 {
    let mut crc = 0xffffu16;
    for &b in data {
        crc ^= b as u16;
        for _ in 0..8 {
            crc = if crc & 1 != 0 {
                (crc >> 1) ^ 0xa001
            } else {
                crc >> 1
            };
        }
    }
    crc
}

pub fn encode_lt_frame(sym: &LtSymbol, meta: &LtFrameMeta) -> Result<Vec<u8>> {
    if sym.data.len() != meta.block_size as usize {
        return Err(TrvError::Frame("data length != block_size".into()));
    }
    if sym.degree as usize != sym.indices.len() {
        return Err(TrvError::Frame("degree/indices mismatch".into()));
    }

    let mut body = Vec::new();
    body.extend_from_slice(MAGIC);
    body.push(VERSION);
    body.push(FLAG_EXPLICIT_INDICES);
    body.extend_from_slice(&meta.k.to_be_bytes());
    body.extend_from_slice(&meta.block_size.to_be_bytes());
    body.extend_from_slice(&sym.seed.to_be_bytes());
    body.extend_from_slice(&sym.degree.to_be_bytes());
    let plen = sym.data.len() as u16;
    body.extend_from_slice(&plen.to_be_bytes());
    for idx in &sym.indices {
        body.extend_from_slice(&idx.to_be_bytes());
    }
    body.extend_from_slice(&sym.data);

    let crc = crc16_ibm(&body);
    body.extend_from_slice(&crc.to_be_bytes());
    Ok(body)
}

pub fn decode_lt_frame(frame: &[u8]) -> Result<(LtFrameMeta, LtSymbol)> {
    if frame.len() < 20 {
        return Err(TrvError::Frame("too short".into()));
    }
    if &frame[0..4] != MAGIC {
        return Err(TrvError::Frame("bad magic".into()));
    }
    if frame[4] != VERSION {
        return Err(TrvError::Frame("bad version".into()));
    }
    let flags = frame[5];
    let k = u16::from_be_bytes([frame[6], frame[7]]);
    let block_size = u16::from_be_bytes([frame[8], frame[9]]);
    let seed = u32::from_be_bytes([frame[10], frame[11], frame[12], frame[13]]);
    let degree = u16::from_be_bytes([frame[14], frame[15]]);
    let payload_len = u16::from_be_bytes([frame[16], frame[17]]) as usize;
    let mut off = 18usize;

    let mut indices = Vec::new();
    if flags & FLAG_EXPLICIT_INDICES != 0 {
        for _ in 0..degree {
            if off + 2 > frame.len() - 2 {
                return Err(TrvError::Frame("truncated indices".into()));
            }
            indices.push(u16::from_be_bytes([frame[off], frame[off + 1]]));
            off += 2;
        }
    } else {
        return Err(TrvError::Frame("seed-only not implemented".into()));
    }

    if off + payload_len + 2 > frame.len() {
        return Err(TrvError::Frame("truncated data".into()));
    }
    let data = frame[off..off + payload_len].to_vec();
    off += payload_len;
    let stored = u16::from_be_bytes([frame[off], frame[off + 1]]);
    let calc = crc16_ibm(&frame[..off]);
    if stored != calc {
        return Err(TrvError::Frame(format!(
            "CRC mismatch {{stored: {stored:#x}, calc: {calc:#x}}}"
        )));
    }

    Ok((
        LtFrameMeta { k, block_size },
        LtSymbol {
            degree,
            indices,
            data,
            seed,
        },
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn frame_roundtrip() {
        let sym = LtSymbol {
            degree: 2,
            indices: vec![0, 3],
            data: vec![9; 32],
            seed: 7,
        };
        let meta = LtFrameMeta {
            k: 10,
            block_size: 32,
        };
        let frame = encode_lt_frame(&sym, &meta).unwrap();
        let (m2, s2) = decode_lt_frame(&frame).unwrap();
        assert_eq!(m2.k, 10);
        assert_eq!(s2.seed, 7);
        assert_eq!(s2.indices, vec![0, 3]);
        assert_eq!(s2.data, vec![9; 32]);
    }
}
