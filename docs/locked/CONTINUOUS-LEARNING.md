# Continuous learning

**Locked.** Learning is continuous across the stack, but **private Viewer content does not leave the device** for training unless the Viewer explicitly exports it.

## Layers

| Layer | What learns | Where | PROVEN? |
|-------|-------------|-------|---------|
| **L0 Preferences** | Tone, modality, language (EN/ES), signal comfort | On device | Scaffold policy; storage is local |
| **L1 Session skill** | Short-term context for *this* Viewer–Sentinel pair | On device / local runtime | Aligns with PROVEN local model runs |
| **L2 Conduct** | Mute/report/block themes → formal anonymous summaries | IA of IA governance path | Design — [MODERATION](MODERATION.md) |
| **L3 Protocol** | Operator-run improvements to optical/vending/verifier | Repo + operator machines | Only when REALITY says PROVEN |
| **L4 Entitlement** | On-chain program parameters via governance | Solana when live | Not PROVEN |

## Rules (non-negotiable)

1. **No silent cloud fine-tune** on private chats, camera, or mic.  
2. **Opt-in** for any aggregate conduct signal that leaves the device.  
3. **Destroy = Restart** wipes L0/L1 learning with identity.  
4. Learning **never** overrides: deepfake ban, Integrity real-data rule, 95/5 · 90/10 · 0% platform, constitutional baseline.  
5. “Hey Sentinel” answers may use **live search** when opted — that is retrieval, not uploading the Viewer corpus for training.  
6. Free tier may get weaker signal; it does **not** get weaker privacy on learning.  

## Viewer controls

- Tone / personality of *their* Sentinel  
- Clear local memory  
- Opt out of L2 conduct contribution  
- Export/delete local preference bundle  

## Engineering hooks

- `clients/shared/learning.ts` — preference schema + clear  
- Moderation → IA of IA intake (anonymous forms only)  
- Local models: continue operator PROVEN paths under Termux/Graphene when present  

## Honesty

Continuous learning is **product law**. Claiming a shipped global neural update loop is **Not PROVEN** until REALITY says otherwise.
