/**
 * Sentinel Standard — full outbound path (open source only)
 *
 * plaintext → age → (optional RDH) → LT Robust Soliton → TRVL1 lines
 *
 * Zero Meta/Google/Microsoft. age-encryption is the only required npm dep for crypto.
 * Fountain + framing are first-party zero-dep.
 */

import {
  encryptForRecipient,
  type PublicKey,
  type EncryptedBlob,
  secureZero,
} from "../crypto/age-interface.js";
import {
  embedHistogramShifting,
  estimateCapacity,
  HEADER_BITS,
  type RDHResult,
} from "../rdh/histogram-shifting.js";
import { LTEncoder } from "../fountain/lt-core.js";
import {
  encodeLTFrame,
  frameToBase64Url,
  type LTFrameMeta,
} from "../fountain/lt-frame.js";

export interface FullPathOptions {
  /** age recipient (age1…) */
  recipient: PublicKey;
  /** If set, embed ciphertext into cover via RDH before LT */
  cover?: Uint8Array;
  blockSize?: number;
  /** Number of LT symbols to emit (default k*5) */
  symbolCount?: number;
}

export interface FullPathResult {
  encrypted: EncryptedBlob;
  rdh?: RDHResult;
  /** Bytes fed into LT (ciphertext or stego container) */
  ltPayload: Uint8Array;
  /** TRVL1. lines ready for QR / paste / file */
  trvlLines: string[];
  k: number;
  blockSize: number;
  mode: "soliton";
}

/**
 * Encrypt then fountain-encode. Optional RDH when cover provided.
 */
export async function encryptToTrvlLines(
  plaintext: Uint8Array,
  opts: FullPathOptions
): Promise<FullPathResult> {
  const blockSize = Math.max(8, Math.min(64, opts.blockSize ?? 32));
  const encrypted = await encryptForRecipient(plaintext, opts.recipient);
  secureZero(plaintext);

  let ltPayload: Uint8Array = encrypted.ciphertext;
  let rdh: RDHResult | undefined;

  if (opts.cover) {
    const capacityBits = estimateCapacity(opts.cover);
    const need = HEADER_BITS + encrypted.ciphertext.length * 8;
    if (capacityBits < need) {
      throw new Error(
        `Cover capacity ${capacityBits} bits < required ${need} bits`
      );
    }
    rdh = await embedHistogramShifting(opts.cover, encrypted.ciphertext);
    ltPayload = rdh.stego;
  }

  const enc = new LTEncoder(ltPayload, blockSize);
  const k = enc.k;
  const n = opts.symbolCount ?? Math.max(k * 5, 16);
  const meta: LTFrameMeta = { k, blockSize };
  const trvlLines: string[] = [];

  for (let i = 0; i < n; i++) {
    const sym = enc.next();
    const frame = encodeLTFrame(sym, meta);
    trvlLines.push(`TRVL1.${frameToBase64Url(frame)}`);
  }

  return {
    encrypted,
    rdh,
    ltPayload,
    trvlLines,
    k,
    blockSize,
    mode: "soliton",
  };
}

export async function encryptTextToTrvlLines(
  text: string,
  opts: FullPathOptions
): Promise<FullPathResult> {
  return encryptToTrvlLines(new TextEncoder().encode(text), opts);
}
