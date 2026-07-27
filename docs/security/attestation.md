# Hardware key attestation (orientation)

**Status:** Future layer — after identity create + auth-bound keys work  
**Updated:** 2026-07-27

---

## What it is

Android **key attestation** produces a certificate chain asserting that a key was generated in secure hardware with stated properties (e.g. auth-bound, StrongBox, app identity, verified-boot related fields depending on device/OS).

## Why TRV might use it later

- Peers can require “presence signature from hardware-backed key” without trusting the APK alone  
- Prefer **standard hardware attestation** over Play Integrity–only checks for GrapheneOS-friendly design  

## Why not now

- No production peer protocol yet  
- Attestation verification is a **server/peer** problem with root management and RKP root rotation  
- Does not replace destroy = restart or knowledge factors  

## Posture

Document capability; implement only when a concrete verifier exists. Never treat attestation as recovery of burned keys.
