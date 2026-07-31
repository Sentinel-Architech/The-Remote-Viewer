/**
 * TRV Optical Air-Gap — Histogram Shifting RDH (Scaffold)
 *
 * Pure TypeScript reversible data hiding based on classic histogram shifting.
 * Open-source, no proprietary dependencies.
 *
 * License: MIT (or project root license)
 *
 * Perfect reversibility: both secret and original cover can be recovered.
 * Suitable as the "reverse distortion" layer before LT fountain encoding.
 *
 * Production notes:
 * - Operate on grayscale or single channel for simplicity and speed.
 * - Capacity is limited by peak height; adequate for keys and short messages.
 * - Always encrypt first (age/libsodium) before embedding.
 */

export interface RDHResult {
  stego: Uint8Array;       // modified cover (same length as input)
  peak: number;
  zero: number;
  embeddedBits: number;
  originalLength: number;
}

export interface RDHExtractResult {
  secret: Uint8Array;
  restoredCover: Uint8Array;
}

/**
 * Build histogram for 8-bit values.
 */
function histogram(data: Uint8Array): number[] {
  const h = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) h[data[i]]++;
  return h;
}

/**
 * Find peak and a zero (or minimum) bin on the chosen side.
 */
function findPeakAndZero(h: number[]): { peak: number; zero: number } {
  let peak = 0;
  for (let i = 1; i < 256; i++) {
    if (h[i] > h[peak]) peak = i;
  }
  // Prefer a zero bin to the right of peak; fall back to minimum
  let zero = -1;
  for (let i = peak + 1; i < 256; i++) {
    if (h[i] === 0) {
      zero = i;
      break;
    }
  }
  if (zero === -1) {
    // find minimum on the right
    zero = peak + 1 < 256 ? peak + 1 : peak;
    let minVal = h[zero];
    for (let i = peak + 1; i < 256; i++) {
      if (h[i] < minVal) {
        minVal = h[i];
        zero = i;
      }
    }
  }
  return { peak, zero };
}

/**
 * Embed secret bits into cover using histogram shifting.
 * cover and secret are raw byte arrays (treat cover as 8-bit samples).
 */
export function embedHistogramShifting(
  cover: Uint8Array,
  secret: Uint8Array
): RDHResult {
  const stego = new Uint8Array(cover);
  const h = histogram(cover);
  const { peak, zero } = findPeakAndZero(h);

  if (peak === zero) {
    throw new Error("Cannot embed: peak and zero collide");
  }

  const shiftRight = zero > peak;

  // Shift bins between peak and zero
  for (let i = 0; i < stego.length; i++) {
    const v = stego[i];
    if (shiftRight) {
      if (v > peak && v < zero) stego[i] = v + 1;
    } else {
      if (v < peak && v > zero) stego[i] = v - 1;
    }
  }

  // Embed bits at the peak locations
  let bitIdx = 0;
  const totalBits = secret.length * 8;
  for (let i = 0; i < stego.length && bitIdx < totalBits; i++) {
    if (stego[i] === peak) {
      const byte = secret[bitIdx >> 3];
      const bit = (byte >> (7 - (bitIdx & 7))) & 1;
      if (bit === 1) {
        stego[i] = shiftRight ? peak + 1 : peak - 1;
      }
      // bit 0 leaves the value at peak
      bitIdx++;
    }
  }

  return {
    stego,
    peak,
    zero,
    embeddedBits: bitIdx,
    originalLength: cover.length,
  };
}

/**
 * Extract secret and restore original cover.
 * Requires the same peak/zero that were used at embed time (pass via header or side channel).
 */
export function extractHistogramShifting(
  stego: Uint8Array,
  peak: number,
  zero: number,
  secretLengthBytes: number
): RDHExtractResult {
  const restored = new Uint8Array(stego);
  const secretBits: number[] = [];
  const totalBits = secretLengthBytes * 8;
  const shiftRight = zero > peak;
  const freed = shiftRight ? peak + 1 : peak - 1;

  for (let i = 0; i < stego.length && secretBits.length < totalBits; i++) {
    const v = stego[i];
    if (v === peak) {
      secretBits.push(0);
    } else if (v === freed) {
      secretBits.push(1);
      restored[i] = peak; // restore for bit 1
    }
  }

  // Reverse the shift
  for (let i = 0; i < restored.length; i++) {
    const v = restored[i];
    if (shiftRight) {
      if (v > peak && v <= zero) restored[i] = v - 1;
    } else {
      if (v < peak && v >= zero) restored[i] = v + 1;
    }
  }

  const secret = new Uint8Array(secretLengthBytes);
  for (let b = 0; b < totalBits; b++) {
    if (secretBits[b]) {
      secret[b >> 3] |= 1 << (7 - (b & 7));
    }
  }

  return { secret, restoredCover: restored };
}
