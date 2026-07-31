/**
 * TRV Optical Air-Gap — encrypt-then-RDH pipeline
 *
 * age encrypt → histogram-shifting RDH (with capacity check + authenticated header)
 * Pure TypeScript. Runs on Acer / Node / Termux. No camera, no phone required.
 *
 * Security: plaintext is encrypted before any stego. Cover never sees cleartext.
 * Fails closed if the cover cannot hold header + ciphertext.
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
  extractHistogramShifting,
  estimateCapacity,
  HEADER_BITS,
  type RDHResult,
  type RDHExtractResult,
} from "../rdh/histogram-shifting.js";

export interface PipelineResult {
  encrypted: EncryptedBlob;
  rdh: RDHResult;
  embeddedBits: number;
  capacityBits: number;
}

/**
 * Encrypt plaintext with age, then embed ciphertext into cover via RDH.
 * Throws if cover capacity is insufficient for header + ciphertext.
 */
export async function encryptThenRdh(
  plaintext: Uint8Array,
  recipient: PublicKey,
  cover: Uint8Array
): Promise<PipelineResult> {
  const capacityBits = estimateCapacity(cover);
  const encrypted = await encryptForRecipient(plaintext, recipient);
  secureZero(plaintext);

  const need = HEADER_BITS + encrypted.ciphertext.length * 8;
  if (capacityBits < need) {
    throw new Error(
      `Cover capacity ${capacityBits} bits < required ${need} bits. Use a larger cover.`
    );
  }

  const rdh = await embedHistogramShifting(cover, encrypted.ciphertext);

  return {
    encrypted,
    rdh,
    embeddedBits: rdh.embeddedBits,
    capacityBits,
  };
}

export async function encryptTextThenRdh(
  text: string,
  recipient: PublicKey,
  cover: Uint8Array
): Promise<PipelineResult> {
  const bytes = new TextEncoder().encode(text);
  return encryptThenRdh(bytes, recipient, cover);
}

/** Extract and verify. Returns checksumOk so caller can reject tampered stego. */
export async function extractRdh(
  stego: Uint8Array
): Promise<RDHExtractResult> {
  return extractHistogramShifting(stego);
}

export { estimateCapacity, HEADER_BITS };
