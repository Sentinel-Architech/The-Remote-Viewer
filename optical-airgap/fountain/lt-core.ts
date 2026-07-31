/**
 * TRV Optical Air-Gap — Luby Transform (LT) Fountain Code Skeleton
 *
 * Pure TypeScript, no external dependencies.
 * Robust Soliton degree distribution (simplified).
 * Open-source, suitable for GrapheneOS browser / Termux / Node.
 *
 * License: MIT (or project root license)
 *
 * This is a correct structural skeleton. Production use requires:
 * - Full Robust Soliton parameter tuning
 * - Proper random number generation from a seed
 * - Efficient peeling decoder with degree-1 tracking
 * - Header + integrity (hash) on every symbol
 */

export interface LTSourceBlock {
  index: number;
  data: Uint8Array;
}

export interface LTSymbol {
  /** Degree (number of source blocks XORed) */
  degree: number;
  /** Indices of the source blocks that were XORed */
  indices: number[];
  /** The XOR result */
  data: Uint8Array;
  /** Sequence / seed used to generate this symbol (for deterministic reconstruction) */
  seed: number;
}

export interface LTEncoderConfig {
  /** Number of source blocks K */
  k: number;
  /** Block size in bytes */
  blockSize: number;
  /** Robust Soliton parameters (simplified defaults) */
  c?: number;
  delta?: number;
}

/**
 * Split payload into K fixed-size source blocks (pad last block with zeros).
 */
export function splitIntoBlocks(
  payload: Uint8Array,
  blockSize: number
): LTSourceBlock[] {
  const blocks: LTSourceBlock[] = [];
  let offset = 0;
  let index = 0;
  while (offset < payload.length) {
    const chunk = new Uint8Array(blockSize);
    const end = Math.min(offset + blockSize, payload.length);
    chunk.set(payload.subarray(offset, end));
    blocks.push({ index, data: chunk });
    offset = end;
    index++;
  }
  if (blocks.length === 0) {
    blocks.push({ index: 0, data: new Uint8Array(blockSize) });
  }
  return blocks;
}

/**
 * Simple degree sampler (placeholder for full Robust Soliton).
 * Returns degree in [1, K].
 */
function sampleDegree(k: number, seed: number): number {
  // Deterministic but simplified. Replace with proper Robust Soliton.
  const x = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  if (x < 0.5) return 1;
  if (x < 0.75) return 2;
  if (x < 0.9) return Math.min(3, k);
  return Math.min(1 + Math.floor(x * k), k);
}

/**
 * Generate one LT symbol from source blocks.
 */
export function encodeSymbol(
  blocks: LTSourceBlock[],
  seed: number
): LTSymbol {
  const k = blocks.length;
  const degree = sampleDegree(k, seed);
  const indices: number[] = [];
  const chosen = new Set<number>();

  let s = seed;
  while (indices.length < degree) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % k;
    if (!chosen.has(idx)) {
      chosen.add(idx);
      indices.push(idx);
    }
  }
  indices.sort((a, b) => a - b);

  const data = new Uint8Array(blocks[0].data.length);
  for (const i of indices) {
    const src = blocks[i].data;
    for (let j = 0; j < data.length; j++) {
      data[j] ^= src[j];
    }
  }

  return { degree, indices, data, seed };
}

/**
 * LT Encoder: produces an infinite stream of symbols.
 */
export class LTEncoder {
  private blocks: LTSourceBlock[];
  private nextSeed = 0;

  constructor(payload: Uint8Array, blockSize: number) {
    this.blocks = splitIntoBlocks(payload, blockSize);
  }

  get k(): number {
    return this.blocks.length;
  }

  /** Generate the next symbol */
  next(): LTSymbol {
    const sym = encodeSymbol(this.blocks, this.nextSeed);
    this.nextSeed++;
    return sym;
  }
}

/**
 * Minimal peeling decoder skeleton.
 * Collect symbols until enough degree-1 symbols appear and cascade.
 * Production version needs efficient data structures.
 */
export class LTDecoder {
  private k: number;
  private blockSize: number;
  private recovered: (Uint8Array | null)[];
  private symbols: LTSymbol[] = [];

  constructor(k: number, blockSize: number) {
    this.k = k;
    this.blockSize = blockSize;
    this.recovered = new Array(k).fill(null);
  }

  addSymbol(sym: LTSymbol): void {
    this.symbols.push(sym);
    this.peel();
  }

  get recoveredCount(): number {
    return this.recovered.filter((b) => b !== null).length;
  }

  get isComplete(): boolean {
    return this.recoveredCount === this.k;
  }

  /** Attempt peeling decode (simplified). */
  private peel(): void {
    let progress = true;
    while (progress) {
      progress = false;
      for (const sym of this.symbols) {
        const unknown = sym.indices.filter((i) => this.recovered[i] === null);
        if (unknown.length === 1) {
          const target = unknown[0];
          const data = new Uint8Array(sym.data);
          for (const i of sym.indices) {
            if (i !== target && this.recovered[i]) {
              const known = this.recovered[i]!;
              for (let j = 0; j < data.length; j++) {
                data[j] ^= known[j];
              }
            }
          }
          this.recovered[target] = data;
          progress = true;
        }
      }
    }
  }

  /** Return recovered payload (concatenated blocks) or null if incomplete. */
  getPayload(): Uint8Array | null {
    if (!this.isComplete) return null;
    const out = new Uint8Array(this.k * this.blockSize);
    for (let i = 0; i < this.k; i++) {
      out.set(this.recovered[i]!, i * this.blockSize);
    }
    return out;
  }
}
