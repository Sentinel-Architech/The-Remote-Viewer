# Sentinel Protocol - Consent Management System

**American Made by a PROUD AMERICAN ARCHITECT**  
Rust Implementation

## Overview

User consent tracking and management for data processing and usage.

```rust
use anyhow::{Result, anyhow};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};

pub struct AmericanConsentEngine {
    consents: HashMap<String, ConsentRecord>,
    consent_policies: HashMap<String, ConsentPolicy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentRecord {
    pub consent_id: String,
    pub user_id: String,
    pub consent_type: ConsentType,
    pub granted: bool,
    pub granted_at: Instant,
    pub expires_at: Option<Instant>,
    pub purpose: String,
    pub data_categories: Vec<String>,
    pub withdrawal_requested: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConsentType {
    DataProcessing,
    DataSharing,
    DataUsage,
    Analytics,
    Marketing,
}

// ... additional types and methods preserved from original
```

*(Full original Rust implementation preserved from root `Consent Management` file.)*
