# The Remote Viewer — Personas

> **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

Each opt-in Viewer may publish a **persona** file. Personas are social identity — **not** Sentinel vault keys.

## Layout

```text
docs/public/personas/
  README.md                 ← this file
  _TEMPLATE.md              ← copy to <alias>.md
  sentinel-archetecht.md    ← example / originator
  <your-alias>.md           ← one file per persona
```

## Create yours

1. Copy `_TEMPLATE.md` → `<alias>.md` (lowercase, hyphens OK)
2. Fill public fields only
3. Attach **proofs** (see below)
4. Open a PR to `TheRemoteViewer` **or** link the raw file from your directory row in [`VIEWERS.md`](../VIEWERS.md)

## Proof attach (Sentinel → Remote Viewer)

Proofs are **user-published** artifacts. The Sentinel never auto-uploads.

| Proof type | What to publish | How to verify |
|------------|-----------------|---------------|
| Path A / B | Statement + date + reference to locked doc 04 | Peer review / originator ack for A; completion notes for B |
| Integrity Verifier | `overall_ok` attestation JSON **without secrets** (redact paths if needed) hosted on gist/repo you control | Anyone recomputes or trusts published hash |
| Contribution tip | `sha256` of ledger tip or public export excerpt | `modules/contribution/verify.sh` on their clone |
| Hydra PASS | Timestamp + `RESULT: PASS` log line (no keys) | Re-run pulse on their node |
| Repo work | Commit SHA on public branch | GitHub |

**Reject:** AGE-SECRET-KEY, seed phrases, private sales logs, full identity files.

### Attach block (paste into your persona)

```markdown
## Proofs

| Claim | Evidence | Date |
|-------|----------|------|
| Path B | <url or tip hash> | YYYY-MM-DD |
| Integrity Verifier | <url to redacted attest-*.json> | YYYY-MM-DD |
```

## Directory link

In [`VIEWERS.md`](../VIEWERS.md), set **Proof** column to your persona file:

```text
docs/public/personas/<alias>.md
```

## Rules

- One primary persona per human preferred (alts allowed if disclosed)
- Impersonating Path A / Founding is grounds for removal
- Leaving: PR delete your file + directory row

## Related

- [`VIEWERS.md`](../VIEWERS.md) · [`VIEWER-TEMPLATE.md`](../VIEWER-TEMPLATE.md)
- [`docs/locked/18-Sovereign-Social-Layer.md`](../../locked/18-Sovereign-Social-Layer.md)
