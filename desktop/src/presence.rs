use std::collections::HashMap;
use std::time::{Duration, Instant};
use tracing::{info, warn};
mod presence;
/// Simple local Proof-of-Presence tracker
/// This version uses timed presence windows.
/// Later we can add real BLE / spatial signals.
#[derive(Debug)]
pub struct PresenceVerifier {
    /// identity → last successful presence proof
    last_seen: HashMap<String, Instant>,
    /// How long a presence proof remains valid
    validity: Duration,
}

impl PresenceVerifier {
    pub fn new() -> Self {
        Self {
            last_seen: HashMap::new(),
            validity: Duration::from_secs(60 * 10), // 10 minutes
        }
    }

    /// Record that an identity has proven physical presence
    pub fn record_presence(&mut self, identity: &str) {
        self.last_seen.insert(identity.to_string(), Instant::now());
        info!("[Presence] Physical presence recorded for {}", identity);
    }

    /// Check if an identity has a recent valid presence proof
    pub fn has_valid_presence(&self, identity: &str) -> bool {
        match self.last_seen.get(identity) {
            Some(time) if time.elapsed() < self.validity => true,
            Some(_) => {
                warn!("[Presence] Presence expired for {}", identity);
                false
            }
            None => {
                warn!("[Presence] No presence proof for {}", identity);
                false
            }
        }
    }

    /// Clear expired entries (optional housekeeping)
    pub fn cleanup(&mut self) {
        let now = Instant::now();
        self.last_seen.retain(|_, time| now.duration_since(*time) < self.validity);
    }
}
