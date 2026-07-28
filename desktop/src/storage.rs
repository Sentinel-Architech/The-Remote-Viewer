use anyhow::{Context, Result};
use directories::ProjectDirs;
use heed::{EnvOpenOptions, Database};
use heed::types::{Str, Bytes};
use std::fs;
use std::path::PathBuf;

pub struct StorageEngine {
    env: heed::Env,
    telemetry_db: Database<Str, Bytes>,
}

impl StorageEngine {
    pub fn new() -> Result<Self> {
        let path = ProjectDirs::from("com", "sentinel", "remote-viewer")
            .map(|p| p.data_dir().join("lmdb"))
            .unwrap_or_else(|| PathBuf::from("./data/lmdb"));

        fs::create_dir_all(&path)
            .context("Failed to create data directory")?;

        // heed marks open() as unsafe because the caller must guarantee
        // the path is valid and the process has exclusive access semantics.
        let env = unsafe {
            EnvOpenOptions::new()
                .map_size(512 * 1024 * 1024) // 512 MB
                .max_dbs(4)
                .open(&path)
        }
        .context("Failed to open LMDB environment")?;

        let mut wtxn = env.write_txn()?;
        let telemetry_db = env.create_database(&mut wtxn, Some("telemetry"))?;
        wtxn.commit()?;

        Ok(Self {
            env,
            telemetry_db,
        })
    }

    pub fn insert_telemetry(&self, hash: &str, data: &[u8]) -> Result<()> {
        let mut wtxn = self.env.write_txn()?;
        self.telemetry_db.put(&mut wtxn, hash, data)?;
        wtxn.commit()?;
        tracing::info!("[+] Stored {} bytes → {}", data.len(), hash);
        Ok(())
    }
}
