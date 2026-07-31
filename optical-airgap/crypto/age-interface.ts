/**
 * TRV Optical Air-Gap — Encryption Interface
 *
 * Open-source, dependency-light wrapper around age (preferred) or libsodium.
 * No Meta / Google / Microsoft code. Runs under GrapheneOS browser, Termux, or Node.
 *
 * License: MIT (or project root license)
 *
 * Rules:
 * - Encrypt on-device before any RDH or fountain step.
 * - Only ciphertext leaves the Vault.
 * - Destroy = Restart must wipe keys and plaintext buffers.
 */

export type PublicKey = string; // age or libsodium public key (base64 or age format)
export type PrivateKey = string; // never leave Vault

export interface EncryptedBlob {
  ciphertext: Uint8Array;
  recipient: PublicKey;
  algorithm: "age" | "libsodium-secretbox" | "libsodium-sealedbox";
  createdAt: number;
}

/**
 * Encrypt plaintext for a recipient.
 * In production this must call real age or libsodium.
 * Scaffold returns a clearly marked placeholder so no false security claims are made.
 */
export async function encryptForRecipient(
  plaintext: Uint8Array,
  recipientPublicKey: PublicKey,
  algorithm: EncryptedBlob["algorithm"] = "age"
): Promise<EncryptedBlob> {
  // SCAFFOLD: replace with real age.encrypt or libsodium.crypto_box_seal
  // Real implementation must zero the plaintext buffer after use.
  const placeholder = new TextEncoder().encode(
    `[TRV-ENCRYPTED-SCAFFOLD:${algorithm}]` + Array.from(plaintext).join(",")
  );

  return {
    ciphertext: placeholder,
    recipient: recipientPublicKey,
    algorithm,
    createdAt: Date.now(),
  };
}

/**
 * Decrypt a blob. Scaffold only — real crypto required for production.
 */
export async function decryptBlob(
  blob: EncryptedBlob,
  _privateKey: PrivateKey
): Promise<Uint8Array> {
  // SCAFFOLD: real age.decrypt / libsodium open goes here
  const text = new TextDecoder().decode(blob.ciphertext);
  if (!text.startsWith("[TRV-ENCRYPTED-SCAFFOLD")) {
    throw new Error("Not a scaffold blob — implement real decryption");
  }
  // Return empty for safety in scaffold mode
  return new Uint8Array(0);
}

/** Secure zero of a buffer (best-effort in JS). */
export function secureZero(buf: Uint8Array): void {
  buf.fill(0);
}
