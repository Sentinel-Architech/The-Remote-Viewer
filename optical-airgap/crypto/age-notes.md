# Encryption Layer

Primary: **age** (https://github.com/FiloSottile/age)
Secondary: libsodium where age is unavailable.

Rules:
- Encrypt on-device before any stego or fountain step.
- Only ciphertext ever leaves the Vault.
- Recipient public key or Viewer-controlled ephemeral key.
- Age is preferred for its simplicity, auditability, and lack of corporate ownership.

Integration point: after local address resolution, before RDH embedding.
