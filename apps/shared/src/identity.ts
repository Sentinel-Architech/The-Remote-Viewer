/**
 * Shared Identity types — SCAFFOLD ONLY
 * Aligned with docs/locked/ Identity Layer & Phase 1 roadmap.
 * No real cryptography, no personal data storage, no security claims.
 */

export type DidMethod = "key" | "jwk" | "web" | "placeholder";

export interface LocalDid {
  /** did:key or did:jwk style identifier (placeholder for now) */
  id: string;
  method: DidMethod;
  /** Public key material (hex or base64) — never store private keys in shared */
  publicKey: string;
  createdAt: string; // ISO timestamp
}

export interface VerifiableCredentialPlaceholder {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  /** Claims are intentionally empty in scaffold */
  credentialSubject: Record<string, unknown>;
}

export interface IdentityState {
  /** Current local DID (null until user creates one) */
  did: LocalDid | null;
  /** Placeholder credentials — never real personal data */
  credentials: VerifiableCredentialPlaceholder[];
  /** Explicit flag that this is still scaffold */
  isScaffold: true;
}

/**
 * Non-negotiable rules (from locked principles)
 */
export const IDENTITY_RULES = {
  noCentralPersonalData: true,
  destroyEqualsRestart: true,
  vaultSealedFromIdentity: true,
  userControlledKeysOnly: true,
} as const;

/**
 * Creates a completely empty scaffold identity state.
 * Real DID generation comes in Phase 1.
 */
export function createEmptyIdentityState(): IdentityState {
  return {
    did: null,
    credentials: [],
    isScaffold: true,
  };
}
