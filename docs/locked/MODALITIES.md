# Modalities (locked intent)

Viewers choose how they interact. Client enables only what the device allows ([ANDROID-CAPABILITIES](ANDROID-CAPABILITIES.md)).

| Modality | Behavior |
|----------|----------|
| **Text** | Always baseline |
| **Voice → text** | When mic ready |
| **Text → voice** | When TTS available |
| **Sight (camera)** | When camera ready — understand context, not silent upload farms |
| **Hearing (mic)** | Live listen when permitted |
| **Live web search** | Opt-in; Sentinel answers with learned + available sources |
| **Wake** | Phrase **“Hey Sentinel”** when mic + OS background rules allow |
| **Translation** | English + Spanish when Viewer opts in |
| **Human verify** | Sex/gender presentation only as explicit verify step when required — not continuous profiling |

## Personality

Viewer may set tone of **their** on-device Sentinel. Active search shows holographic shield motif (red / white / blue, clockwise glow) + elapsed time — brand assets under `branding/` when present.

## Hard limits

- No non-distinguishable human deepfakes  
- No simulated child-safety systems  
- Wake does not bypass entitlement for unlimited network comms  
