use std::collections::HashMap;
use tracing::{info, warn};

/// Local-first AR Token ledger
/// 
/// Design constraints:
/// - Corporate-free (no admin mint, no special corporate balances)
/// - Contribution-based only
/// - No yield / interest mechanics
/// - No custodial promises
/// - Not presented as a bank deposit or security
#[derive(Debug, Default)]
pub struct ArTokenLedger {
    /// identity → balance
    balances: HashMap<String, u64>,
    /// Total ever rewarded (for transparency)
    total_minted: u64,
}

impl ArTokenLedger {
    pub fn new() -> Self {
        Self {
            balances: HashMap::new(),
            total_minted: 0,
        }
    }

    /// Get balance of an identity
    pub fn balance_of(&self, identity: &str) -> u64 {
        *self.balances.get(identity).unwrap_or(&0)
    }

    /// Reward for verified contribution only
    /// (node uptime, state verification, presence, storage, etc.)
    pub fn reward(&mut self, identity: &str, amount: u64, reason: &str) {
        if amount == 0 || identity.is_empty() {
            return;
        }

        let entry = self.balances.entry(identity.to_string()).or_insert(0);
        *entry = entry.saturating_add(amount);
        self.total_minted = self.total_minted.saturating_add(amount);

        info!(
            "[AR] Contribution reward → {} +{} AR ({}) | Balance: {}",
            identity, amount, reason, *entry
        );
    }

    /// Spend tokens (e.g. for optional premium local features)
    pub fn spend(&mut self, identity: &str, amount: u64) -> bool {
        let balance = self.balances.entry(identity.to_string()).or_insert(0);

        if *balance < amount {
            warn!(
                "[AR] Spend failed for {} — insufficient balance (has {}, needs {})",
                identity, *balance, amount
            );
            return false;
        }

        *balance -= amount;
        info!("[AR] {} spent {} AR | Remaining: {}", identity, amount, *balance);
        true
    }

    pub fn total_minted(&self) -> u64 {
        self.total_minted
    }
}
