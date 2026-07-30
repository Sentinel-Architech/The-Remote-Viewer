# Zero-Knowledge Membership Circuit

**File:** `protocols/zk_membership.circom`  
**Status:** Improved (July 2026)  
**Depth:** 20 (~1 million leaves)

## Purpose

Proves that a node knows a secret whose Poseidon commitment is a leaf in a public Merkle tree, without revealing the secret or the Merkle path.

This supports local-first, zero-trust node authentication and membership in The-Remote-Viewer mesh.

## Public Signals

| Signal        | Description                                      |
|---------------|--------------------------------------------------|
| `merkleRoot`  | Current root of the membership Merkle tree       |
| `nullifier`   | Poseidon(secret, externalNullifier) – prevents replay |
| `commitment`  | Poseidon(secret) – useful for indexing / logging |

## Private Signals

| Signal              | Description                                      |
|---------------------|--------------------------------------------------|
| `secret`            | Node’s private secret                            |
| `pathElements[20]`  | Sibling hashes along the Merkle path              |
| `pathIndices[20]`   | 0/1 indicators (left/right)                      |
| `externalNullifier` | Application value (epoch, session ID, etc.)      |

## Key Improvements

- **Stronger nullifier**: `Poseidon(secret, externalNullifier)` for replay protection
- **Public commitment**: Makes verification and indexing easier
- **Binary path checks**: Path indices are constrained to 0 or 1
- **Realistic depth**: Raised from 10 → 20
- **Aligned with project principles**: Local-first, zero-trust, no unnecessary trusted setup

## Design Notes

- Uses Poseidon hash (efficient in circuits)
- Compatible with standard Circom + snarkjs + arkworks workflows
- Nullifier must be tracked by the application to prevent reuse
- `externalNullifier` should be chosen carefully (e.g. current epoch or challenge)

## Next Steps

1. Compile with Circom
2. Run Powers of Tau + Groth16 setup
3. Generate and verify proofs
4. Integrate Rust verifier (`src/zk/membership_verifier.rs` sketch available)

## Security Reminders

- Never reuse a nullifier
- Keep the secret local and never transmit it
- Document any change that affects the trusted setup or public signals
- Prefer local proving when possible

---

*Part of The-Remote-Viewer – Building sovereign, local-first, zero-trust systems.*
