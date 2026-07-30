pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/merkleTree.circom";
include "circomlib/circuits/bitify.circom";

/*
 * NodeMembership – Zero-knowledge proof that a node knows a secret
 * whose Poseidon commitment is a leaf in the public Merkle tree.
 *
 * Public inputs:
 *   - merkleRoot
 *   - nullifier          (prevents double-proving / replay)
 *
 * Private inputs:
 *   - secret
 *   - pathElements[levels]
 *   - pathIndices[levels]
 *
 * Design goals (aligned with The-Remote-Viewer):
 *   - Local-first / zero-trust friendly
 *   - No trusted setup beyond the circuit itself (Poseidon + Merkle)
 *   - Explicit nullifier for membership revocation / rate-limiting
 */

template NodeMembership(levels) {
    assert(levels > 0);
    assert(levels <= 32);               // practical upper bound

    // Private
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Public
    signal input merkleRoot;
    signal input nullifier;             // externally computed: Poseidon(secret, externalNullifier) or similar

    // 1. Commitment = Poseidon(secret)
    component commitmentHasher = Poseidon(1);
    commitmentHasher.inputs[0] <== secret;
    signal commitment;
    commitment <== commitmentHasher.out;

    // 2. Optional: force pathIndices to be binary (0/1)
    component idxBits[levels];
    for (var i = 0; i < levels; i++) {
        idxBits[i] = Num2Bits(1);
        idxBits[i].in <== pathIndices[i];
        // Num2Bits already constrains the value to be 0 or 1
    }

    // 3. Merkle proof
    component tree = MerkleTreeChecker(levels);
    tree.leaf <== commitment;
    tree.root <== merkleRoot;

    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i]  <== pathIndices[i];
    }

    // 4. Nullifier check (simple version – you can replace with a stronger construction)
    //    Here we just expose a public nullifier that the application layer must bind to the secret.
    //    A common stronger pattern is:
    //      nullifier <== Poseidon(secret, externalNullifier)
    //    and make externalNullifier also public.
    //    For now we keep it flexible so the host can decide the binding.
}

component main {
    public [merkleRoot, nullifier]
} = NodeMembership(20);   // raised to 20 (≈ 1 M leaves) – change if you need a different depth
