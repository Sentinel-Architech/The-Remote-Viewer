# Pipeline helpers (phone-optional)

## encrypt-then-rdh.ts

```
plaintext → age encrypt → histogram-shifting RDH → stego cover
```

Runs entirely on Acer / Node / Termux. No camera, no phone.

### Minimal flow (once age-encryption is installed)

```ts
import { generateAgeKeyPair } from "../crypto/age-interface.js";
import { encryptTextThenRdh } from "./encrypt-then-rdh.js";

const { identity, recipient } = await generateAgeKeyPair();
// keep identity in Vault only

// cover = raw grayscale bytes of an image (or any 8-bit buffer)
const cover = new Uint8Array(/* ... */);

const result = await encryptTextThenRdh(
  "TRV test payload",
  recipient,
  cover
);

// result.rdh.stego  → next step is LT fountain + QR (still desktop-side)
// result.encrypted  → ciphertext metadata
```

### Capacity note
Histogram shifting capacity is limited by the height of the peak bin.
For short keys / identity claims this is usually enough.
For larger payloads use a bigger cover or switch to a higher-capacity RDH later.

### Destroy = Restart
Zero the plaintext (done inside the helper), wipe identity, and discard stego/ciphertext buffers when the Viewer is destroyed.
