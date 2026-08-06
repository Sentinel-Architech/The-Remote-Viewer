# Repository Structure

**Working branch:** `TheRemoteViewer`  
**Cleanup branch:** `cleanup/professional-structure`

This document describes the *actual* layout of the repository as of the professional structure cleanup. Aspirational full-stack diagrams that previously lived at the root have been moved under `docs/`.

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
| `.gitleaks.toml` | Secret scanning config |
| `lefthook.yml` | Git hooks |
| `renovate.json` / `.github/` | Dependency & CI automation |

## Proven / Active Code Paths

```
optical-airgap/          # age + Robust Soliton LT optical transport (verified on GrapheneOS + Termux)
apps/                    # mobile (Expo/React Native) + web (Vite) + shared identity/treasury
desktop/                 # Rust desktop components (p2p, identity, presence, zk_auth, etc.)
digital-vending/         # Self-hosted digital goods delivery scripts + catalog
edge-esp32/              # ESP32 firmware stubs (OTA receiver)
grok/                    # On-device specialist router + skills (llama.cpp path)
site/                    # Pure static HTML (optical QR tools + vending UI) — zero corporate runtime
protocols/               # Protocol options / notes
scripts/                 # Build & notify helpers
src/                     # Top-level Rust lib/main (workspace integration)
mobile/                  # Termux daemon / watchdog helpers
web/                     # Simple dashboard HTML/JS
```

## Documentation

```
docs/
├── locked/              # Architectural decisions that are treated as frozen
├── public/              # Install, posture, release hygiene, vending, command log
├── distribution/        # Obtainium / Android identity / merge notes
├── security/            # Threat models
├── concepts/            # Design notes & research (moved from root)
└── architecture/        # Core paradigm & longer-form analysis
```

## Design Notes (formerly root-level concept files)

All former top-level files with spaces or pure conceptual content have been relocated to `docs/concepts/` with kebab-case names. They remain available for reference but no longer pollute the repository root.

## Planned / Scaffold Modules (realistic near-term)

- Expand `desktop/` identity, presence, and optical bridge integration
- Harden mobile identity path (`apps/shared` + GrapheneOS constraints)
- Complete contribution → local ledger path for AR token design
- Optional multi-device optical lab (screen ↔ camera)
- ESP32 edge node firmware maturity

## Explicitly Deferred / Aspirational

Full post-quantum crypto suites, complete Java re-implementation, and enterprise-scale modules described in older "Project Structure" documents remain design references only. They are not present as code and are not current priorities.

---

**Rule:** Prefer working, auditable code and locked posture docs over speculative file proliferation at the root.
