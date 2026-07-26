/**
 * @trv/shared — Scaffold + treasury royalties module
 *
 * Identity types remain placeholders. Treasury logic implements locked
 * 10% private creator / 90% public Community Pool split (docs/locked/15).
 * See docs/locked/ for sovereignty requirements.
 */

/** Placeholder for a future DID string (e.g. did:key:...). */
export type Did = string;

/** Placeholder for a future Verifiable Credential representation. */
export interface VerifiableCredentialPlaceholder {
  id?: string;
  type: string[];
  issuer?: string;
  issuanceDate?: string;
  /** Never store raw personal data here in production designs. */
  credentialSubject?: Record<string, unknown>;
}

/** Future presentation request shape (OpenID4VP-aligned later). */
export interface PresentationRequestPlaceholder {
  verifierOrigin?: string;
  requestedClaims: string[];
  purpose?: string;
}

/** Explicit non-goals for this package at scaffold stage (identity). */
export const SCAFFOLD_NON_GOALS = [
  "No real DID generation",
  "No credential issuance or presentation",
  "No selective disclosure",
  "No key management",
  "No burn / Destroy = Restart logic",
  "No Vault access",
] as const;

export const LOCKED_DOCS = {
  identityLayer: "docs/locked/01-Identity-Layer.md",
  vault: "docs/locked/02-Vault-Principles.md",
  destroyRestart: "docs/locked/03-Destroy-Equals-Restart.md",
  technicalStack: "docs/locked/06-Identity-Technical-Stack.md",
  roadmap: "docs/locked/07-Implementation-Roadmap.md",
  phase2Privacy: "docs/locked/08-Phase2-Privacy-Technical-Design.md",
  communityPool: "docs/locked/14-Community-Pool.md",
  shopTreasury: "docs/locked/15-TRV-Shop-Token-Converter-Treasury.md",
} as const;

export * from "./treasury";
