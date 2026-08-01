# Vendor QR decoder (optional)

`qr-receiver.html` works offline with:

1. **BarcodeDetector** (many Chromium builds), or
2. **Paste / file** of `TRVL1.` lines (always), or
3. **jsQR** if you place `jsQR.js` here and uncomment the script tag in the receiver.

## One-time vendor step (networked machine)

```bash
# example — verify license, then copy
curl -L -o jsQR.js https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js
# Prefer downloading from GitHub release/commit you pin; check Apache-2.0 LICENSE
```

Or clone https://github.com/cozmo/jsQR and copy `dist/jsQR.js`.

Then in `qr-receiver.html` ensure:

```html
<script src="vendor/jsQR.js"></script>
```

Air-gapped Acer: copy the file via USB; never require CDN at scan time.
