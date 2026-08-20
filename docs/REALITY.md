# Reality — authority for PROVEN / LIVE claims

**Updated 2026-08-20.**  
**Rule:** PROVEN = ran under operator control on a real device. Scripts in git alone are not PROVEN.  
**LIVE** = a hosted product surface that is running now. LIVE is not PROVEN-on-device, and it is not mainnet.

**Promotion:** [PROVEN-NEEDED.md](PROVEN-NEEDED.md) · **Protocol:** [PROTOCOL.md](PROTOCOL.md)

---

## LIVE (hosted Viewer Hub)

| Surface | Status | Notes |
|---------|--------|--------|
| Viewer Hub DApp | **LIVE** | [`apps/hub`](../apps/hub) · [sentinelsecurityprotocol.grok.me](https://sentinelsecurityprotocol.grok.me) |
| Mandatory briefing | **LIVE** | 12 stations, no skip; `viewer_profiles.tutorial_at` |
| Daily Watch | **LIVE** | Defend / Mesh / Honeypot → claim TRV |
| Profile vault | **LIVE** | `/hub/profile` · public card `/v/$handle` · live icon |
| Age + OFAC gate | **LIVE** | Before Command |
| Citizen lock | **LIVE (hash)** | On-device hash. Not hardware Keystore |

This hub uses accounts (Better Auth + Postgres). That does not make it a recovery service for age keys.

---

## PROVEN (device-backed)

| Surface | Status | Notes |
|---------|--------|--------|
| Optical air-gap | **PROVEN** | age → Soliton LT (TRVL) → peel → decrypt |
| Local age identity | **PROVEN** | Device-held; Destroy = Restart |
| Path B USDC memo → TRVL | **PROVEN** | Payment ≠ delivery |
| Empty-frame refuse | **PROVEN** | log-sale + verifier |
| Integrity Verifier | **PROVEN** | contribution + sales.log |
| Path B recognition loop | **OPERATIONAL** | |
| Pool gross visibility | **OPERATIONAL** | |
| Local models / MoE load | **PROVEN** | operator-run |
| Hydra / integrity-pulse | **PROVEN** | |
| Local operator UI | **PROVEN** | |

---

## DEMONSTRATED (operator device)

| Surface | Status | Notes |
|---------|--------|--------|
| **PWA baseline** | **DEMONSTRATED** | B2 — `127.0.0.1:8080` |
| **On-device learning L0** | **DEMONSTRATED** | H1 persist · H2 Reset wipe · H3 no upload |
| **android-cap Termux probe** | **DEMONSTRATED (partial C)** | 2026-08-14 Pixel 7: API 37, localRuntime true, camera ready_or_present, mic tool_present; **keystore not probed** (needs native shell) |

---

## Not PROVEN / not live

| Item | State |
|------|--------|
| `trv_governance` on chain | Scaffold · CI blocked (**A**) |
| Full mapTier + Keystore instrumentation | Needs Android shell |
| Wear companion | Scaffold (**D**) |
| Entitlement RPC | Needs **A** |
| $96 rails / settlement | Policy (**G**) |
| Live Integrity network | Scaffold (**F**) |
| Path B external founders | **0** |
| Expo / app-store mobile | PARKED (`apps/mobile`) |
| `apps/web` Vite shell | Old scaffold — superseded by `apps/hub` |

## Track A

Anchor **0.32.1**. [CI-BLOCKER.md](CI-BLOCKER.md).
