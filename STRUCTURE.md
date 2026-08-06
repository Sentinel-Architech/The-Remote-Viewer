# Repository Structure

**Working branch:** `TheRemoteViewer`  
**Cleanup / reality branch:** `cleanup/professional-structure`

This document describes the *actual* layout. See also **[docs/REALITY.md](docs/REALITY.md)** for the status of every major concept (Proven / Scaffold / Design / Rejected).

## Root

| Path | Purpose |
|------|---------|
| `README.md` | Primary entry point, live proofs, posture |
| `LICENSE` | Source-available Absolute Sovereign Edition |
| `SECURITY.md` | Vulnerability reporting & scope |
| `CONTRIBUTING.md` | How to contribute (incl. domain specialists) |
| `CREDITS.md` | Attributions |
| `TOKENOMICS.md` | Design intent for $AR / contribution rewards |
| `STRUCTURE.md` | This file |
| `Cargo.toml` | Rust workspace (desktop + optical-airgap/rust) |
| `.gitignore` | Secrets, build artifacts, OS noise |
| `.editorconfig` | Consistent formatting |

## Proven / Active Code Paths

```
optical-airgap/          # age + Robust Soliton LT optical transport (PROVEN on GrapheneOS + Termux)
modules/                 # New: real, runnable open modules (self-heal, local-identity, contribution)
apps/                    # mobile + web + shared identity/treasury
desktop/                 # Rust desktop components
digital-vending/         # Self-hosted digital goods delivery
edge-esp32/              # ESP32 firmware stubs
grok/                    # On-device specialist router + skills
site/                    # Pure static HTML (optical QR + vending) — zero corporate runtime
mobile/                  # Termux daemon helpers
protocols/  scripts/  src/  web/
```

## modules/ (Concepts → Reality)

```
modules/
├── self-heal/           # Real Termux process supervisor + healthcheck
├── local-identity/      # age-based local key helpers (Destroy = Restart)
└── contribution/        # Offline-first contribution ledger (foundation for AR)
```

These replace former root-level concept notes that were vaporware or centralized designs.

## Documentation

```
docs/
├── REALITY.md           # Status table: every concept → Proven / Scaffold / Design / Rejected
├── locked/              # Frozen architectural decisions
├── public/              # Install, posture, release hygiene
├── distribution/        # Obtainium / Android identity
├── security/            # Threat models
├── concepts/            # Former root design notes (archived)
└── architecture/        # Longer-form analysis (incl. Sentinel Paradigm)
```

## Explicitly Deferred / Rejected

- Centralized 21+ digit key assignment systems → **REJECTED** (conflicts with zero-trust)
- Full post-quantum / FHE / ZK re-implementations → **DESIGN only** until real libraries are integrated
- Java enterprise scaffolding from old Project Structure docs → historical only

---

**Rule:** Prefer working, auditable code under user control over speculative file proliferation at the root. Optical air-gap is the reference standard for "real".
