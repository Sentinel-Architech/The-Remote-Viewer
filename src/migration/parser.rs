use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_json_export() {
        let path = Path::new("test_export.json");
        let posts = MigrationParser::parse_json_export(path).unwrap();
        assert_eq!(posts.len(), 1);
        assert_eq!(posts[0].author_handle, "Architech");
    }
}
