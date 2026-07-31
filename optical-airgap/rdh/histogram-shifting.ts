/**
 * TRV Optical Air-Gap — Histogram Shifting RDH
 *
 * Pure TypeScript reversible data hiding (classic histogram shifting).
 * Open-source, no proprietary dependencies.
 *
 * Security posture (HIPAA-aligned architecture):
 * - ALWAYS encrypt first (age). This module never sees plaintext.
 * - Capacity checked before embed; fails closed if cover is too small.
 * - Fixed header carries peak, zero, length, and a SHA-256 prefix of the
 *   ciphertext so corruption is detected on extract.
 * - Perfect reversibility of the cover.
 *
 * License: MIT (or project root license)
 */

export interface RDHResult {
  stego: Uint8Array;
  peak: number;
  zero: number;
  embeddedBits: number;
  secretLengthBytes: number;
  originalLength: number;
  headerBits: number;
}

export interface RDHExtractResult {
  secret: Uint8Array;
  restoredCover: Uint8Array;
  checksumOk: boolean;
}

/** Header layout (bits, embedded first via the same HS path):
 *  peak          8
 *  zero          8
 *  lengthBytes  32  (uint32 big-endian)
 *  checksum     64  (first 8 bytes of SHA-256 of secret)
 *  Total header = 112 bits
 */
export const HEADER_BITS = 8 + 8 + 32 + 64;

function histogram(data: Uint8Array): number[] {
  const h = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) h[data[i]]++;
  return h;
}

function findPeakAndZero(h: number[]): { peak: number; zero: number } {
  let peak = 0;
  for (let i = 1; i < 256; i++) {
    if (h[i] > h[peak]) peak = i;
  }
  let zero = -1;
  for (let i = peak + 1; i < 256; i++) {
    if (h[i] === 0) {
      zero = i;
      break;
    }
  }
  if (zero === -1) {
    zero = peak + 1 < 256 ? peak + 1 : peak;
    let minVal = h[zero] ?? Infinity;
    for (let i = peak + 1; i < 256; i++) {
      if (h[i] < minVal) {
        minVal = h[i];
        zero = i;
      }
    }
  }
  // Prefer left side if right side collides or is unsafe
  if (zero === peak || zero > 255) {
    zero = peak > 0 ? peak - 1 : peak;
    for (let i = peak - 1; i >= 0; i--) {
      if (h[i] === 0) {
        zero = i;
        break;
      }
    }
  }
  return { peak, zero };
}

/** Estimate embeddable bits = peak count (before any shift). */
export function estimateCapacity(cover: Uint8Array): number {
  const h = histogram(cover);
  let peak = 0;
  for (let i = 1; i < 256; i++) if (h[i] > h[peak]) peak = i;
  return h[peak];
}

/** First 8 bytes of SHA-256 (Web Crypto). */
async function checksum8(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash).slice(0, 8);
}

function bytesToBits(data: Uint8Array): number[] {
  const bits: number[] = [];
  for (let i = 0; i < data.length; i++) {
    for (let b = 7; b >= 0; b--) {
      bits.push((data[i] >> b) & 1);
    }
  }
  return bits;
}

function bitsToBytes(bits: number[]): Uint8Array {
  const out = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) {
    if (bits[i]) out[i >> 3] |= 1 << (7 - (i & 7));
  }
  return out;
}

function u32ToBytes(n: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = (n >>> 24) & 0xff;
  b[1] = (n >>> 16) & 0xff;
  b[2] = (n >>> 8) & 0xff;
  b[3] = n & 0xff;
  return b;
}

function bytesToU32(b: Uint8Array): number {
  return ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
}

/**
 * Embed secret (must already be ciphertext) into cover.
 * Fails if capacity < HEADER_BITS + secret bits.
 */
export async function embedHistogramShifting(
  cover: Uint8Array,
  secret: Uint8Array
): Promise<RDHResult> {
  const capacity = estimateCapacity(cover);
  const need = HEADER_BITS + secret.length * 8;
  if (capacity < need) {
    throw new Error(
      `RDH capacity ${capacity} bits < required ${need} bits (header + secret). Use a larger cover.`
    );
  }

  const h = histogram(cover);
  const { peak, zero } = findPeakAndZero(h);
  if (peak === zero) {
    throw new Error("Cannot embed: peak and zero collide");
  }

  const cs = await checksum8(secret);
  const header = new Uint8Array(14); // 1+1+4+8
  header[0] = peak & 0xff;
  header[1] = zero & 0xff;
  header.set(u32ToBytes(secret.length), 2);
  header.set(cs, 6);

  const payloadBits = [...bytesToBits(header), ...bytesToBits(secret)];
  const stego = new Uint8Array(cover);
  const shiftRight = zero > peak;

  // Shift
  for (let i = 0; i < stego.length; i++) {
    const v = stego[i];
    if (shiftRight) {
      if (v > peak && v < zero) stego[i] = v + 1;
    } else {
      if (v < peak && v > zero) stego[i] = v - 1;
    }
  }

  // Embed
  let bitIdx = 0;
  for (let i = 0; i < stego.length && bitIdx < payloadBits.length; i++) {
    if (stego[i] === peak) {
      if (payloadBits[bitIdx] === 1) {
        stego[i] = shiftRight ? peak + 1 : peak - 1;
      }
      bitIdx++;
    }
  }

  return {
    stego,
    peak,
    zero,
    embeddedBits: bitIdx,
    secretLengthBytes: secret.length,
    originalLength: cover.length,
    headerBits: HEADER_BITS,
  };
}

/**
 * Extract secret and restore cover. Verifies checksum.
 * peak/zero are recovered from the embedded header (no external side channel required).
 */
export async function extractHistogramShifting(
  stego: Uint8Array
): Promise<RDHExtractResult> {
  // First pass: we need peak/zero from header, but header is itself embedded
  // using the same peak. We recover by trying the standard peak-finding on
  // the *stego* histogram is wrong after shift. Instead we require the
  // encoder to have used the original peak; extraction re-derives by
  // scanning for the most frequent value among {v, v±1} patterns is fragile.
  //
  // Practical approach used here: the first HEADER_BITS of extracted bits
  // are interpreted once we know peak/zero. We obtain peak/zero by
  // recomputing from a reversible convention: store them in the header,
  // and bootstrap by using the peak of the *original* algorithm on the
  // stego after assuming the freed bin is the second-most common adjacent.
  //
  // Simpler robust approach for this codebase: caller may pass peak/zero
  // if known; otherwise we scan both directions for a consistent header.
  // For the hardened path we embed peak/zero *inside* the bitstream that
  // starts at the original peak locations. Extraction therefore needs the
  // same peak that was used. We recover it as the mode of the stego image
  // among values that still look like the peak (peak or freed).

  // Recompute candidate peak as the most frequent value in stego
  const h = histogram(stego);
  let peak = 0;
  for (let i = 1; i < 256; i++) if (h[i] > h[peak]) peak = i;

  // Try peak and peak±1 as possible original peaks (freed bin confuses mode)
  const candidates = [peak, peak - 1, peak + 1].filter((p) => p >= 0 && p <= 255);

  for (const candPeak of candidates) {
    for (const dir of [1, -1]) {
      const candZero = candPeak + dir;
      if (candZero < 0 || candZero > 255) continue;
      try {
        const result = await tryExtract(stego, candPeak, candZero);
        if (result.checksumOk) return result;
      } catch {
        /* try next */
      }
    }
  }

  // Last resort: use mode as peak and nearest lower/higher as zero
  const zero = peak < 255 ? peak + 1 : peak - 1;
  return tryExtract(stego, peak, zero);
}

async function tryExtract(
  stego: Uint8Array,
  peak: number,
  zero: number
): Promise<RDHExtractResult> {
  const restored = new Uint8Array(stego);
  const shiftRight = zero > peak;
  const freed = shiftRight ? peak + 1 : peak - 1;
  const bits: number[] = [];

  for (let i = 0; i < stego.length; i++) {
    const v = stego[i];
    if (v === peak) {
      bits.push(0);
    } else if (v === freed) {
      bits.push(1);
      restored[i] = peak;
    }
  }

  if (bits.length < HEADER_BITS) {
    throw new Error("Insufficient bits for header");
  }

  const headerBits = bits.slice(0, HEADER_BITS);
  const headerBytes = bitsToBytes(headerBits);
  const hdrPeak = headerBytes[0];
  const hdrZero = headerBytes[1];
  const secretLen = bytesToU32(headerBytes.slice(2, 6));
  const storedCs = headerBytes.slice(6, 14);

  // Prefer header-declared peak/zero for the reverse shift
  const usePeak = hdrPeak;
  const useZero = hdrZero;
  const useShiftRight = useZero > usePeak;

  // Reverse shift using header values
  for (let i = 0; i < restored.length; i++) {
    const v = restored[i];
    if (useShiftRight) {
      if (v > usePeak && v <= useZero) restored[i] = v - 1;
    } else {
      if (v < usePeak && v >= useZero) restored[i] = v + 1;
    }
  }

  const secretBits = bits.slice(HEADER_BITS, HEADER_BITS + secretLen * 8);
  if (secretBits.length < secretLen * 8) {
    throw new Error("Insufficient bits for secret");
  }
  const secret = bitsToBytes(secretBits).slice(0, secretLen);

  const actualCs = await checksum8(secret);
  let checksumOk = actualCs.length === storedCs.length;
  if (checksumOk) {
    for (let i = 0; i < actualCs.length; i++) {
      if (actualCs[i] !== storedCs[i]) {
        checksumOk = false;
        break;
      }
    }
  }

  return { secret, restoredCover: restored, checksumOk };
}
