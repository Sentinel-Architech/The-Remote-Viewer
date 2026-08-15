# Wearables — compatibility & availability

**Locked with** [CLIENT-SURFACE](CLIENT-SURFACE.md). Wearables are **optional endpoints**, never required to be a Viewer.

## Principle

If a wearable can deliver a real modality (voice, haptics, glanceable signal, health-adjacent input the Viewer opts into), TRV should use it. Phone remains the primary custody and entitlement surface unless a wearable can hold keys safely (rare).

## Classes

| Class | Examples | TRV role |
|-------|----------|----------|
| **Watch** | Wear OS, select watchOS via phone bridge | Notifications, entitlement glance, wake/affirm, haptic signal tier |
| **Earbuds / headset** | BT audio | Mic/speaker for voice↔text when phone grants audio route |
| **Band / sensor** | BT LE sensors | Opt-in context only — never silent continuous exfil |
| **Standalone wearable OS** | Advanced watches with apps | Thin client: show Access state; heavy crypto stays on phone/node |

## Entitlement

- Unlimited comms still from **Solana** sub/node — not from owning a watch  
- Wearable shows **cached** entitlement; marks **stale** if phone/chain unreachable  

## Capability probes

Extend potential with:

```text
wearable.audioRoute: none | phone | watch | headset
wearable.haptics: none | basic | rich
wearable.glanceApp: false | true
wearable.keyCustody: none | phone_bridged   // no fake "watch holds root keys"
```

## Privacy

- No always-on mic on wearable without explicit Viewer session  
- Health/sensor data off by default; opt-in per category  
- Pairing uses OS BT security; TRV does not invent a weaker link  

## Availability

| Path | Support intent |
|------|----------------|
| Android phone + Wear OS | First wearable path |
| iPhone + watch via bridge | When iOS client exists under E2E rules |
| Earbuds only | Audio route through phone T0/T1 |
| No wearable | Full product still valid |

## Signal

Wearable can mirror `signalHint` (weak/standard/strong) as color + haptic pattern — text label remains on phone for a11y.
