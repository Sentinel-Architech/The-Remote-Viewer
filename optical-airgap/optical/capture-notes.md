# Optical Capture Side

## Required for reliability on Pixel 7 GrapheneOS + Acer
- Fixed / manual exposure and focus where the platform allows.
- Real-time frame quality gate (reject blur, low contrast, excessive motion) before LT ingestion.
- Basic motion rejection / multi-frame temporal support.
- Support for single QR and multi-QR grids.

## Out of scope on Pixel 7
- WiFi CSI / through-wall sensing (chipset + GrapheneOS isolation prevent practical open CSI access).

## Feedback into recursive loop
- Decode success rate
- Symbols collected per second
- Blur / noise estimates
- Thermal / battery impact

These metrics drive policy updates inside the Vault.
