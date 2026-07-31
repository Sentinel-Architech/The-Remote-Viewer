//! Local @sentinel.viewer addresses — not public DNS.

use sha2::{Digest, Sha256};

pub fn generate_local_address(local_part: &str, vault_fingerprint: &str) -> String {
    let local = local_part
        .trim()
        .to_lowercase()
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '.' || *c == '_' || *c == '-')
        .collect::<String>();
    let local = if local.is_empty() {
        let mut h = Sha256::new();
        h.update(vault_fingerprint.as_bytes());
        let dig = h.finalize();
        format!(
            "v{:x}{:x}{:x}{:x}",
            dig[0], dig[1], dig[2], dig[3]
        )
    } else {
        local
    };
    format!("{local}@sentinel.viewer")
}

pub fn is_valid_local_address(addr: &str) -> bool {
    let parts: Vec<_> = addr.split('@').collect();
    if parts.len() != 2 {
        return false;
    }
    parts[1].eq_ignore_ascii_case("sentinel.viewer") && !parts[0].is_empty()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn address_shape() {
        let a = generate_local_address("ops", "vault-1");
        assert_eq!(a, "ops@sentinel.viewer");
        assert!(is_valid_local_address(&a));
    }
}
