use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Serialize, Deserialize, Debug)]
pub struct LegacyPost {
    pub timestamp: u64,
    pub content: String,
    pub author_handle: String,
}

pub struct MigrationParser;

impl MigrationParser {
    pub fn parse_json_export(file_path: &Path) -> anyhow::Result<Vec<LegacyPost>> {
        let file_content = std::fs::read_to_string(file_path)?;
        let posts: Vec<LegacyPost> = serde_json::from_str(&file_content)?;
        Ok(posts)
    }
}
