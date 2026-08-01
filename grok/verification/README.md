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

## 7. PR reviewer flow (short)

1. Credential links present? Public check → verified / community / reject framing.
2. Material citations have DOIs or official guideline URLs?
3. Run `verify_dois.py` on the skill (or paste DOIs).
4. Spot-check that claims match the resolved papers.
5. Merge with appropriate note; no private credential data in git.

---

## 8. What this is not

- Not a licensing authority
- Not a substitute for peer review of the skill’s scientific content
- Not an on-device runtime dependency (verification stays in contributor/CI path)

**Primary sources. Resolvable identifiers. Honest limits.**
