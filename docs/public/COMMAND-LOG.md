# Command & Decision Log

**Purpose:** Transparent record of the actions that produced the current security posture, CI, and dual-path README.  
**Rule:** No secrets, keys, tokens, or private material. Only public actions and decisions.  
**Date range:** 2026-07-27 → present

---

## Automation

Non-secret security and infrastructure commits are automatically appended by:

`.github/workflows/command-log.yml`

**Triggers:**
- Push to `TheRemoteViewer` or `main` that touches:
  - `SECURITY.md`
  - `.gitleaks.toml`
  - `.github/workflows/**`
  - `.github/dependabot.yml`
  - `docs/security/**`
  - `docs/public/**`
  - `desktop/src/**`
  - `desktop/Cargo.toml`
  - `README.md`
- Manual run via the Actions “Run workflow” button (`workflow_dispatch`)

**Behavior:**
- Builds a dated table of recent relevant commits
- Skips commit subjects that look like they might contain secrets
- Appends only once per day
- Commits back with message `Auto-update command log [skip ci]` to avoid loops

Manual narrative entries (Problem / Action / Commit) can still be added above the auto sections for important decisions.

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

## 8. This log + automation

**Action:** Created this file and the workflow that keeps it updated automatically for future non-secret security and infrastructure changes.

**Commit messages:**
- `Add public command and decision log of the security + hobbyist hardening session`
- `Add automated command-log generator for non-secret security and infrastructure commits`

---

## 9. Mobile did:key — cleanup and working path (2026-07-30)

**Problem:** On-device identity (`did:key`) is the first item under “What we are building toward.” The mobile scaffold already contained a working implementation, but it was buried under duplicates, a broken import path, and junk files.

**Actions that worked:**

1. Confirmed the CSPRNG polyfill is correct and already imported at the top of `App.tsx`:
   ```ts
   import './crypto-polyfill';
   ```
   File: `apps/mobile/crypto-polyfill.ts` (uses `expo-crypto`).

2. Removed the duplicate / unused polyfill file:
   - Deleted `apps/mobile/crypto` (identical content, never imported).

3. Fixed the import in `PresenceScreen.tsx` so it points at the real service:
   ```ts
   import { ... } from '../src/services/presence';
   ```
   (Previous path `../services/presence` did not exist.)

4. Removed the incomplete root-level duplicate:
   - Deleted `apps/mobile/presence.ts`

5. Removed two junk files with trailing spaces in their names under `apps/mobile/screens/`.

**Canonical files after cleanup:**
- `apps/mobile/crypto-polyfill.ts` — CSPRNG polyfill (keep)
- `apps/mobile/src/services/presence.ts` — full did:key create / get / destroy / sign / DID Document
- `apps/mobile/screens/PresenceScreen.tsx` — UI that exercises the above

**Hobbyist commands that work (phone / Expo):**

```bash
# From repo root
cd apps/mobile
npm install
npx expo start --host lan
```

Then open the app on the device (Expo Go or local build).  
Buttons available:
- **Create did:key Identity** — generates Ed25519 keypair on-device, stores in SecureStore, shows DID
- **Sign Test Message** — signs a timestamped string with the local private key
- **Show DID Document** — displays the minimal DID Document
- **Destroy Identity** — wipes private key + DID from SecureStore (Destroy = Restart)

No server, no cloud, no recovery theater. Keys never leave the device.

**Commit messages:**
- `chore(mobile): remove duplicate crypto polyfill file`
- `fix(mobile): correct import path for presence service`
- `chore(mobile): remove incomplete root-level presence.ts duplicate`
- `chore(mobile): remove junk file with trailing space in name` (×2)

---

## 10. Mobile did:key hardening (2026-07-30)

**Problem:** Five concrete gaps remained after the initial cleanup:
1. `Buffer` used but not guaranteed under Expo/Hermes
2. SecureStore called with default (weak) options
3. Private key material not zeroized after use
4. No automated Create → Destroy → Assert Empty check
5. Expo Go presented as if it were a real security environment

**Actions that worked (in order):**

1. **Removed all Buffer usage**  
   Rewrote `src/services/presence.ts` to pure `Uint8Array` + local hex helpers. No Node Buffer dependency remains.

2. **Locked SecureStore options**  
   Every set/get/delete now uses:
   ```ts
   {
     keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
     requireAuthentication: true,
   }
   ```
   Prevents cloud backup / cross-device transfer of the private key where the platform honors the flags.

3. **Explicit zeroize**  
   After every create / get / sign, the temporary private-key `Uint8Array` is overwritten with zeros before it goes out of scope.

4. **Smoke test button**  
   Added “Run Smoke Test (Create → Destroy → Empty)” to `PresenceScreen`.  
   It creates an identity, verifies it exists, destroys it, and asserts `getCurrentDidKey()` returns `null`. Fails loudly if Destroy = Restart does not hold.

5. **Expo Go warning**  
   Updated `apps/mobile/README.md` to state clearly that Expo Go is exploration-only. Real SecureStore / authentication behavior requires a custom development client or production build.

**Commit messages:**
- `fix(mobile): remove all Buffer usage from did:key service`
- `fix(mobile): harden SecureStore options for did:key material`
- `feat(mobile): add Create → Destroy → Assert Empty smoke test button`
- `docs(mobile): honest status + Expo Go is exploration-only warning`

---

## Intentionally not logged

- Any private keys, seeds, tokens, or credentials (none were handled)
- Internal GitHub token values used by Actions (managed by GitHub)
- Personal contact channels outside the public SECURITY.md process

---

## How to extend this log

**Automatic:** Push a change that touches one of the watched paths. The workflow appends a dated commit table.

**Manual (for important decisions):** Add a new numbered section above the auto entries with:
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

---

## Auto entry — 2026-07-29

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `1be02da` | Delete renovate.yml | The_Archetecht | 2026-07-29 |
| `f2c608e` | Update packs section with clickable Solana Pay links | The_Archetecht | 2026-07-28 |
| `2e1f8b9` | Add pre-generated Solana Pay shareable links for Lite and Pack | The_Archetecht | 2026-07-28 |
| `85ced6c` | Add GitHub Actions status badges (CI + Posture Pack) | The_Archetecht | 2026-07-28 |
| `2d4e43d` | Improve visitor badge contrast for better visibility | The_Archetecht | 2026-07-28 |
| `933c7aa` | Add visitor count badge to README | The_Archetecht | 2026-07-28 |
| `e5dd993` | VENDING: prices Lite 11 / Pack 25 USDC | The_Archetecht | 2026-07-27 |


---

## Auto entry — 2026-07-30

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `357d230` | ci: temporary allow --legacy-peer-deps for npm installs to avoid ERESOLVE in CI (mobile/web) | The_Archetecht | 2026-07-29 |
| `ac78d55` | cargo(deps): update sha2 requirement from 0.10 to 0.11 | dependabot[bot] | 2026-07-29 |
| `9a816d0` | Potential fix for code scanning alert no. 8: Workflow does not contain permissions (#25) | The_Archetecht | 2026-07-29 |
| `a810937` | ci(deps): bump the github-actions group across 1 directory with 4 updates | dependabot[bot] | 2026-07-29 |
| `8354a0d` | Update directories requirement from 5 to 6 | dependabot[bot] | 2026-07-28 |
| `03ef980` | Update heed requirement from 0.20 to 0.22 | dependabot[bot] | 2026-07-28 |
| `f019c4e` | Update thiserror requirement from 1 to 2 | dependabot[bot] | 2026-07-28 |
| `7beece7` | Add gitleaks CI workflow | The_Archetecht | 2026-07-27 |

---

## Auto entry — 2026-07-31

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `d5eedae` | docs: add 2026-07-30 mobile identity hardening summary to README | The_Archetecht | 2026-07-30 |
| `632fde8` | Update README.md | The_Archetecht | 2026-07-30 |
| `4ec3328` | Update README.md | The_Archetecht | 2026-07-30 |
| `9ca51da` | Update README.md | The_Archetecht | 2026-07-30 |
| `d821f23` | Create identity-pack.json | The_Archetecht | 2026-07-30 |
| `199aba0` | Update presence.ts | The_Archetecht | 2026-07-30 |


---

## Auto entry — 2026-08-01

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `5f6beae` | README: check off optical air-gap proof + public status board | The_Archetecht | 2026-07-31 |
| `c4f3795` | gate v2: mean/variance + horizontal edge energy | The_Archetecht | 2026-07-31 |


---

## Auto entry — 2026-08-02

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `b201609` | Add Gateway Process inspiration note with primary CIA source link | The_Archetecht | 2026-08-02 |
| `9a66cb3` | Add RPC circuit breaker (closed/open/half-open) for resilience | The_Archetecht | 2026-08-01 |


---

## Auto entry — 2026-08-04

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `5e5210b` | README: point to decentralized static site/ (zero corps, IPFS-ready) | The_Archetecht | 2026-08-03 |
| `d80ff51` | Add simple on-device rate limiter for Interaction Gate | The_Archetecht | 2026-08-02 |


---

## Auto entry — 2026-08-06

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `c042fa3` | docs: README + REALITY reflect BM25/RAG/memory; 60s path; stand-out polish 2026-08-06 | The_Archetecht | 2026-08-06 |
| `c7040ad` | chat: reprint command bar after every response | The_Archetecht | 2026-08-06 |


---

## Auto entry — 2026-08-07

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `54d8f98` | README: Viewer count at top + integrity verifier status | The_Archetecht | 2026-08-07 |
| `6047219` | Add non-negotiable role constraints for Integrity Verifier | The_Archetecht | 2026-08-07 |


---

## Auto entry — 2026-08-13

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `d70be90` | Deploy: GitHub Pages for The Remote Viewer DApp (apps/remote-viewer) | The_Archetecht | 2026-08-13 |
| `a19fb73` | defense: document hash-chained incident log for adaptive learning | The_Archetecht | 2026-08-11 |


---

## Auto entry — 2026-08-14

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `ef5e829` | docs: end status lag, add historical disclaimer, Path B clarity, REPRODUCE.md, and review posture | The_Archetecht | 2026-08-13 |
| `d61a9f5` | ui: Sentinel logo as Orb AI icon | The_Archetecht | 2026-08-13 |


---

## Auto entry — 2026-08-15

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `f068812` | ci(solana): cargo update pin zeroize_derive before anchor build | The_Archetecht | 2026-08-14 |
| `aab0479` | ci(solana): pin Rust 1.79 so anchor-cli 0.30.1 compiles | The_Archetecht | 2026-08-14 |


---

## Auto entry — 2026-08-18

Generated by .github/workflows/command-log.yml. Non-secret commits only.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
| `805caa1` | Update tokenomics: set platform fee to 10%, community pool 10%, creator 80% on primary sales (per operator direction 2026-08-17) | The_Archetecht | 2026-08-17 |
| `69f8957` | docs: add START_HERE.md for complete beginners + clarify age install steps and simplify entry point | The_Archetecht | 2026-08-15 |
| `ce579ff` | docs: PROVEN-NEEDED C partial checked | The_Archetecht | 2026-08-14 |

