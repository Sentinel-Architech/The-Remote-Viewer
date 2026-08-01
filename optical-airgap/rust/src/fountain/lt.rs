//! LT encoder / peel decoder.
//! Degree sampling: Robust Soliton by default (c=0.1, delta=0.05).
//! Use DegreeMode::Legacy for Phase-1 heuristic interop.

use super::frame::LtSymbol;
use super::soliton::{robust_soliton, sample_degree_legacy, sample_degree_soliton, soliton_cdf};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DegreeMode {
    Soliton,
    Legacy,
}

impl Default for DegreeMode {
    fn default() -> Self {
        DegreeMode::Soliton
    }
}

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

pub struct EncodeOpts {
    pub mode: DegreeMode,
    pub c: f64,
    pub delta: f64,
}

impl Default for EncodeOpts {
    fn default() -> Self {
        Self {
            mode: DegreeMode::Soliton,
            c: 0.1,
            delta: 0.05,
        }
    }
}

pub fn encode_symbol(blocks: &[SourceBlock], seed: u32, opts: &EncodeOpts) -> LtSymbol {
    let k = blocks.len();
    let degree = match opts.mode {
        DegreeMode::Legacy => sample_degree_legacy(k, seed),
        DegreeMode::Soliton => sample_degree_soliton(k, seed, opts.c, opts.delta),
    };
    encode_symbol_with_degree(blocks, seed, degree)
}

fn encode_symbol_with_degree(blocks: &[SourceBlock], seed: u32, degree: usize) -> LtSymbol {
    let k = blocks.len();
    let degree = degree.min(k).max(1);
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
    opts: EncodeOpts,
    cdf: Vec<f64>,
}

impl LtEncoder {
    pub fn new(payload: &[u8], block_size: usize) -> Self {
        Self::with_opts(payload, block_size, EncodeOpts::default())
    }

    pub fn with_opts(payload: &[u8], block_size: usize, opts: EncodeOpts) -> Self {
        let blocks = split_into_blocks(payload, block_size);
        let cdf = if opts.mode == DegreeMode::Soliton {
            soliton_cdf(&robust_soliton(blocks.len(), opts.c, opts.delta))
        } else {
            Vec::new()
        };
        Self {
            blocks,
            next_seed: 0,
            block_size,
            opts,
            cdf,
        }
    }

    pub fn k(&self) -> usize {
        self.blocks.len()
    }

    pub fn block_size(&self) -> usize {
        self.block_size
    }

    pub fn degree_mode(&self) -> DegreeMode {
        self.opts.mode
    }

    pub fn next(&mut self) -> LtSymbol {
        let sym = if self.opts.mode == DegreeMode::Soliton && !self.cdf.is_empty() {
            let k = self.blocks.len();
            let degree = super::soliton::sample_degree_from_cdf(
                &self.cdf,
                super::soliton::seed_to_unit(self.next_seed),
                k,
            );
            encode_symbol_with_degree(&self.blocks, self.next_seed, degree)
        } else {
            encode_symbol(&self.blocks, self.next_seed, &self.opts)
        };
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

    pub fn k(&self) -> usize {
        self.k
    }

    pub fn block_size(&self) -> usize {
        self.block_size
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
    use super::super::soliton::sample_degree_soliton;

    #[test]
    fn lt_encode_peel_soliton() {
        let msg = b"hello TRV lt rust soliton";
        let mut enc = LtEncoder::new(msg, 8);
        assert_eq!(enc.degree_mode(), DegreeMode::Soliton);
        let mut dec = LtDecoder::new(enc.k(), 8);
        for _ in 0..enc.k() * 5 {
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

    #[test]
    fn lt_encode_peel_legacy() {
        let msg = b"legacy path";
        let mut enc = LtEncoder::with_opts(
            msg,
            8,
            EncodeOpts {
                mode: DegreeMode::Legacy,
                ..Default::default()
            },
        );
        let mut dec = LtDecoder::new(enc.k(), 8);
        for _ in 0..enc.k() * 4 {
            dec.add_symbol(enc.next());
            if dec.is_complete() {
                break;
            }
        }
        assert!(dec.is_complete());
        let mut out = dec.payload().unwrap();
        out.truncate(msg.len());
        assert_eq!(&out[..], msg);
    }

    #[test]
    fn golden_degrees_k8_soliton() {
        let expected: [u16; 32] = [
            1, 5, 1, 3, 2, 3, 4, 2, 5, 3, 1, 2, 5, 1, 2, 2, 5, 2, 5, 2, 5, 3, 5, 4, 5, 5, 3, 8,
            5, 4, 7, 5,
        ];
        for seed in 0u32..32 {
            let d = sample_degree_soliton(8, seed, 0.1, 0.05) as u16;
            assert_eq!(
                d, expected[seed as usize],
                "seed {seed}: got {d} expected {}",
                expected[seed as usize]
            );
        }
    }
}
