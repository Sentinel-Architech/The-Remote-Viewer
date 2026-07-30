pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/merkleTree.circom";
include "circomlib/circuits/bitify.circom";

/*
 * NodeMembership – Zero-knowledge membership proof for The-Remote-Viewer
 *
 * Public signals:
 *   - merkleRoot
 *   - nullifier          (Poseidon(secret, externalNullifier))
 *   - commitment         (Poseidon(secret))
 *
 * Private signals:
 *   - secret
 *   - pathElements[levels]
 *   - pathIndices[levels]
 *   - externalNullifier
 *
 * Design goals:
 *   - Local-first / zero-trust
 *   - Replay protection via nullifier
 *   - No extra trusted setup beyond the circuit
 */

template NodeMembership(levels) {
    assert(levels > 0 && levels <= 32);

    // Private
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input externalNullifier;

    // Public
    signal input merkleRoot;
    signal output nullifier;
    signal output commitment;

    // 1. Commitment = Poseidon(secret)
    component commitmentHasher = Poseidon(1);
    commitmentHasher.inputs[0] <== secret;
    commitment <== commitmentHasher.out;

    // 2. Nullifier = Poseidon(secret, externalNullifier)
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== secret;
    nullifierHasher.inputs[1] <== externalNullifier;
    nullifier <== nullifierHasher.out;

    // 3. Force pathIndices to be binary
    component idxCheck[levels];
    for (var i = 0; i < levels; i++) {
        idxCheck[i] = Num2Bits(1);
        idxCheck[i].in <== pathIndices[i];
    }

    // 4. Merkle inclusion proof
    component tree = MerkleTreeChecker(levels);
    tree.leaf <== commitment;
    tree.root <== merkleRoot;

    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i]  <== pathIndices[i];
    }
}

component main {
    public [merkleRoot]
} = NodeMembership(20);
