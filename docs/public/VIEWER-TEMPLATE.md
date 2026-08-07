# Viewer directory entry (template)

> **The Remote Viewer uses the network. The Sentinel (core) does not require this.**

Fill what you want public. Delete lines you skip. **Never** paste AGE-SECRET-KEY or seed material.

```markdown
| <alias> | A or B | <roles> | <contact> | <proof link or tip hash> | <YYYY-MM> |
```

### Field guide

| Field | Meaning |
|-------|---------|
| **alias** | Public handle (not required to match legal name) |
| **Path** | `A` invitation originator track · `B` independent completion |
| **Roles** | e.g. Integrity Verifier · none yet |
| **Contact** | X / Matrix / email / other — whatever you accept from peers |
| **Proof** | Non-secret: attestation gist, contribution tip `sha256`, public commit, TEST.md run notes |
| **Since** | Year-month you want shown |

### Example

```markdown
| example-viewer | B | Integrity Verifier | Matrix: @you:example.org | tip=abc123… · gist.github.com/… | 2026-08 |
```

Submit via PR to `docs/public/VIEWERS.md` or a GitHub Discussion titled `Viewer directory: <alias>`.
