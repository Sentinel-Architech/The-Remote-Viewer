# Viewer mail under TRV domain (SCAFFOLD)

**Decision:** Optional addresses **under a TRV-controlled domain** (e.g. `name@mail.trv…` / final domain TBD).

## Identity rule (non-negotiable)

| Layer | Role |
|-------|------|
| **Keys / did** | Root identity and recovery |
| **TRV-domain address** | Contact channel + optional forward — **not** the vault root |

Email never replaces key backup. SMS is not root either (`docs/IDENTITY.md`).

## Phase A — alias / forward (target first ship)

- Viewer chooses a local-part (subject to availability + anti-abuse rules)
- Address: `local@<trv-mail-domain>`
- **Forwards** to an inbox they control (or drops until they set forward)
- TRV stores **routing config**, not a full mail corpus, where possible
- Issuance gated: e.g. **sub or active node** (or rate-limited free with weak signal)

## Phase B — hosted mailbox (optional later)

- Real IMAP/SMTP on TRV domain or partner/sovereign host
- Stronger abuse controls, backups, retention policy
- Prefer encryption at rest; zero-access ideal but costly

## Phase C — portable / node mail

- Viewer can point MX or use a mail node they run
- TRV name stays as directory identity

## DNS / ops requirements

- Domain owned by project or designated ops
- MX + SPF + DKIM + DMARC before public send/receive
- Abuse desk: suspend local-parts that spam
- No open relay

## Anti-abuse

- One primary address per Viewer entitlement (aliases limited)
- Reserved names blocked (`admin`, `security`, `integrity`, …)
- Rapid create/delete throttled

## Privacy

- Forwarding target is set by Viewer
- Logs: minimal (bounce/abuse), not content archival
- CSAM reports follow `docs/locked/SAFETY.md` regardless of transport

## Non-goals (v1)

- Competing with Gmail feature-for-feature
- Email as sole login
- Guaranteed inbox placement on day one of a new domain

*Domain string and registrar are ops choices — document the live domain here when chosen.*
