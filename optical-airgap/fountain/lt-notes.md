# LT Fountain Codes for Optical Transfer

Luby Transform (LT) codes with Robust Soliton distribution.

## Why LT
- Rateless: generate as many symbols as needed.
- Receiver needs only ~K × 1.05–1.20 distinct symbols in any order.
- Dropped / blurred / out-of-order frames only cost time, never correctness.
- Perfect match for one-way screen → camera channel (no back-channel possible).

## Pipeline position
After encryption + RDH, before QR animation.

## Open implementations to adapt
- decimen-optical-transfer lineage
- txqr-style LT cores
- pure TypeScript / Go / Dart LT libraries

Keep the core pure and dependency-light so it runs under GrapheneOS browser or Termux.
