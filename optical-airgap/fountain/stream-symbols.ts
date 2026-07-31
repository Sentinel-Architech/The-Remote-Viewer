/**
 * Host-side helper: payload → infinite LT frames (binary + base64url).
 * Use from Node/Termux; browser uses the inlined logic in qr-sender.html.
 */

import { LTEncoder } from "./lt-core.js";
import {
  encodeLTFrame,
  frameToBase64Url,
  type LTFrameMeta,
} from "./lt-frame.js";

export interface SymbolStreamOptions {
  blockSize?: number;
}

export function* iterLTFrames(
  payload: Uint8Array,
  opts: SymbolStreamOptions = {}
): Generator<{ seed: number; frame: Uint8Array; base64url: string; qrText: string }> {
  const blockSize = opts.blockSize ?? 32;
  const enc = new LTEncoder(payload, blockSize);
  const meta: LTFrameMeta = { k: enc.k, blockSize };
  let seed = 0;
  for (;;) {
    const sym = enc.next();
    const frame = encodeLTFrame(sym, meta);
    const base64url = frameToBase64Url(frame);
    yield {
      seed,
      frame,
      base64url,
      qrText: `TRVL1.${base64url}`,
    };
    seed++;
  }
}
