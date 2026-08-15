# TRV PWA baseline (any phone)

First client surface for **T0**: any modern mobile browser.

## Goals

- Enter without Graphene, without Play, without a native install  
- Show entitlement state (free / $96 / node) when chain is readable  
- Capability honesty via shared types from `../android-cap` where relevant  
- Tutorial once for new logins (see `onboarding/`)

## Non-goals (this folder)

- Full native camera/mic pipelines (T1+ shell)  
- Claiming unlimited comms without chain proof  

## Layout

```text
clients/pwa/
  README.md
  index.html          # shell
  app.js              # boot + tier banner
  styles.css
  onboarding.md       # copy for first-run tutorial
```

Policy: `docs/locked/CLIENT-SURFACE.md`
