# TRV Viewer Hub

Hosted Remote Viewer command surface for **The Sentinel**.

**Live:** [sentinelsecurityprotocol.grok.me](https://sentinelsecurityprotocol.grok.me)  
**Branch:** [`TheRemoteViewer`](https://github.com/Sentinel-Archetecht/The-Remote-Viewer/tree/TheRemoteViewer)  
**Status (2026-08-22):** **LIVE** hosted DApp — not a scaffold. SENTINEL OS jack-in is in this folder; grok.me picks it up on republish.

This folder is the product UI Remote Viewers use today. It is a **separate surface** from the local-first optical air-gap / Path B node. Those paths are unchanged and still live under `optical-airgap/`, `digital-vending/`, and `modules/`.

---

## What is live

| Station | Where | Notes |
|---------|-------|--------|
| Sign-in | `/login` | Google, X, or email-password (Better Auth) |
| Age + OFAC | overlay on first hub entry | Required before Command |
| Briefing | Command, after first watch | Optional 12-station map. Skip / Later. Seals `tutorial_at` if you finish it. |
| Command | `/hub` | **Intercept now** + claim TRV. First win lives here. |
| Daily Watch | `/hub` Defend · Mesh · Honeypot | Intercept hostile packets, then claim TRV. Missed days damage health |
| SENTINEL OS jack-in | `/hub/neuron` · `/hub/os` | 3D neuron flight. Scan, name, pulse. Catalog → OS memory. Pulse counts as watch |
| Command Deck | `/hub/deck` | Rapier physics. Synapse (HSV / WNV / rabies in CSF) + God's Eye (emission / runoff / worm — byproducts only). Three seizes arm OS auto-defense. Local dossier. |
| Profile vault | `/hub/profile` | Portrait, identity extras, finances, docs, live icon |
| Public card | `/v/$handle` | Shareable Viewer card |
| OS | `/hub/os` | Super / Cipher / Watcher / Privacy / Mesh / Healer + mic |
| Live / people / make / rails | hub rails | Forum, friends, live, studio, shop, gateway, billing |
| Citizen lock | `/hub/citizen` | On-device hash. Not hardware Keystore. Not company recovery |

Stack: TanStack Start + Router · Vite · React 19 · Tailwind v4 · Better Auth · PGLite (preview) / Neon (when `DATABASE_URL` is set).

Migrations: `migrations/0001_auth.sql` … `0015_tutorial.sql`.

---

## What this is not

Be exact. Do not read this folder as if every TRV paper is shipped.

| Claim | Reality |
|-------|---------|
| Solana `trv_governance` | **SCAFFOLD** — still `solana/`, not mainnet, not audited |
| Expo / Play / App Store client | **PARKED** — `apps/mobile` |
| Hardware Keystore / SD-JWT / OpenID4VCI | **Not implemented** |
| Company recovery of age keys | **Never.** Destroy = Restart on the local path |
| This hub holds no identity | **False.** Session identity lives in Postgres (Better Auth + `viewer_profiles`) |
| Replacement for optical air-gap | **No.** Optical TRVL remains the local-first PROVEN path |

`apps/web` is the **old Vite scaffold**. Do not run it expecting a product UI. Use this folder.

---

## Run

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Archetecht/The-Remote-Viewer.git
cd The-Remote-Viewer/apps/hub
npm install
npm run dev
```

Dev server binds `0.0.0.0:8080`. Without `DATABASE_URL`, PGLite (WASM Postgres) boots in-process so the hub is usable. Set `DATABASE_URL` (Neon or any Postgres) for a durable deploy.

```bash
npm run typecheck
npm run build          # vite build + migrate when DATABASE_URL is set
```

Copy [`.env.example`](.env.example). Never commit secrets.

---

## Briefing contract

New Viewers cannot skip the map.

1. Age gate.
2. Twelve stations (welcome → Command → watch → OS → live → people → make → rails → profile → lock → chrome → seal).
3. Last step requires an explicit checkbox, then **Seal**.
4. `completeTutorial()` writes `viewer_profiles.tutorial_at = now()` (coalesce — first seal wins).
5. After reload the overlay does not return.

Source: `src/lib/trv/briefing.ts`, `src/components/viewer-briefing.tsx`, `migrations/0015_tutorial.sql`.

---

## Honesty about hosting

The original TRV rule still holds for **local keys**: nothing in this hub is a recovery service.

The hub **is** a hosted Viewer surface. It uses accounts. That does not cancel the local-first node, optical air-gap, or Path B packs. It also does not make Solana live.

Locked architecture (`docs/locked/`) remains the long-term privacy design. This DApp does not claim Phase 2 selective disclosure is done.
