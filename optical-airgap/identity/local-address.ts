/**
 * Local project-native address generation for TRV.
 * Format: <localpart>@sentinel.viewer
 * Bound to existing Vault / DID key material.
 * Exists only inside the encrypted Vault. Destroyed with Destroy = Restart.
 */

export interface LocalViewerAddress {
  localpart: string;
  domain: "sentinel.viewer";
  full: string;
  boundTo: string; // DID or Vault key fingerprint
  createdAt: number;
}

/**
 * Generate a local address. localpart should be derived from or bound to
 * existing identity material so it is deterministic per Viewer when desired,
 * or random when Destroy = Restart is invoked.
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

/**
 * Validate a local address string.
 */
export function isValidLocalAddress(addr: string): boolean {
  const re = /^[a-z0-9._-]{1,64}@sentinel\.viewer$/;
  return re.test(addr);
}
