# Local Identity Module

Thin, honest helpers around **age** for local-first identity.

This replaces the rejected centralized "21+ digit key assignment" concept.
Keys are generated and stored only on the device. Destroy = Restart.

## Prerequisites

- `age` / `age-keygen` available (or use the Rust `trv-optical` binary from optical-airgap)

## Usage

```bash
# Generate a new local identity (never commit the secret)
./modules/local-identity/keygen.sh

# Show public identity only
./modules/local-identity/show-identity.sh
```

Secrets stay under `$HOME/.local/share/remote-viewer/identity/` and are gitignored.

## Founding Member / Path B Integration

After receiving a `founding-member-*.json` from the originator:

```bash
bash modules/path-b-recognition/install-founding.sh /path/to/founding-member-*.json
bash modules/path-b-recognition/status.sh
```

This places the attestation under `$HOME/.local/share/remote-viewer/identity/founding/` and unlocks the Integrity Verifier option for the current identity path.

Destroy = Restart removes both the identity and any Founding Member status.
