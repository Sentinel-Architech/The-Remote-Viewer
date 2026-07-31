/**
 * TRV Optical Air-Gap — LT symbol binary framing for QR / optical transfer
 *
 * Wire layout (version 1), all multi-byte fields big-endian:
 *
 *   magic[4]     = "TRVL" (0x54 52 56 4C)
 *   version      = u8  (1)
 *   flags        = u8  (bit0 = has explicit indices; else seed-only)
 *   k            = u16  number of source blocks
 *   blockSize    = u16  bytes per block
 *   seed         = u32  symbol seed (encoder sequence)
 *   degree       = u16
 *   payloadLen   = u16  length of XOR data (== blockSize typically)
 *   indices      = degree × u16  (if flags bit0 set)
 *   data         = payloadLen bytes
 *   crc16        = u16  CRC-16/IBM of all prior bytes in frame
 *
 * QR capacity is limited; keep blockSize small (e.g. 32–64) for multi-frame streams.
 * Pure TypeScript, zero deps. MIT.
 */

import type { LTSymbol } from "./lt-core.js";

export const LT_FRAME_MAGIC = new Uint8Array([0x54, 0x52, 0x56, 0x4c]); // TRVL
export const LT_FRAME_VERSION = 1;
export const FLAG_EXPLICIT_INDICES = 1 << 0;

export interface LTFrameMeta {
  k: number;
  blockSize: number;
}

/** CRC-16/IBM (poly 0xA001), init 0xFFFF — small integrity check per frame. */
export function crc16ibm(data: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let b = 0; b < 8; b++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
    }
  }
  return crc & 0xffff;
}

function u16be(n: number): Uint8Array {
  return new Uint8Array([(n >>> 8) & 0xff, n & 0xff]);
}

function u32be(n: number): Uint8Array {
  return new Uint8Array([
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ]);
}

function readU16be(buf: Uint8Array, off: number): number {
  return ((buf[off] << 8) | buf[off + 1]) >>> 0;
}

function readU32be(buf: Uint8Array, off: number): number {
  return (
    ((buf[off] << 24) |
      (buf[off + 1] << 16) |
      (buf[off + 2] << 8) |
      buf[off + 3]) >>>
    0
  );
}

/**
 * Pack one LT symbol into a binary frame (with explicit indices for decoder simplicity).
 */
export function encodeLTFrame(
  sym: LTSymbol,
  meta: LTFrameMeta
): Uint8Array {
  if (sym.data.length !== meta.blockSize) {
    throw new Error(
      `symbol data length ${sym.data.length} != blockSize ${meta.blockSize}`
    );
  }
  if (sym.degree !== sym.indices.length) {
    throw new Error("degree / indices mismatch");
  }
  if (meta.k > 0xffff || meta.blockSize > 0xffff) {
    throw new Error("k or blockSize exceeds u16");
  }

  const parts: Uint8Array[] = [];
  parts.push(LT_FRAME_MAGIC);
  parts.push(new Uint8Array([LT_FRAME_VERSION, FLAG_EXPLICIT_INDICES]));
  parts.push(u16be(meta.k));
  parts.push(u16be(meta.blockSize));
  parts.push(u32be(sym.seed >>> 0));
  parts.push(u16be(sym.degree));
  parts.push(u16be(sym.data.length));
  for (const idx of sym.indices) {
    if (idx > 0xffff) throw new Error("index exceeds u16");
    parts.push(u16be(idx));
  }
  parts.push(sym.data);

  let total = 0;
  for (const p of parts) total += p.length;
  const body = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    body.set(p, o);
    o += p.length;
  }

  const crc = crc16ibm(body);
  const out = new Uint8Array(body.length + 2);
  out.set(body, 0);
  out[body.length] = (crc >>> 8) & 0xff;
  out[body.length + 1] = crc & 0xff;
  return out;
}

export interface DecodedLTFrame {
  meta: LTFrameMeta;
  symbol: LTSymbol;
}

/**
 * Unpack a binary frame. Throws on magic/version/CRC errors.
 */
export function decodeLTFrame(frame: Uint8Array): DecodedLTFrame {
  if (frame.length < 4 + 1 + 1 + 2 + 2 + 4 + 2 + 2 + 2) {
    throw new Error("frame too short");
  }
  for (let i = 0; i < 4; i++) {
    if (frame[i] !== LT_FRAME_MAGIC[i]) throw new Error("bad magic");
  }
  const version = frame[4];
  if (version !== LT_FRAME_VERSION) {
    throw new Error(`unsupported version ${version}`);
  }
  const flags = frame[5];
  const k = readU16be(frame, 6);
  const blockSize = readU16be(frame, 8);
  const seed = readU32be(frame, 10);
  const degree = readU16be(frame, 14);
  const payloadLen = readU16be(frame, 16);
  let off = 18;

  const indices: number[] = [];
  if (flags & FLAG_EXPLICIT_INDICES) {
    for (let i = 0; i < degree; i++) {
      if (off + 2 > frame.length - 2) throw new Error("truncated indices");
      indices.push(readU16be(frame, off));
      off += 2;
    }
  } else {
    throw new Error("seed-only frames not implemented in v1 decoder");
  }

  if (off + payloadLen + 2 > frame.length) {
    throw new Error("truncated data");
  }
  const data = frame.subarray(off, off + payloadLen);
  off += payloadLen;
  const storedCrc = readU16be(frame, off);
  const body = frame.subarray(0, off);
  const calc = crc16ibm(body);
  if (calc !== storedCrc) {
    throw new Error(`CRC mismatch stored=0x${storedCrc.toString(16)} calc=0x${calc.toString(16)}`);
  }

  return {
    meta: { k, blockSize },
    symbol: {
      degree,
      indices,
      data: new Uint8Array(data),
      seed,
    },
  };
}

/** Base64url (no padding) for text QR modes when binary QR is unavailable. */
export function frameToBase64Url(frame: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < frame.length; i++) bin += String.fromCharCode(frame[i]);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(frame).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function frameFromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw =
    typeof atob === "function"
      ? atob(b64 + pad)
      : Buffer.from(b64 + pad, "base64").toString("binary");
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
