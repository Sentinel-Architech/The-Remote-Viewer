# Communication Freedom (LOCKED)

**Status:** LOCKED design · scaffold enforcement on mobile entitlement surface  
**Date:** 2026-08-14  
**Branch:** `TheRemoteViewer`

## Rule

Talk, text, phone-style voice, web messaging, and any other **human-to-human communication carried by The Remote Viewer network** is **FREE and UNLIMITED** for a Viewer who holds **either**:

1. **Yearly subscription** (active, non-expired), **or**  
2. **Built validator with a permanent node on** (Path B / Integrity Verifier class node that remains online as a permanent participant).

No metering, no per-message fee, no per-minute fee, no soft caps for entitled Viewers on in-network channels.

## Scope (honest)

| In scope (free + unlimited when entitled) | Out of scope |
|-------------------------------------------|--------------|
| TRV local messages / DIDComm-shaped inbox | Legacy SMS via mobile carriers |
| TRV voice/talk sessions over TRV mesh/relay when built | Unmodified PSTN landline/mobile minutes from telcos |
| TRV web/presence messaging between Viewers | Third-party apps (WhatsApp, iMessage, etc.) |
| Optical / air-gap human message exchange assisted by TRV tools | Guaranteeing delivery on networks TRV does not operate |
| Future TRV channels marked “human communication” under this policy | Spam/abuse that violates local law or host policy |

This policy does **not** claim TRV can zero-rate the entire public internet or national phone systems. It claims **TRV will not charge or meter** entitled humans for communication **on TRV rails**.

## Why two paths

| Path | Why |
|------|-----|
| **Yearly subscription** | Sustains development and non-validator users who want unlimited TRV communication without running hardware. |
| **Permanent validator node** | Operators who keep a node on strengthen the mesh. Many permanent nodes → network stays active, reachable, and safer under partition or attack. Their communication is free as recognition of that work. |

## Permanent node (definition for entitlement)

A **permanent validator node** means:

- Viewer has completed (or is operating) a **built validator** under Path B / Integrity Verifier rules, and  
- The node is configured as **permanent** (not a transient demo), and  
- The node is **on** (reachable to the network per heartbeat / beacon policy when that layer is live).

If the permanent node goes offline beyond allowed grace, validator-path entitlement may suspend until the node is on again. Subscription-path entitlement is independent of node uptime.

## Non-entitled Viewers

May still use **local-only** features (on-device identity, optical tools, local drafts). **Network-carried** human communication may be limited or unavailable until entitlement exists. Exact soft limits for non-entitled users are product parameters, not a contradiction of free-unlimited for entitled users.

## Safety

- Free + unlimited is not a license for abuse, coercion, or illegal content.  
- Entitlement does not override Destroy = Restart or local key sovereignty.  
- Many permanent nodes are the intended resilience strategy: communication stays active because the graph of always-on validators does not depend on a single company chat server.

## Implementation notes

- Entitlement checks are **local-first** with optional network attestation when chain/beacon is live.  
- Scaffold may use explicit local flags for subscription expiry and permanent-node status until billing + live validator registry ship.  
- No silent downgrade of this rule without a locked-doc revision.
