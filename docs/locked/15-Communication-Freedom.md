# Communication Freedom (LOCKED)

**Status:** LOCKED design · scaffold enforcement on mobile entitlement surface  
**Date:** 2026-08-14 (node-host reward path clarified)  
**Branch:** `TheRemoteViewer`

## Rule

Talk, text, phone-style voice, web messaging, and any other **human-to-human communication carried by The Remote Viewer network** is **FREE and UNLIMITED** for a Viewer who holds **either**:

1. **Yearly subscription** (active, non-expired), **or**  
2. **Node-host opt-in** — the Viewer has **opted to be hosted as a node** and that node is **on**.

**Reward principle:** Every Viewer who opts to host as a node is rewarded with unlimited TRV communication. That is the recognition for keeping the mesh alive. No metering for entitled Viewers on in-network channels.

## Scope (honest)

| In scope (free + unlimited when entitled) | Out of scope |
|-------------------------------------------|--------------|
| TRV local / network messages, voice/talk on TRV rails, web/presence messaging between Viewers | Legacy carrier SMS / PSTN minutes |
| Optical / air-gap human exchange assisted by TRV tools | Third-party apps TRV does not operate |
| Future TRV channels marked “human communication” under this policy | Guaranteeing delivery on foreign networks |

TRV does **not** zero-rate the public internet or national phone systems. It does **not charge or meter** entitled humans for communication **on TRV rails**.

## Why two paths

| Path | Why |
|------|-----|
| **Yearly subscription** | Sustains development for Viewers who want unlimited TRV communication without hosting. |
| **Opt-in node host** | **Reward:** every Viewer who chooses to be hosted as a node gets unlimited communication. Many opted-in nodes → network stays active and safer. |

## Node-host opt-in (definition for entitlement)

A Viewer is on the **node-host reward path** when:

1. They have **explicitly opted in** to be hosted as a node (`nodeHostingOptIn = true`), and  
2. Their node is **on** (`nodeOn = true`) — reachable per heartbeat / beacon policy when that layer is live.

Optional stronger class (Path B validator / permanent validator) still counts as node-host; the minimum bar for the **reward** is opt-in + node on. If the node goes offline beyond grace, node-path entitlement may suspend until the node is on again. Subscription-path entitlement is independent of node uptime.

## Non-entitled Viewers

May use **local-only** features. **Network-carried** human communication may be limited until they subscribe **or** opt in to host a node and keep it on.

## Safety

- Free + unlimited is not a license for abuse or illegal content.  
- Entitlement does not override Destroy = Restart or local key sovereignty.  
- Resilience strategy: many Viewers opting to host nodes keeps communication active without a single company chat server.

## Implementation notes

- Entitlement is **local-first** with optional network attestation when chain/beacon is live.  
- Scaffold uses local flags for subscription expiry and node-host opt-in / node-on until billing + live node registry ship.  
- No silent downgrade of the node-host **reward** without a locked-doc revision.
