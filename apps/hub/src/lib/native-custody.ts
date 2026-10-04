/**
 * Zero-custody rules for the native Hub stack.
 *
 * There is no master key. There is no Architect override.
 * There is no remote recovery. Destroy on this device is final.
 */

const FORBIDDEN = [
  "privateKey",
  "private_key",
  "seed",
  "mnemonic",
  "secret",
  "sk",
] as const;

export function publicIdentityOnly<T extends Record<string, unknown>>(record: T): T {
  const out = { ...record };
  for (const key of Object.keys(out)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN.some((f) => lower.includes(f))) {
      delete out[key];
    }
  }
  return out;
}

export function assertNonExtractablePrivate(pair: CryptoKeyPair): void {
  if (pair.privateKey.extractable) {
    throw new Error("Refusing extractable private key — zero-custody violation");
  }
}
