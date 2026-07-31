# RDH Security Notes (TRV)

## Encrypt-first (non-negotiable)
Histogram shifting is a *carrier*, not a confidentiality control.
Plaintext must be age-encrypted before `embedHistogramShifting`.
This module must never receive cleartext PHI or secrets.

## What the header provides
- peak, zero (for perfect reverse shift)
- secret length
- first 8 bytes of SHA-256 of the ciphertext

On extract, `checksumOk === false` means the recovered secret does not match
the embedded digest → treat as corrupted or tampered; do not decrypt.

## Capacity
`estimateCapacity(cover)` returns peak-bin count (bits).
Required bits = `HEADER_BITS` (112) + `ciphertext.length * 8`.
Pipeline fails closed if the cover is too small.

## HIPAA architecture note
This code supports a compliant *design* (strong encryption, integrity check,
local keys, air-gap path). Organizational HIPAA compliance still requires
risk analysis, policies, BAAs where applicable, and operational controls.
Code alone is not a compliance certification.

## Open source
Pure TypeScript, no Meta / Google / Microsoft dependencies in this path.
