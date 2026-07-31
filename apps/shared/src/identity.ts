/**
 * Shared Identity types — SCAFFOLD + local optical address binding
 * Aligned with docs/locked/ Identity Layer & Phase 1 roadmap.
 * Extended 2026-07-31 with @sentinel.viewer local addresses for optical air-gap path.
 *
 * No real cryptography yet beyond address generation. No personal data storage.
 * Destroy = Restart remains absolute.
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

/** Local project-native address for optical / hybrid comms */
export interface LocalViewerAddress {
  localpart: string;
  domain: "sentinel.viewer";
  full: string;
  boundTo: string; // DID id or Vault key fingerprint
  createdAt: number;
}

export interface IdentityState {
  /** Current local DID (null until user creates one) */
  did: LocalDid | null;
  /** Placeholder credentials — never real personal data */
  credentials: VerifiableCredentialPlaceholder[];
  /** Optional local @sentinel.viewer address bound to the DID */
  localAddress: LocalViewerAddress | null;
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
  localAddressNeverPublicDns: true,
} as const;

/**
 * Generate a local project-native address.
 * Bound to existing identity material. Never registered on public DNS.
 */
export function generateLocalAddress(
  localpart: string,
  boundTo: string
): LocalViewerAddress {
  const clean = localpart
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 64);

  if (!clean) {
    throw new Error("localpart must contain at least one valid character");
  }

  return {
    localpart: clean,
    domain: "sentinel.viewer",
    full: `${clean}@sentinel.viewer`,
    boundTo,
    createdAt: Date.now(),
  };
}

export function isValidLocalAddress(addr: string): boolean {
  return /^[a-z0-9._-]{1,64}@sentinel\.viewer$/.test(addr);
}

/**
 * Creates a completely empty scaffold identity state.
 * Real DID generation comes in Phase 1.
 */
export function createEmptyIdentityState(): IdentityState {
  return {
    did: null,
    credentials: [],
    localAddress: null,
    isScaffold: true,
  };
}
