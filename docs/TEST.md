# How others can test TRV

**Branch:** `TheRemoteViewer`  
**Rule:** Report what you actually ran. Do not paste age secrets.

## 0. Clone

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer
bash scripts/install-hooks.sh   # chmod hooks + scripts
```

## 1. Zero-model (anyone with bash + python)

```bash
bash modules/defense/integrity-pulse.sh
bash modules/rag/seed-trv-docs.sh
RAG_PLAIN=0 bash modules/rag/retrieve.sh "what can you do"
python3 modules/rag/bm25.py -k 3 "optical e2e"
bash modules/contribution/record.sh verification 1 "test from clone"
bash modules/contribution/verify.sh
bash apps/ui/serve-ui.sh   # http://127.0.0.1:8765/
```

Expect: pulse output, BM25/hybrid hits on capabilities or optical chunks, VERIFY OK, UI binds localhost.

## 2. Chat (needs llama-cli + GGUF)

```bash
export LLAMA_CLI=$HOME/llama.cpp/build/bin/llama-cli
bash scripts/chat.sh
# at you> ask something; /memory shows stored turns; /exit to quit
```

## 3. Optical air-gap

See `optical-airgap/INSTALL.md`, then:

```bash
bash optical-airgap/scripts/e2e-age-lt.sh "hello"
```

## 4. Digital vending + Integrity Verifier (PROVEN 2026-08-07)

**Reference environment:** GrapheneOS + Termux, branch `TheRemoteViewer`.

### 4a. SKU map (no network)

```bash
bash digital-vending/memo-to-sku.sh "TRV-Posture-Lite"
# expect: trv-posture-lite

bash digital-vending/memo-to-sku.sh "TRV-Posture-Pack"
# expect: trv-posture-pack
```

### 4b. Manual deliver → peel → decrypt

```bash
# throwaway buyer identity (Destroy after)
mkdir -p $HOME/trv-test-vault
age-keygen -o $HOME/trv-test-vault/key.txt
# copy the printed Public key: age1...

RECIP='age1...'   # paste the REAL public key only

cd digital-vending
bash seller-ops.sh deliver trv-posture-lite "$RECIP"
# expect: encrypt ok, TRVL frames written under $HOME/trv-deliver/*.trvl

# buyer side
FRAMES=$(ls -t $HOME/trv-deliver/trv-posture-lite-*.trvl | head -1)
cat "$FRAMES" | bash buyer-receive.sh $HOME/trv-test-vault/key.txt
# expect: peel ok errors=0, exact_len match, plaintext TRV POSTURE LITE

# wipe test identity
rm -rf $HOME/trv-test-vault
```

### 4c. Integrity Verifier

```bash
# clean empty-hash noise if any prior tests left it
# (only if sales.log has e3b0c442… empty digests)

bash modules/integrity-verifier/verify-contribution.sh
bash modules/integrity-verifier/verify-sales.sh
bash modules/integrity-verifier/attest.sh
# expect: overall_ok=1 when both checks pass

bash modules/integrity-verifier/record-weight.sh pass "e2e verifier"
```

Attestation file lands at:
`~/.local/share/remote-viewer/integrity-verifier/attestations/`

### 4d. One-shot memo → SKU → deliver

```bash
bash digital-vending/deliver-from-memo.sh \
  "TRV-Posture-Lite" \
  "<tx-signature-or-test-sig>" \
  "age1..." \
  11
```

Without a real recipient drop, auto-deliver exits 2 and writes a `.PENDING` marker (correct).

### 4e. Watcher (optional, needs RPC + uptime)

```bash
export SALES_ADDRESS='HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv'
export SOLANA_RPC_URL='https://api.mainnet-beta.solana.com'
cd digital-vending
bash watch-sales-notify-v2.sh
# self-test OK → polls for USDC memos → map_memo_to_id via catalog.json
```

## Reporting

Open an issue with: OS, Termux yes/no, commands, output. **No vault keys. No age secret keys.**

Path B finishers: independent completion of the full system (including this e2e) earns Founding Member + Integrity Verifier node option. Packs stay paid. See `docs/locked/04-Founding-Sovereign-Viewer.md` and `docs/locked/17-Validator-Node-First-Role.md`.
