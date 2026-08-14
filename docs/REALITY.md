# Concepts → Reality Status

Last updated: **2026-08-14** (Phase 1 first cut: local demo VC issue/store/destroy-with-identity; prior mobile did:key hardening + smoke test; continuous beacon + Stage 1 validator list / Path B liveness gate; Path B recognition + pool + mobile UI / Hydra / vending / verifier)

**Rule:** No marketing. **PROVEN** = ran under user control on device. Scripts in git alone are not PROVEN.

## Enhanced Intelligence — The Sentinel (MoE)

| Stage | Status | Notes |
|-------|--------|-------|
| A Process experts | **SCAFFOLD** | experts.json / route.sh |
| B Dense multi-model | **PROVEN** | TinyLlama + Qwen2.5-Coder on Termux |
| C Sparse MoE weights | **PROVEN** | TinyMixtral-4x248M-MoE load+gen |
| D IA of IA | **DESIGN** | |

## Transport & identity

| Concept | Status |
|---------|--------|
| Optical air-gap (age + Soliton LT) | **PROVEN** |
| Local age identity | **PROVEN** (device-held; not in git) |
| Centralized key assignment | **REJECTED** |
| Mobile Viewer ID (npub) + profile | **DEMONSTRATED** | Create / export / remove / linked social (X) / private message flows on-device 2026-08-13 |
| Mobile did:key (Ed25519) + SecureStore | **DEMONSTRATED** | Hardened options (WHEN_UNLOCKED_THIS_DEVICE_ONLY + requireAuthentication); Create → Destroy → Empty smoke test; best-effort zeroize; Expo Go exploration-only 2026-08-14 |
| Local demo VC (issue / store / list / destroy-with-identity) | **DEMONSTRATED** | Phase 1 first cut; W3C-shaped self-issued scaffold credential; wiped on Destroy; no OpenID4VCI/VP yet 2026-08-14 |

## Digital vending & first validator role

| Concept | Status |
|---------|--------|
| Path B USDC memo + TRVL deliver | **PROVEN** | Solana memo → local deliver on GrapheneOS/Termux |
| `sales.log` sha256 + empty-frame refuse | **PROVEN** | log-sale + verifier |
| Integrity Verifier (contribution + sales) | **PROVEN** | overall_ok=1 attestation on-device 2026-08-07 |
| Contribution weight from verifier | **PROVEN** | record-weight → events.jsonl |
| Path B Founding + node option (design) | **LOCKED** | `docs/locked/04` + `17` |
| Path B FINISHED checklist (public) | **PUBLISHED** | `docs/public/PATH-B-FINISHED.md` |
| Path B recognition package | **OPERATIONAL** | collect-proof → make-attestation → verify-submission → issue-founding → install-founding |
| Path B builder guide | **PUBLISHED** | `docs/public/PATH-B-BUILDER.md` |
| Public buy page (`buy.html` + QR) | **OPEN** | static storefront |
| Mobile Shop (TRV credits / Solana / NFT mint / Aurora Borealis) | **DEMONSTRATED** | Credits balance, wallet connect, tiered mint, skin redeem/wear, field claim AR on-device 2026-08-13 |
| Validator beacon (ed25519 signed liveness) | **PROVEN** | Format + freshness + optical + sign/verify on reference device |
| Continuous Termux beacon loop | **IMPLEMENTED** | `modules/beacon/termux-start.sh` + wake-lock; PID/log under $HOME/trv-beacon |
| Stage 1 bootstrap validator list + Path B liveness gate | **OPERATIONAL** | 1-of-1 originator list; `require-active.sh` + issue-founding enforcement (Stage 0 escape available) |

## Transparency surfaces (requested)

| Concept | Status |
|---------|--------|
| Local console UI (Path B / Pool / Nodes cards) | **PROVEN** | `apps/ui` — copy-to-Termux; 127.0.0.1 only |
| Community Pool gross visibility | **OPERATIONAL** | `modules/pool/gross.sh` — public Solana memo volume; no custody; net not protocol-defined |
| Validated-node count (per identity path) | **OPERATIONAL** | `modules/nodes/count.sh` |
| Optional public tip publish + collect | **OPERATIONAL** | `modules/nodes/publish-tip.sh` + `collect-tips.sh` — no central registry |

## RAG & chat

| Concept | Status |
|---------|--------|
| Chunk ingest + seed docs | **SCAFFOLD** (exercised on reference node) |
| BM25 ranker (`modules/rag/bm25.py`) | **SCAFFOLD** (exercised) |
| TF-IDF vector index + hybrid retrieve | **SCAFFOLD** (exercised; 12 vectors on ref node) |
| Session memory (`memory.sh`) | **SCAFFOLD** |
| `scripts/chat.sh` front door | **SCAFFOLD** |
| Neural llama.cpp embeddings | **OPTIONAL** (falls back to TF-IDF) |

## Ops & sovereignty

| Concept | Status |
|---------|--------|
| Defense / Hydra multi-head | **PROVEN** | seal + contribution + sales verifier + quarantine gate; PASS on GrapheneOS/Termux 2026-08-07 |
| Contribution ledger | **PROVEN** | verify OK + verifier weight on reference node |
| Local operator UI `127.0.0.1` | **PROVEN** | `apps/ui` console — copy-to-Termux commands; Hydra/vending/verifier/Path B/Pool/Nodes heads; no shell exec in browser |
| Mobile client UI (Hub / Profile / Shop / Talk) | **DEMONSTRATED** | Full navigation, quick post, private message, linked social, wallet, NFT, Aurora skins, field claim on-device 2026-08-13 |
| Mobile did:key identity surface | **DEMONSTRATED** | presence.ts + PresenceScreen smoke test 2026-08-14 |
| Mobile local demo VC surface | **DEMONSTRATED** | credentials.ts + issue/list/destroy-with-identity 2026-08-14 |
| Termux reminders | **SCAFFOLD** |
| Chain settlement / live DePIN | **NOT STARTED** |

## Current counts (honest)

| Metric | Value |
|--------|------:|
| Path B Founding Members (external) | 0 |
| Validated nodes (distinct identity paths, observed) | originator-scale |
| Community Pool gross | public Solana memo volume (re-derive via `modules/pool/gross.sh`) |

## Reference environment

GrapheneOS + Termux + mobile client, branch `TheRemoteViewer`, status as of 2026-08-14.
