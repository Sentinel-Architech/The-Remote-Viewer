//! LT encoder / peel decoder skeleton (matches TS lt-core degree heuristic).

use super::frame::LtSymbol;

pub struct SourceBlock {
    pub index: usize,
    pub data: Vec<u8>,
}

pub fn split_into_blocks(payload: &[u8], block_size: usize) -> Vec<SourceBlock> {
    let mut blocks = Vec::new();
    let mut offset = 0;
    let mut index = 0;
    while offset < payload.len() {
        let mut chunk = vec![0u8; block_size];
        let end = (offset + block_size).min(payload.len());
        chunk[..end - offset].copy_from_slice(&payload[offset..end]);
        blocks.push(SourceBlock { index, data: chunk });
        offset = end;
        index += 1;
    }
    if blocks.is_empty() {
        blocks.push(SourceBlock {
            index: 0,
            data: vec![0u8; block_size],
        });
    }
    blocks
}

fn sample_degree(k: usize, seed: u32) -> usize {
    let x = ((seed as f64 * 12.9898).sin().abs() * 43758.5453).fract();
    if x < 0.5 {
        1
    } else if x < 0.75 {
        2.min(k)
    } else if x < 0.9 {
        3.min(k)
    } else {
        (1 + (x * k as f64) as usize).min(k).max(1)
    }
}

pub fn encode_symbol(blocks: &[SourceBlock], seed: u32) -> LtSymbol {
    let k = blocks.len();
    let degree = sample_degree(k, seed);
    let mut indices = Vec::new();
    let mut chosen = std::collections::HashSet::new();
    let mut s = seed;
    while indices.len() < degree {
        s = s.wrapping_mul(1103515245).wrapping_add(12345) & 0x7fffffff;
        let idx = (s as usize) % k;
        if chosen.insert(idx) {
            indices.push(idx as u16);
        }
    }
    indices.sort_unstable();
    let mut data = vec![0u8; blocks[0].data.len()];
    for &i in &indices {
        let src = &blocks[i as usize].data;
        for j in 0..data.len() {
            data[j] ^= src[j];
        }
    }
    LtSymbol {
        degree: degree as u16,
        indices,
        data,
        seed,
    }
}

pub struct LtEncoder {
    blocks: Vec<SourceBlock>,
    next_seed: u32,
    block_size: usize,
}

impl LtEncoder {
    pub fn new(payload: &[u8], block_size: usize) -> Self {
        Self {
            blocks: split_into_blocks(payload, block_size),
            next_seed: 0,
            block_size,
        }
    }

    pub fn k(&self) -> usize {
        self.blocks.len()
    }

    pub fn block_size(&self) -> usize {
        self.block_size
    }

    pub fn next(&mut self) -> LtSymbol {
        let sym = encode_symbol(&self.blocks, self.next_seed);
        self.next_seed += 1;
        sym
    }
}

pub struct LtDecoder {
    k: usize,
    block_size: usize,
    recovered: Vec<Option<Vec<u8>>>,
    symbols: Vec<LtSymbol>,
}

impl LtDecoder {
    pub fn new(k: usize, block_size: usize) -> Self {
        Self {
            k,
            block_size,
            recovered: vec![None; k],
            symbols: Vec::new(),
        }
    }

    pub fn add_symbol(&mut self, sym: LtSymbol) {
        self.symbols.push(sym);
        self.peel();
    }

    pub fn recovered_count(&self) -> usize {
        self.recovered.iter().filter(|b| b.is_some()).count()
    }

    pub fn is_complete(&self) -> bool {
        self.recovered_count() == self.k
    }

    fn peel(&mut self) {
        let mut progress = true;
        while progress {
            progress = false;
            for sym in &self.symbols {
                let unknown: Vec<u16> = sym
                    .indices
                    .iter()
                    .copied()
                    .filter(|&i| self.recovered[i as usize].is_none())
                    .collect();
                if unknown.len() == 1 {
                    let target = unknown[0] as usize;
                    let mut data = sym.data.clone();
                    for &i in &sym.indices {
                        if i as usize != target {
                            if let Some(ref known) = self.recovered[i as usize] {
                                for j in 0..data.len() {
                                    data[j] ^= known[j];
                                }
                            }
                        }
                    }
                    self.recovered[target] = Some(data);
                    progress = true;
                }
            }
        }
    }

    pub fn payload(&self) -> Option<Vec<u8>> {
        if !self.is_complete() {
            return None;
        }
        let mut out = vec![0u8; self.k * self.block_size];
        for i in 0..self.k {
            out[i * self.block_size..(i + 1) * self.block_size]
                .copy_from_slice(self.recovered[i].as_ref().unwrap());
        }
        Some(out)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lt_encode_peel_small() {
        let msg = b"hello TRV lt rust";
        let mut enc = LtEncoder::new(msg, 8);
        let mut dec = LtDecoder::new(enc.k(), 8);
        // rateless: send several symbols
        for _ in 0..enc.k() * 4 {
            dec.add_symbol(enc.next());
            if dec.is_complete() {
                break;
            }
        }
        assert!(dec.is_complete(), "recovered {}", dec.recovered_count());
        let mut out = dec.payload().unwrap();
        out.truncate(msg.len());
        assert_eq!(&out[..], msg);
    }
}
