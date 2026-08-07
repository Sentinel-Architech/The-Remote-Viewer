/**
 * TRV Optical Air-Gap — Luby Transform (LT) Fountain Codes
 *
 * Pure TypeScript, no external dependencies.
 * Degree sampling: Robust Soliton by default (c=0.1, delta=0.05).
 * Set LTEncoderConfig.degreeMode = "legacy" for the old heuristic.
 *
 * Exact original length: every payload is prefixed with a u32 BE length
 * before block split. getPayload() returns the exact original bytes.
 *
 * License: MIT (project root)
 */

import {
  robustSoliton,
  sampleDegreeFromCdf,
  seedToUnit,
  solitonCdf,
} from "./robust-soliton";

export interface LTSourceBlock {
  index: number;
  data: Uint8Array;
}

export interface LTSymbol {
  degree: number;
  indices: number[];
  data: Uint8Array;
  seed: number;
}

export interface LTEncoderConfig {
  k: number;
  blockSize: number;
  c?: number;
  delta?: number;
  /** default: soliton */
  degreeMode?: "soliton" | "legacy";
}

/** Prefix payload with u32 big-endian original length (Sentinel Optical Fountain). */
export function withLengthPrefix(payload: Uint8Array): Uint8Array {
  if (payload.length > 0xffffffff) {
    throw new Error("payload too large for u32 length prefix");
  }
  const out = new Uint8Array(4 + payload.length);
  const len = payload.length;
  out[0] = (len >>> 24) & 0xff;
  out[1] = (len >>> 16) & 0xff;
  out[2] = (len >>> 8) & 0xff;
  out[3] = len & 0xff;
  out.set(payload, 4);
  return out;
}

/** Extract exact original bytes using the leading u32 BE length. */
export function stripLengthPrefix(recovered: Uint8Array): Uint8Array {
  if (recovered.length < 4) {
    throw new Error("recovered too short for length prefix");
  }
  const origLen =
    ((recovered[0] << 24) |
      (recovered[1] << 16) |
      (recovered[2] << 8) |
      recovered[3]) >>>
    0;
  if (4 + origLen > recovered.length) {
    throw new Error(
      `length prefix ${origLen} exceeds recovered ${recovered.length - 4}`
    );
  }
  return recovered.subarray(4, 4 + origLen);
}

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

/** Legacy heuristic (kept for R2 hard-cut / interop tests). */
function sampleDegreeLegacy(k: number, seed: number): number {
  const x = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  if (x < 0.5) return 1;
  if (x < 0.75) return 2;
  if (x < 0.9) return Math.min(3, k);
  return Math.min(1 + Math.floor(x * k), k);
}

export function encodeSymbol(
  blocks: LTSourceBlock[],
  seed: number,
  opts?: {
    c?: number;
    delta?: number;
    degreeMode?: "soliton" | "legacy";
    cdf?: Float64Array;
  }
): LTSymbol {
  const k = blocks.length;
  const mode = opts?.degreeMode ?? "soliton";
  let degree: number;
  if (mode === "legacy") {
    degree = sampleDegreeLegacy(k, seed);
  } else {
    const cdf =
      opts?.cdf ??
      solitonCdf(
        robustSoliton({ k, c: opts?.c ?? 0.1, delta: opts?.delta ?? 0.05 })
      );
    degree = sampleDegreeFromCdf(cdf, seedToUnit(seed), k);
  }

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

export class LTEncoder {
  private blocks: LTSourceBlock[];
  private nextSeed = 0;
  private degreeMode: "soliton" | "legacy";
  private c: number;
  private delta: number;
  private cdf: Float64Array | null;

  constructor(
    payload: Uint8Array,
    blockSize: number,
    opts?: { c?: number; delta?: number; degreeMode?: "soliton" | "legacy" }
  ) {
    // Exact length: always prefix original length before splitting into blocks.
    this.blocks = splitIntoBlocks(withLengthPrefix(payload), blockSize);
    this.degreeMode = opts?.degreeMode ?? "soliton";
    this.c = opts?.c ?? 0.1;
    this.delta = opts?.delta ?? 0.05;
    this.cdf =
      this.degreeMode === "soliton"
        ? solitonCdf(
            robustSoliton({
              k: this.blocks.length,
              c: this.c,
              delta: this.delta,
            })
          )
        : null;
  }

  get k(): number {
    return this.blocks.length;
  }

  next(): LTSymbol {
    const sym = encodeSymbol(this.blocks, this.nextSeed, {
      degreeMode: this.degreeMode,
      c: this.c,
      delta: this.delta,
      cdf: this.cdf ?? undefined,
    });
    this.nextSeed++;
    return sym;
  }
}

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

  /** Assembles blocks then strips the leading u32 length prefix. */
  getPayload(): Uint8Array | null {
    if (!this.isComplete) return null;
    const out = new Uint8Array(this.k * this.blockSize);
    for (let i = 0; i < this.k; i++) {
      out.set(this.recovered[i]!, i * this.blockSize);
    }
    return stripLengthPrefix(out);
  }
}
