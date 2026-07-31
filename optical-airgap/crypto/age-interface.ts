/**
 * TRV Optical Air-Gap — age Encryption Interface
 *
 * Preferred backend: FiloSottile's official TypeScript implementation
 *   npm: age-encryption  |  jsr: @age/age-encryption  |  github: FiloSottile/typage
 * Depends only on noble cryptography libraries + Web Crypto API.
 * No Meta / Google / Microsoft code.
 *
 * License: MIT (or project root license)
 *
 * Rules:
 * - Encrypt on-device before any RDH or fountain step.
 * - Only ciphertext leaves the Vault.
 * - Destroy = Restart must wipe keys and plaintext buffers.
 * - Private keys never leave the Vault.
 */

export type PublicKey = string;   // age recipient (age1...)
export type PrivateKey = string;  // age identity (AGE-SECRET-KEY-...)

export interface EncryptedBlob {
  ciphertext: Uint8Array;
  recipient: PublicKey;
  algorithm: "age";
  armored?: string;       // ASCII-armored form when useful for optical/text paths
  createdAt: number;
}

export interface AgeKeyPair {
  identity: PrivateKey;
  recipient: PublicKey;
}

/** Dynamic import so the module still loads when age-encryption is not installed. */
async function loadAge(): Promise<typeof import("age-encryption")> {
  try {
    return await import("age-encryption");
  } catch {
    throw new Error(
      "age-encryption package not found. Install with: npm i age-encryption\n" +
        "Or use the Termux age CLI path documented in age-notes.md"
    );
  }
}

/**
 * Generate a new age identity + recipient pair.
 * Identity (private) must stay inside the Vault.
 */
export async function generateAgeKeyPair(): Promise<AgeKeyPair> {
  const age = await loadAge();
  const identity = await age.generateIdentity();
  const recipient = await age.identityToRecipient(identity);
  return { identity, recipient };
}

/**
 * Encrypt plaintext to one or more age recipients.
 * Prefer binary ciphertext for LT/QR; use armor only when needed for text channels.
 */
export async function encryptForRecipient(
  plaintext: Uint8Array | string,
  recipientPublicKey: PublicKey | PublicKey[],
  opts: { armor?: boolean } = {}
): Promise<EncryptedBlob> {
  const age = await loadAge();
  const e = new age.Encrypter();

  const recipients = Array.isArray(recipientPublicKey)
    ? recipientPublicKey
    : [recipientPublicKey];

  for (const r of recipients) {
    e.addRecipient(r);
  }

  const ciphertext = await e.encrypt(plaintext);
  const primary = recipients[0];

  let armored: string | undefined;
  if (opts.armor) {
    armored = age.armor.encode(ciphertext);
  }

  return {
    ciphertext: ciphertext instanceof Uint8Array ? ciphertext : new Uint8Array(ciphertext),
    recipient: primary,
    algorithm: "age",
    armored,
    createdAt: Date.now(),
  };
}

/**
 * Decrypt an age blob with a Vault-held identity.
 */
export async function decryptBlob(
  blob: EncryptedBlob | Uint8Array | string,
  identity: PrivateKey
): Promise<Uint8Array> {
  const age = await loadAge();
  const d = new age.Decrypter();
  d.addIdentity(identity);

  let data: Uint8Array;
  if (typeof blob === "string") {
    // assume armored
    data = age.armor.decode(blob);
  } else if (blob instanceof Uint8Array) {
    data = blob;
  } else {
    data = blob.armored ? age.armor.decode(blob.armored) : blob.ciphertext;
  }

  const out = await d.decrypt(data);
  return out instanceof Uint8Array ? out : new Uint8Array(out);
}

/** Best-effort secure zero of a buffer (JS cannot guarantee). */
export function secureZero(buf: Uint8Array): void {
  buf.fill(0);
}
