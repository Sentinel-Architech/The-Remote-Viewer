# Command & Decision Log

**Purpose:** Transparent record of the actions that produced the current security posture, CI, and dual-path README.  
**Rule:** No secrets, keys, tokens, or private material. Only public actions and decisions.  
**Date range:** 2026-07-27 → 2026-07-28

---

## 1. Security Policy (SECURITY.md)

**Problem:** The existing `SECURITY.md` was a four-paragraph draft that claimed “no expectation of privacy” and conflicted with the project’s zero-trust, no-custody principles.

**Action:** Replaced the entire file with a full security policy covering:
- Project purpose (E2E encrypted, decentralized, no centralized backdoors)
- Supported versions
- Private vulnerability reporting process
- In-scope / out-of-scope components
- Security principles (no platform key custody, logging limited to repo access)
- Coordinated disclosure policy

**Commit message:** `Replace placeholder SECURITY.md with full security policy for Sentinel / TRV PROTOCOL`

---

## 2. Dependabot

**Problem:** `.github/dependabot.yml` had an empty `package-ecosystem` and did nothing.

**Action:** Rewrote the file to enable:
- `cargo` for the workspace root
- `npm` for `apps/web`, `apps/mobile`, and `apps/shared`
- Weekly schedule

**Commit message:** `Fix Dependabot: enable cargo + npm ecosystems`

---

## 3. Gitleaks (secrets scanning)

**Problem:** Minimal `.gitleaks.toml` and no CI enforcement.

**Actions:**
1. Expanded `.gitleaks.toml` with TRV-relevant rules (private-key patterns, generic API keys) while keeping an allowlist for example/docs files.
2. Fixed a syntax error that caused the first CI run to fail (`AllowList` expected a map).
3. Added `.github/workflows/gitleaks.yml` so every push and pull request is scanned.
4. Pre-commit already called gitleaks via `lefthook.yml`; CI now enforces it as well.

**Commit messages:**
- `Expand gitleaks rules for TRV key material and common leaks`
- `Fix gitleaks.toml syntax so CI can load the config`
- `Add gitleaks CI workflow`

---

## 4. Crypto path hardening (desktop)

**Problem:** Scaffold code contained `.unwrap()` calls and did not zeroize secret key material.

**Actions:**
1. `desktop/src/zk_auth.rs` — removed unwraps, returned `Result`, fail-closed on bad proof bytes.
2. `desktop/src/identity.rs` — added real keypair generation and an explicit `zeroize_secret_key` helper.
3. `desktop/src/main.rs` — generate keypair, provision public key, immediately zeroize the secret key.
4. Added `zeroize = "1"` dependency to `desktop/Cargo.toml`.
5. Fixed `Signature` construction (private fields) and marked `EnvOpenOptions::open` as `unsafe` (required by heed).
6. Silenced unused-variable warnings in the scaffold `main.rs`.

**Commit messages:**
- `Remove unwraps from zk_auth crypto path; return Result`
- `Harden identity: add keypair generation + zeroization of secret key material`
- `Add zeroize dependency for secret key cleanup`
- `Zeroize secret key immediately after provisioning public key`
- `Fix Signature construction — use from_bytes instead of private tuple`
- `Mark LMDB EnvOpenOptions::open as unsafe (required by heed)`
- `Silence unused variable warnings in main scaffold`

---

## 5. Running System Threat Model

**Problem:** Strong key-loss threat model existed, but no document covered the live attack surface (P2P gossip, OTA, edge nodes).

**Action:** Created `docs/security/running-system-threat-model.md` covering:
- Assets (Merkle root, gossip messages, OTA images, local storage, keys)
- Adversaries
- Specific threats: gossip spoofing, Sybil, OTA tampering, Merkle poisoning, secret-key exposure, storage integrity
- Required next engineering steps

**Commit message:** `Add Running System Threat Model for P2P, OTA, and edge components`

---

## 6. CI workflow for branch protection

**Problem:** No required status checks existed.

**Action:** Added `.github/workflows/ci.yml` with two jobs:
- Secret Scan (gitleaks)
- Cargo Check (desktop crate)

Both must pass on push and pull request to `TheRemoteViewer` / `main`.

**Commit message:** `Add CI workflow for branch protection required checks (gitleaks + cargo check)`

**Note:** Actual branch-protection rules (require these checks, require signed commits) still need to be enabled in the GitHub UI under Settings → Branches.

---

## 7. Dual-path README

**Problem:** README was written only for serious zero-trust builders. A complete beginner had no clear entry point.

**Action:** Restructured `README.md` with two explicit paths at the top:

1. **Hobbyist — Start from nothing**  
   Plain-English prerequisites, exact clone + run commands for web/mobile/desktop scaffolds, honest status table, where to look next.

2. **Builder — Zero-trust / crypto**  
   Original posture, trust table, install policy, non-goals, current status, kept intact for people who already know the domain.

**Commit message:** `Add dual entry paths: Hobbyist (start from nothing) + Builder`

---

## 8. This log

**Action:** Created this file so the sequence of decisions is itself public and auditable.

**Commit message:** `Add public command and decision log of the security + hobbyist hardening session`

---

## Intentionally not logged

- Any private keys, seeds, tokens, or credentials (none were handled)
- Internal GitHub token values used by Actions (managed by GitHub)
- Personal contact channels outside the public SECURITY.md process

---

## How to extend this log

When a future session makes a durable, non-secret change to security posture, CI, or public entry paths, append a new numbered section with:
- Problem
- Action
- Commit message(s)

Keep secrets out.

---

## Auto entry — 2026-07-28

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `1016254` | Add public command and decision log of the security + hobbyist hardening session | The_Archetecht | 2026-07-27 |
| `250fcbc` | Add dual entry paths: Hobbyist (start from nothing) + Builder | The_Archetecht | 2026-07-27 |
| `e28d408` | Silence unused variable warnings in main scaffold | The_Archetecht | 2026-07-27 |
| `c7eb683` | Mark LMDB EnvOpenOptions::open as unsafe (required by heed) | The_Archetecht | 2026-07-27 |

