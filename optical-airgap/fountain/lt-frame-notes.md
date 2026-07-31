# LT frame wire format (v1)

Used to put one LT symbol into one QR (or a chunk of a multi-QR stream).

## Layout

```
magic[4] = TRVL
version  = 1
flags    = bit0 explicit indices
k        = u16 BE
blockSize= u16 BE
seed     = u32 BE
degree   = u16 BE
payloadLen = u16 BE
indices  = degree × u16 BE   (if flag set)
data     = payloadLen bytes
crc16    = u16 BE  (CRC-16/IBM over everything before crc)
```

## API

```ts
import { LTEncoder } from "./lt-core.js";
import { encodeLTFrame, decodeLTFrame, frameToBase64Url } from "./lt-frame.js";

const enc = new LTEncoder(payload, 32);
const sym = enc.next();
const frame = encodeLTFrame(sym, { k: enc.k, blockSize: 32 });
const forQr = frameToBase64Url(frame); // text QR
// or put `frame` bytes in byte-mode QR when library supports it
```

## Sizing

QR version 10–15 ~ text capacity is limited. Prefer `blockSize` 32–64 and many frames; LT is rateless.
