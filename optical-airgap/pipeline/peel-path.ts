/**
 * Sentinel Standard — inbound path (open source only)
 *
 * TRVL1 lines → peel LT → (optional RDH extract) → age decrypt
 */

import {
  decryptBlob,
  type PrivateKey,
} from "../crypto/age-interface.js";
import { extractHistogramShifting } from "../rdh/histogram-shifting.js";
import { LTDecoder } from "../fountain/lt-core.js";
import {
  decodeLTFrame,
  frameFromBase64Url,
} from "../fountain/lt-frame.js";

export interface PeelOptions {
  /** Vault identity AGE-SECRET-KEY-… */
  identity: PrivateKey;
  /** If true, treat recovered payload as RDH stego and extract ciphertext */
  expectRdh?: boolean;
}

export interface PeelResult {
  plaintext: Uint8Array;
  recoveredBlocks: number;
  ingestedSymbols: number;
  errors: number;
  usedRdh: boolean;
  k: number;
  blockSize: number;
}

function normalizeLine(line: string): string | null {
  let s = line.trim();
  if (!s) return null;
  if (s.startsWith("TRVL1.")) s = s.slice(6);
  return s;
}

/**
 * Ingest TRVL1 lines (or bare base64url frames), peel, decrypt.
 * LTDecoder.getPayload() already returns exact original length (u32 prefix).
 */
export async function peelTrvlToPlaintext(
  lines: string[] | string,
  opts: PeelOptions
): Promise<PeelResult> {
  const arr = typeof lines === "string" ? lines.split(/\r?\n/) : lines;
  let decoder: LTDecoder | null = null;
  let k = 0;
  let blockSize = 0;
  let ingested = 0;
  let errors = 0;

  for (const raw of arr) {
    const s = normalizeLine(raw);
    if (!s) continue;
    try {
      const frame = frameFromBase64Url(s);
      const { meta, symbol } = decodeLTFrame(frame);
      if (!decoder) {
        k = meta.k;
        blockSize = meta.blockSize;
        decoder = new LTDecoder(k, blockSize);
      } else if (meta.k !== k || meta.blockSize !== blockSize) {
        errors++;
        continue;
      }
      decoder.addSymbol(symbol);
      ingested++;
      if (decoder.isComplete) break;
    } catch {
      errors++;
    }
  }

  if (!decoder || !decoder.isComplete) {
    const n = decoder?.recoveredCount ?? 0;
    throw new Error(
      `incomplete peel recovered=${n}/${k} ingested=${ingested} errors=${errors}`
    );
  }

  // Exact length already stripped inside LTDecoder.getPayload()
  let payload = decoder.getPayload()!;

  let ciphertext = payload;
  let usedRdh = false;
  if (opts.expectRdh) {
    const extracted = await extractHistogramShifting(payload);
    if (!extracted.checksumOk) {
      throw new Error("RDH checksum failed — reject stego");
    }
    ciphertext = extracted.payload;
    usedRdh = true;
  }

  const plaintext = await decryptBlob(ciphertext, opts.identity);
  return {
    plaintext,
    recoveredBlocks: decoder.recoveredCount,
    ingestedSymbols: ingested,
    errors,
    usedRdh,
    k,
    blockSize,
  };
}
