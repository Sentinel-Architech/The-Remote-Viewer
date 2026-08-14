# Mobile scaffold inventory

**Status:** Complete local scaffold as of 2026-08-14  
**Claim level:** SCAFFOLD ONLY — no production security claims  
**Branch:** `TheRemoteViewer`

## Run

```bash
cd apps/mobile
npm install
npx expo start --host lan
```

Camera + full STT: use a development or release build (not Expo Go alone).

## Tabs

| Tab | Surfaces |
|-----|----------|
| **Identity** | did:key · Destroy · profile · connections · optical share · demo VC · deepfake policy · mute/report/block · XXX · IA of IA inquiry · EN/ES · Male/Female attestation · tutorial replay · smoke test |
| **Messages** | Local signed messages · VoiceField · entitlement hint · blocked DID filter |
| **Senses** | Communication Freedom · Hey Sentinel (personality, RWB shield, timer) · camera · listen · DDG search |

## Services (`src/services/`)

| File | Role |
|------|------|
| `presence.ts` | did:key create / load / sign / destroy |
| `credentials.ts` | Demo VC |
| `connections.ts` | On-device graph + export/import |
| `didcomm.ts` | Local basic messages |
| `profile.ts` | Local profile + kind-0/3 shaped export |
| `voice.ts` | TTS + STT |
| `search.ts` | DuckDuckGo Instant Answer |
| `sentinelAsk.ts` | Wake phrase + internet answer |
| `sentinelPersonality.ts` | Tone / name |
| `locale.ts` | EN/ES preference |
| `humanVerification.ts` | Male/Female attestation |
| `tutorial.ts` | One-time tour flag |
| `entitlement.ts` | Yearly sub OR node-host reward |
| `deepfakePolicy.ts` | Locked rule ack |
| `xxxPreference.ts` | Adult gate (default blocked) |
| `communityModeration.ts` | Mute / report / block |
| `iaOfIaConduct.ts` | Private inquiry draft + conduct steer log |

## Locked policy cross-refs

| Doc | Topic |
|-----|--------|
| `docs/locked/15-Communication-Freedom.md` | Free unlimited TRV comms |
| `docs/locked/16-No-Human-Deepfakes.md` | Distinguishable likeness only |
| `docs/locked/17-Conduct-Community-IA.md` | XXX, mute/report/block, IA of IA |

## Explicitly NOT live

- Path B external founding members registry
- Live permanent-node heartbeat attestation
- Billing for yearly subscription
- Multi-agent IA of IA network ballot
- Carrier SMS/PSTN zero-rate
- Full on-device MoE Sentinel

## Smoke

Identity tab → **Smoke Test** exercises create → social stubs → destroy cycle.
