//! Measures the MiniMind2-Small file that already ships in this repo.
//! A matching size and digest is not a model run.

use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};

pub const SHIPPED_MODEL_NAME: &str = "MiniMind2-Small";
pub const SHIPPED_WEIGHT_BYTES: u64 = 51_667_832;
pub const SHIPPED_WEIGHT_SHA256: &str =
    "83bfe6f127c98120a3410aab65eee3b66b8301ac352c20b7efd5e2eb688f6d85";

pub struct WeightMeasure {
    pub path: PathBuf,
    pub bytes: u64,
    pub sha256: String,
    pub matches_shipped: bool,
}

pub fn candidate_weight_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    if let Ok(from_env) = std::env::var("TRV_MINIMIND_WEIGHTS") {
        if !from_env.is_empty() {
            paths.push(PathBuf::from(from_env));
        }
    }
    paths.push(PathBuf::from("weights/minimind2-small/model.safetensors"));
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            paths.push(dir.join("weights/minimind2-small/model.safetensors"));
            paths.push(dir.join("../weights/minimind2-small/model.safetensors"));
        }
    }
    paths
}

pub fn measure_weights(path: &Path) -> Result<WeightMeasure, String> {
    let mut file = File::open(path).map_err(|err| format!("could not open {}: {err}", path.display()))?;
    let mut hasher = Sha256::new();
    let mut bytes: u64 = 0;
    let mut buf = [0u8; 1024 * 1024];
    loop {
        let read = file
            .read(&mut buf)
            .map_err(|err| format!("could not read {}: {err}", path.display()))?;
        if read == 0 {
            break;
        }
        hasher.update(&buf[..read]);
        bytes += read as u64;
    }
    let sha256 = hex::encode(hasher.finalize());
    let matches_shipped = bytes == SHIPPED_WEIGHT_BYTES && sha256 == SHIPPED_WEIGHT_SHA256;
    Ok(WeightMeasure {
        path: path.to_path_buf(),
        bytes,
        sha256,
        matches_shipped,
    })
}

pub fn measure_first_present(explicit: Option<&Path>) -> Result<WeightMeasure, String> {
    if let Some(path) = explicit {
        return measure_weights(path);
    }
    let mut tried = Vec::new();
    for path in candidate_weight_paths() {
        if path.is_file() {
            return measure_weights(&path);
        }
        tried.push(path.display().to_string());
    }
    Err(format!(
        "MiniMind2-Small model.safetensors was not found. Looked at: {}",
        tried.join(", ")
    ))
}

pub fn report(measure: &WeightMeasure) -> String {
    let matched = if measure.matches_shipped { "yes" } else { "no" };
    format!(
        "{name}\npath: {path}\nbytes: {bytes}\nsha256: {sha}\nmatches shipped file: {matched}\nThe model network was not executed.\nThis desktop package is not a phone release.",
        name = SHIPPED_MODEL_NAME,
        path = measure.path.display(),
        bytes = measure.bytes,
        sha = measure.sha256,
        matched = matched,
    )
}
