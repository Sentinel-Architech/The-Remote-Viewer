# Client Applications

**Updated:** 2026-08-20

| Client | Path | Status |
|--------|------|--------|
| **Viewer Hub** | [`hub/`](hub/) | **LIVE** hosted DApp — briefing, daily watch, profile vault, Command, Command Deck |
| Local operator UI | [`ui/`](ui/) | PROVEN local static UI (`serve-ui.sh`) |
| Vanilla remote-viewer | [`remote-viewer/`](remote-viewer/) | Legacy local HTML |
| Web Vite shell | [`web/`](web/) | **Old scaffold** — not the product UI. Use `hub/` |
| Expo mobile | [`mobile/`](mobile/) | **PARKED / SCAFFOLD** — not an app-store client |
| Shared types | [`shared/`](shared/) | Types / constants for the parked mobile+web shells |

## Viewer Hub (the real DApp)

Source: [`apps/hub`](hub/).  
Live: [sentinelsecurityprotocol.grok.me](https://sentinelsecurityprotocol.grok.me)

This is a production Viewer surface (TanStack Start, Better Auth, PGLite/Neon). It is **not** a claim that locked Phase 2 crypto (SD-JWT, OpenID4VCI, hardware Keystore, burn) is implemented. Those remain in [`docs/locked/`](../docs/locked/).

Citizen lock on the hub is an **on-device hash**. Destroy = Restart still applies to age keys on the local path.

## What must not be contradicted

- Do **not** describe “web & mobile clients” as if both were still scaffolds. **Web product = `apps/hub` (LIVE). Mobile Expo = still scaffold.**
- Do **not** run `apps/web` and expect the Sentinel hub. You will get the old notice.
- Do **not** read hub-live as Solana-live. Chain remains SCAFFOLD.

```
apps/
├── hub/            # LIVE Viewer Hub DApp
├── ui/             # Local operator UI (PROVEN)
├── remote-viewer/  # Legacy vanilla
├── web/            # Old Vite scaffold (superseded by hub/)
├── mobile/         # Expo scaffold (PARKED)
└── shared/         # Shared types for web/mobile scaffolds
```

## Command Deck

Synapse + God's Eye field, Mesh Board, HUB, Internal Affairs. Source: [`apps/command-deck`](./command-deck).
