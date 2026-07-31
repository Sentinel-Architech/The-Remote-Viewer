/**
 * TRV Optical Air-Gap — encrypt-then-RDH pipeline
 *
 * age encrypt → histogram-shifting reversible data hiding
 * Pure TypeScript. Runs on Acer / Node / Termux.
 * No camera, no phone required.
 *
 * License: MIT (or project root license)
 */

import {
  encryptForRecipient,
  type PublicKey,
  type EncryptedBlob,
  secureZero,
} from "../crypto/age-interface.js";
import {
  embedHistogramShifting,
  type RDHResult,
} from "../rdh/histogram-shifting.js";

export interface PipelineResult {
  /** age ciphertext (also embedded inside stego) */
  encrypted: EncryptedBlob;
  /** Cover image after reversible embedding */
  rdh: RDHResult;
  /** Bits actually embedded (may be less than full ciphertext if cover is small) */
  embeddedBits: number;
}

/**
 * Encrypt plaintext with age, then embed the ciphertext into a cover via RDH.
 * Cover must be large enough for the ciphertext bit length (rough capacity = peak count).
 *
 * @param plaintext  Raw payload (will be zeroed after encrypt)
 * @param recipient  age recipient (age1...)
 * @param cover      8-bit cover samples (grayscale image bytes recommended)
 */
export async function encryptThenRdh(
  plaintext: Uint8Array,
  recipient: PublicKey,
  cover: Uint8Array
): Promise<PipelineResult> {
  const encrypted = await encryptForRecipient(plaintext, recipient);
  secureZero(plaintext);

  const rdh = embedHistogramShifting(cover, encrypted.ciphertext);

  return {
    encrypted,
    rdh,
    embeddedBits: rdh.embeddedBits,
  };
}

/**
 * Convenience: encrypt a UTF-8 string then RDH-embed.
 */
export async function encryptTextThenRdh(
  text: string,
  recipient: PublicKey,
  cover: Uint8Array
): Promise<PipelineResult> {
  const bytes = new TextEncoder().encode(text);
  return encryptThenRdh(bytes, recipient, cover);
}
