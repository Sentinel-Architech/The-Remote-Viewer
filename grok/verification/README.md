# Verification — Credentials, Citations, DOIs

One place for reviewers and CI to check professional claims and academic citations before a specialist skill merges.

**Local-first where possible. Crossref only for DOI existence/metadata.**

---

## What this package covers

1. **Professional credentials** — public lookup, not KYC
2. **Academic citations** — existence + claim match
3. **Hallucinated DOIs** — resolve or reject
4. **Crossref access** — polite pool, rate limits
5. **Resilience** — exponential backoff + circuit breaker

---

## 1. Professional credentials (reviewer checklist)

Contributor should provide in the PR (public links only):

- Name / professional name
- Domain + approximate experience
- Credential type + issuer
- Public verification link (state board, AMS, Nursys, university directory, ORCID, etc.)

| Outcome | Action |
|---------|--------|
| Public credential confirms claim | Merge; note “credential cross-checked” in PR |
| Plausible, no independent confirm | Merge as `community` / unverified-professional |
| No public signal | Ask for link or decline professional framing |

Never store license scans, SSNs, or private documents in the repo.

Common public checks:

| Domain | Where to look |
|--------|----------------|
| Meteorology | AMS directory, NWS/NOAA, university pages |
| Geology | State PG board, AIPG, survey staff lists |
| Special education | State teacher license lookup, district directory |
| Nursing | State board / Nursys |
| Engineering | State PE lookup, NCEES where public |
| Research | ORCID, Google Scholar, institutional profile |

---

## 2. Academic citations

For each material claim that cites a paper:

1. **Exists?** DOI (or PMID/arXiv) resolves.
2. **Metadata match?** Title, authors, year align with the claim.
3. **Supports claim?** Abstract/relevant section actually says what the skill asserts.
4. **Status?** Not retracted; preprint vs peer-reviewed labeled if it matters.

Prefer official guidelines (CDC, AMS, state code, ILCOR, etc.) when they exist; use papers as support, not as a substitute for the governing standard.

---

## 3. Hallucinated DOIs — the only reliable test

```text
https://doi.org/<doi>
https://api.crossref.org/works/<doi>?mailto=you@example.com
```

| Result | Meaning |
|--------|--------|
| Resolves + metadata matches | Accept |
| 404 / DOI not found | Hallucinated or wrong — strip |
| Resolves but wrong paper | Invalid for this claim — strip or fix |

Shape checks (`10.xxxx/...`) are filters only. **Resolution is mandatory.**

---

## 4. Crossref rate limits (polite pool)

| Pool | How | Single DOI | List/query | Concurrency |
|------|-----|------------|------------|-------------|
| Public | No ID | 5/sec | 1/sec | 1 |
| **Polite** | `mailto=` email | **10/sec** | 3/sec | 3–5 |
| Plus | Paid token | 150/sec | higher | — |

Always use polite pool:

```bash
curl "https://api.crossref.org/works/10.1038/nature12373?mailto=you@example.com"
```

HTTP **429** → back off. Cache results. Sequential checks for PR review are fine.

---

## 5. Resilience: backoff + circuit breaker

**Exponential backoff** (per call):

```text
delay = min(cap, base * 2^attempt) + jitter
```

Typical: base 1s, cap 60s, jitter up to 25%.

- **404** → do not retry (DOI missing is a final answer).
- **429 / 5xx** → retry with backoff.

**Circuit breaker** (whole service):

```text
CLOSED → normal
OPEN   → fail fast after sustained failures (e.g. 5× 429/5xx)
HALF_OPEN → few probes after cooldown (30–60s)
```

- 404 does **not** count as breaker failure.
- Backoff retries a struggling call; breaker stops calling a struggling service.

Use both for batch/CI. Backoff alone is enough for a few manual DOI checks.

---

## 6. Tool: `verify_dois.py` — usage examples

Run from the verification directory (or pass paths relative to your cwd).

### Check a single known DOI

```bash
cd grok/verification
python verify_dois.py --mailto you@example.com 10.1038/nature12373
```

Example output:

```text
OK        10.1038/nature12373 — A safe operating space for humanity

Summary: 1 OK, 0 bad, 0 skipped, 1 total
```

### Check several DOIs at once

```bash
python verify_dois.py --mailto you@example.com \
  10.1038/nature12373 \
  10.1103/PhysRevLett.116.061102 \
  10.9999/fake.doi.hallucinated
```

Example output:

```text
OK        10.1038/nature12373 — A safe operating space for humanity
OK        10.1103/PhysRevLett.116.061102 — Observation of Gravitational Waves from a Binary Black Hole Merger
MISSING   10.9999/fake.doi.hallucinated (DOI not found (404))

Summary: 2 OK, 1 bad, 0 skipped, 3 total
```

Exit code is `1` if any DOI is MISSING or ERROR (useful for CI).

### Scan a skill file (extract + resolve)

```bash
python verify_dois.py --mailto you@example.com --file ../skills/first-aid/SKILL.md
python verify_dois.py --mailto you@example.com -f ../skills/physics/SKILL.md
```

The script finds every `10.xxxx/...` pattern in the file, de-duplicates, and resolves each one.

### No mailto (still works; public pool, stricter limits)

```bash
python verify_dois.py 10.1038/nature12373
```

Prefer `--mailto` so Crossref can place you in the polite pool.

### Tune the circuit breaker

```bash
python verify_dois.py --mailto you@example.com \
  --threshold 3 \
  --cooldown 60 \
  --file ../skills/mathematics/SKILL.md
```

| Flag | Default | Meaning |
|------|---------|--------|
| `--mailto` | `sentinel-doi-check@localhost` | Email for Crossref polite pool |
| `--file` / `-f` | — | Read DOIs from this markdown/text file |
| `--threshold` | `5` | Failures before circuit opens |
| `--cooldown` | `45` | Seconds to stay OPEN before probing again |

### What each status means

| Status | Meaning | Action |
|--------|--------|--------|
| **OK** | DOI resolved; title shown when available | Keep; spot-check claim vs paper |
| **MISSING** | Crossref 404 — no such DOI | Treat as hallucinated/wrong; remove |
| **ERROR** | HTTP/network failure after retries | Retry later or check connectivity |
| **SKIPPED** | Circuit breaker open | Wait for cooldown; re-run batch |

### CI-style one-liner

```bash
cd grok/verification && \
  python verify_dois.py --mailto ci@yourdomain.example --file ../skills/first-aid/SKILL.md
```

Non-zero exit if any DOI failed verification.

---

## 7. Error handling examples

How the tool behaves when things go wrong — and what you should do.

### Hallucinated / unknown DOI (404)

```bash
python verify_dois.py --mailto you@example.com 10.9999/this.does.not.exist
```

```text
MISSING   10.9999/this.does.not.exist (DOI not found (404))

Summary: 0 OK, 1 bad, 0 skipped, 1 total
```

- **No retries** — 404 is final.
- **Circuit breaker not tripped** — missing DOI is not a service outage.
- **Action:** Remove or replace the citation in the skill. Exit code `1`.

### Rate limited (429) — backoff then recover

When Crossref returns 429, the script waits with exponential backoff (≈1s, 2s, 4s, …) and retries the same DOI.

```text
# (internal behavior — you mainly see delay, then either OK or ERROR)
OK        10.1038/nature12373 — A safe operating space for humanity
```

If every retry still gets 429:

```text
ERROR     10.1038/nature12373 (exhausted retries)
```

**Action:** Slow down the batch, confirm `--mailto` is set, wait a minute, re-run. Do not loop tightly in a shell `while` without sleep.

### Sustained failures — circuit opens

After enough consecutive 429/5xx/network failures (default 5), later DOIs are not attempted:

```text
ERROR     10.1111/example.one (HTTP 429)
ERROR     10.1111/example.two (HTTP 429)
...
SKIPPED   10.1111/example.six (circuit open after failures)
SKIPPED   10.1111/example.seven (circuit open)

Summary: 0 OK, 2 bad, 2 skipped, ...
```

**Action:** Wait for `--cooldown` seconds (default 45), then re-run only the remaining DOIs. Or raise `--cooldown` / lower concurrency by running sequentially (already the default).

### Network timeout / offline

```text
ERROR     10.1038/nature12373 (exhausted retries)
```

or after repeated timeouts the circuit may open and further IDs show `SKIPPED`.

**Action:** Check connectivity. On Termux, confirm DNS and that `api.crossref.org` is reachable. Re-run when online. No skill change required if the DOI was previously known good.

### File missing or unreadable

```bash
python verify_dois.py --file ../skills/does-not-exist/SKILL.md
```

```text
# Python traceback: FileNotFoundError
```

**Action:** Fix the path. Use paths relative to your current directory.

### No DOIs in file

```bash
python verify_dois.py --file ../skills/simple-comms/SKILL.md
```

```text
No DOIs provided or found.
```

Exit code `0` — nothing to verify is not a failure.

### Mixed batch (real + fake + rate pressure)

```bash
python verify_dois.py --mailto you@example.com \
  10.1038/nature12373 \
  10.9999/fake.doi \
  10.1103/PhysRevLett.116.061102
```

Possible output:

```text
OK        10.1038/nature12373 — A safe operating space for humanity
MISSING   10.9999/fake.doi (DOI not found (404))
OK        10.1103/PhysRevLett.116.061102 — Observation of Gravitational Waves from a Binary Black Hole Merger

Summary: 2 OK, 1 bad, 0 skipped, 3 total
```

Exit code `1` because of the MISSING entry. Fix the bad citation; re-run until summary shows `0 bad`.

### CI pattern with explicit failure

```bash
cd grok/verification || exit 1
python verify_dois.py --mailto ci@yourdomain.example --file ../skills/first-aid/SKILL.md
status=$?
if [ "$status" -ne 0 ]; then
  echo "DOI verification failed — fix MISSING/ERROR entries before merge"
  exit "$status"
fi
```

### Quick decision table

| You see | Means | Do this |
|---------|--------|--------|
| `MISSING` | DOI does not exist | Strip or correct citation |
| `ERROR` … exhausted retries | Rate limit or network after backoff | Wait, check network, re-run |
| `SKIPPED` … circuit open | Too many recent failures | Wait cooldown, re-run remainder |
| `No DOIs provided or found` | Nothing to check | OK for skills without DOIs |
| Traceback `FileNotFoundError` | Bad `--file` path | Fix path |
| Exit code `1` | At least one MISSING or ERROR | Do not merge until clean |

---

## 8. PR reviewer flow (short)

1. Credential links present? Public check → verified / community / reject framing.
2. Material citations have DOIs or official guideline URLs?
3. Run `verify_dois.py` on the skill (or paste DOIs).
4. Spot-check that claims match the resolved papers.
5. Merge with appropriate note; no private credential data in git.

---

## 9. What this is not

- Not a licensing authority
- Not a substitute for peer review of the skill’s scientific content
- Not an on-device runtime dependency (verification stays in contributor/CI path)

**Primary sources. Resolvable identifiers. Honest limits.**
