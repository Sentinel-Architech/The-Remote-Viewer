use sha2::{Sha256, Digest};
use std::collections::BTreeMap;

pub struct StateMerkleTree {
    pub root_hash: String,
    leaves: BTreeMap<String, Vec<u8>>,
}

impl StateMerkleTree {
    pub fn new() -> Self {
        Self {
            root_hash: String::new(),
            leaves: BTreeMap::new(),
        }
    }

    pub fn insert_packet(&mut self, data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        let hash = hex::encode(hasher.finalize());

        self.leaves.insert(hash.clone(), data.to_vec());
        self.recalculate_root();
        hash
    }

    fn recalculate_root(&mut self) {
        let mut hasher = Sha256::new();
        for h in self.leaves.keys() {
            hasher.update(h.as_bytes());
        }
        self.root_hash = hex::encode(hasher.finalize());
    }
}
