# Vendor QR decoder (optional)

`qr-receiver.html` works offline with:

1. **BarcodeDetector** (many Chromium builds), or
2. **Paste / file** of `TRVL1.` lines (always), or
3. **paulmillr/qr** if you expose global `decodeQR` from a local file.

## Why paulmillr/qr

- ~11.5 KB gzipped (encode + decode)
- 0 dependencies, dual MIT/Apache-2.0
- Actively maintained; jsQR is unmaintained
- Takes the same ImageData shape the receiver already produces
- Throws when no code is found (treat as frame miss)

## One-time vendor step (networked machine)

```bash
# Prefer a pinned release or commit. Verify LICENSE (MIT OR Apache-2.0).
# Example using npm + a simple global exposure (adjust to the release you pin):

npm pack qr
# or clone https://github.com/paulmillr/qr and build / copy the decode entry

# Goal: a single file that, when loaded as a classic script or via type=module,
# makes `decodeQR` available as a global function taking ImageData-like input:
#   decodeQR({ width, height, data }) → string  (throws if no QR)
```

Then in `qr-receiver.html` ensure a local script tag loads it **before** the main logic, e.g.:

```html
<script src="vendor/qr-decode.js"></script>
<!-- or type=module that assigns window.decodeQR = ... -->
```

Air-gapped device: copy the file via USB / ADB. Never require a CDN at scan time.

## API expected by the receiver

```js
// ImageData or { width, height, data: Uint8ClampedArray|Uint8Array }
const text = decodeQR(imageData);   // throws if nothing found
```

The receiver catches the throw and treats it as “no QR this frame”.
