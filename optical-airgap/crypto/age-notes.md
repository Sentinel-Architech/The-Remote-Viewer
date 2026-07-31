# age Encryption for TRV Optical Air-Gap

## Preferred implementation
**FiloSottile / typage** — official TypeScript age implementation

- npm: `age-encryption`
- JSR: `@age/age-encryption`
- Repo: https://github.com/FiloSottile/typage
- Depends only on noble cryptography + Web Crypto API
- Runs in modern browsers, Node 20+, Deno, Bun
- Zero Meta / Google / Microsoft code

```bash
npm install age-encryption
# or
deno add jsr:@age/age-encryption
```

## Usage (from age-interface.ts)
```ts
import {
  generateAgeKeyPair,
  encryptForRecipient,
  decryptBlob,
  secureZero,
} from "./age-interface";

const { identity, recipient } = await generateAgeKeyPair();
// Store identity ONLY inside the Vault. Never export it.

const plaintext = new TextEncoder().encode("TRV secret payload");
const blob = await encryptForRecipient(plaintext, recipient);
// blob.ciphertext goes into RDH → LT → QR

const recovered = await decryptBlob(blob, identity);
secureZero(plaintext);
```

## Termux / native CLI fallback (Acer or GrapheneOS Termux)
If you prefer the Go binary (fully offline, no npm):

```bash
# Termux
pkg install age

# Generate
age-keygen -o identity.txt
# Public key is printed; keep identity.txt in Vault only

# Encrypt
echo "payload" | age -r age1... > payload.age

# Decrypt
age -d -i identity.txt payload.age
```

Interoperable with the TypeScript path (same age format).

## Pipeline position
```
Plaintext
  → age encrypt          ← you are here
  → RDH embed
  → LT fountain
  → QR optical stream
```

Only ciphertext ever leaves the device. Outside email / any tunnel receives already-encrypted material.

## Destroy = Restart
Wipe:
- age identity files
- any plaintext buffers (call secureZero)
- temporary ciphertext files
- derived local addresses bound to that identity
