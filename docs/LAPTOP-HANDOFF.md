# Laptop handoff

No private key belongs in this file, in chat, or in git. The DePIN is not active at X scale. Canon is HOST PARTIAL. Governance is scaffold.

Add these once, on the laptop, after the machine is in hand. Do not send them to a chat.

| Pillar | Where it lives | Used for |
| --- | --- | --- |
| age identity | operator disk, never photographed | optical air-gap vault |
| commit signing key | hardware-bound, non-exportable | release tags |
| firmware pin | operator host defaults | device admission |
| canon publish credential | host secret store | Re-Publish of `/hub*` |
| Solana keypair | `~/.config/solana/id.json` only if Track A is promoted | scaffold deploy, not current hub |

The hub already keeps a non-extractable Ed25519 key in IndexedDB. That is not the age identity and it is not a seed to copy.

X activity is a separate surface. DePIN activity starts only after the age identity exists on the laptop and a node under operator control passes the local seal. Until then the proven path remains optical air-gap on GrapheneOS, and the host remains partial.
