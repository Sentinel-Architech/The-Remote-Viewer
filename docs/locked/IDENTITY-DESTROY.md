# Viewer destroy / wipe

## Rule (locked)

Destruction is **hard by design**:

1. Viewer opens **deep settings** (not a casual menu)  
2. Types **their Viewer name** exactly  
3. Confirms via **phone call or SMS** to the number bound for recovery — **not** email as the primary factor  
4. Only then wipe local keys + request chain-side deactivation where applicable  

## Why phone not email

Operational preference of the network founder path. SMS/call is still **SIM-swap exposed** — see [THREAT-MODEL](THREAT-MODEL.md). Long-term root remains device keystore + chain authority, not the phone number.

## UX

- No single “Delete account” on the home screen  
- Multi-step with plain-language consequences (comms, sales, node)  
- Export reminder before wipe when keys are exportable  
