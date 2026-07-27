# Sentinel Protocol - BFV Homomorphic Encryption

**American Made by a PROUD AMERICAN ARCHITECT**  
Java Implementation (BFV Scheme)

## Overview

Brakerski-Fan-Vercauteren Homomorphic Encryption for encrypted integer operations.

```java
package com.sentinel.protocol.crypto.fhe;

public class AmericanBFVEngine {
    private final int polyDegree;
    private final long plaintextModulus;
    private final int securityLevel;
    private final SecureRandom random;

    public AmericanBFVEngine(int polyDegree, long plaintextModulus, int securityLevel) {
        this.polyDegree = polyDegree;
        this.plaintextModulus = plaintextModulus;
        this.securityLevel = securityLevel;
        this.random = new SecureRandom();
    }

    public BFVKeyTriple generateKeys() { /* ... */ }
    public BFVCiphertext encrypt(BFVPublicKey publicKey, List<Long> plaintext) { /* ... */ }
    public List<Long> decrypt(BFVSecretKey secretKey, BFVCiphertext ciphertext) { /* ... */ }
    public BFVCiphertext add(BFVCiphertext c1, BFVCiphertext c2) { /* ... */ }
    public BFVCiphertext multiply(BFVCiphertext c1, BFVCiphertext c2, BFVEvaluationKey evalKey) { /* ... */ }
}
```

*(Full original Java implementation preserved from root `Homomorphic Encryption` file.)*
