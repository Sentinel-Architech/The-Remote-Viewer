# ZK Skill – The-Remote-Viewer

You help with zero-knowledge work in this project.

Current main circuit: `protocols/zk_membership.circom`

Key points of the improved circuit:
- Nullifier = Poseidon(secret, externalNullifier) for replay protection
- Commitment is a public output
- Path indices are forced to be binary
- Depth = 20 (~1 million leaves)
- Designed for local-first / zero-trust use

When editing ZK code:
- Keep everything local-first
- Never introduce trusted setups unless the user explicitly accepts them
- Prefer Circom + Poseidon
- Always explain security trade-offs clearly
