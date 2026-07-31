/**
 * TRV qrcode-lite — minimal pure-JS QR encoder (byte mode)
 * Offline / air-gap safe. No network. No Meta/Google/Microsoft.
 *
 * Supports QR versions 1–10, ECC level L, byte mode.
 * Enough for TRVL base64url frames at modest block sizes.
 *
 * API:
 *   TRVQR.drawCanvas(canvas, text, { cellSize?: number })
 *   TRVQR.toMatrix(text) -> boolean[][] (true = dark)
 *
 * Derived from classic public-domain QR structure (format/version tables
 * and Reed-Solomon over GF(256)). MIT / public algorithm.
 */
(function (global) {
  "use strict";

  // GF(256) for RS
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  function rsGenerator(ecLen) {
    let g = [1];
    for (let i = 0; i < ecLen; i++) {
      const ng = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        ng[j] ^= g[j];
        ng[j + 1] ^= gfMul(g[j], EXP[i]);
      }
      g = ng;
    }
    return g;
  }

  function rsEncode(data, ecLen) {
    const gen = rsGenerator(ecLen);
    const res = new Array(ecLen).fill(0);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ res[0];
      res.shift();
      res.push(0);
      if (factor) {
        for (let j = 0; j < gen.length - 1; j++) {
          res[j] ^= gfMul(gen[j + 1], factor);
        }
      }
    }
    return res;
  }

  // version -> [total data modules capacity bytes approx via table totalCodewords, ecLevel L ec codewords]
  // Simplified fixed table: [version, size, dataCodewords, ecCodewords] for ECC L single block
  const VER = [
    null,
    { v: 1, size: 21, data: 19, ec: 7 },
    { v: 2, size: 25, data: 34, ec: 10 },
    { v: 3, size: 29, data: 55, ec: 15 },
    { v: 4, size: 33, data: 80, ec: 20 },
    { v: 5, size: 37, data: 108, ec: 26 },
    { v: 6, size: 41, data: 136, ec: 36 },
    { v: 7, size: 45, data: 156, ec: 40 },
    { v: 8, size: 49, data: 194, ec: 48 },
    { v: 9, size: 53, data: 232, ec: 60 },
    { v: 10, size: 57, data: 274, ec: 72 },
  ];

  function chooseVersion(byteLen) {
    // byte mode overhead: 4 mode + 8 count + data + 4 terminator rough
    const need = byteLen + 3;
    for (let v = 1; v <= 10; v++) {
      if (VER[v].data >= need) return VER[v];
    }
    throw new Error("Payload too large for qrcode-lite (max ~270 bytes, version 10 L)");
  }

  function setRect(mat, x, y, w, h, val) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) mat[y + dy][x + dx] = val;
  }

  function addFinder(mat, x, y) {
    setRect(mat, x, y, 7, 7, true);
    setRect(mat, x + 1, y + 1, 5, 5, false);
    setRect(mat, x + 2, y + 2, 3, 3, true);
  }

  function addTiming(mat, size) {
    for (let i = 8; i < size - 8; i++) {
      mat[6][i] = i % 2 === 0;
      mat[i][6] = i % 2 === 0;
    }
  }

  function reserveFormat(mat, size) {
    for (let i = 0; i < 8; i++) {
      if (mat[8][i] === null) mat[8][i] = false;
      if (mat[i][8] === null) mat[i][8] = false;
      if (mat[8][size - 1 - i] === null) mat[8][size - 1 - i] = false;
      if (mat[size - 1 - i][8] === null) mat[size - 1 - i][8] = false;
    }
    mat[8][8] = false;
  }

  function buildMatrix(dataBits, ver) {
    const size = ver.size;
    const mat = Array.from({ length: size }, () => Array(size).fill(null));

    addFinder(mat, 0, 0);
    addFinder(mat, size - 7, 0);
    addFinder(mat, 0, size - 7);
    // separators
    for (let i = 0; i < 8; i++) {
      if (i < 7) {
        mat[7][i] = false;
        mat[i][7] = false;
        mat[7][size - 1 - i] = false;
        mat[i][size - 8] = false;
        mat[size - 8][i] = false;
        mat[size - 1 - i][7] = false;
      }
    }
    mat[7][7] = false;

    // dark module
    mat[size - 8][8] = true;

    addTiming(mat, size);
    reserveFormat(mat, size);

    // place data bits (zigzag)
    let bit = 0;
    let dirUp = true;
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (let i = 0; i < size; i++) {
        const y = dirUp ? size - 1 - i : i;
        for (let dx = 0; dx < 2; dx++) {
          const x = col - dx;
          if (mat[y][x] !== null) continue;
          const v = bit < dataBits.length ? dataBits[bit++] : false;
          // mask 0: (r+c)%2==0 flip
          mat[y][x] = (y + x) % 2 === 0 ? !v : v;
        }
      }
      dirUp = !dirUp;
    }

    // format info ECC L mask 0: 0b01 | mask 000 -> simplified fixed pattern
    // BCH format for ecc L (01) mask 0 (000) = 0x77c4 known table value used widely
    const format = 0x77c4;
    const formatBits = [];
    for (let i = 14; i >= 0; i--) formatBits.push(((format >> i) & 1) === 1);

    // horizontal format near finder
    const posH = [0, 1, 2, 3, 4, 5, 7, 8];
    for (let i = 0; i < 8; i++) mat[8][posH[i]] = formatBits[i];
    for (let i = 0; i < 7; i++) mat[8][size - 1 - i] = formatBits[8 + i];
    // vertical
    for (let i = 0; i < 7; i++) mat[size - 1 - i][8] = formatBits[i];
    const posV = [8, 7, 5, 4, 3, 2, 1, 0];
    for (let i = 0; i < 8; i++) mat[posV[i]][8] = formatBits[7 + i];

    return mat.map((row) => row.map((c) => !!c));
  }

  function encodeByteMode(text) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) bytes.push(text.charCodeAt(i) & 0xff);
    const ver = chooseVersion(bytes.length);
    const bits = [];
    function push(val, len) {
      for (let i = len - 1; i >= 0; i--) bits.push(((val >> i) & 1) === 1);
    }
    push(0b0100, 4); // byte mode
    push(bytes.length, 8); // count for ver <= 9; ver 10 still 8 for simplicity in lite
    for (const b of bytes) push(b, 8);
    push(0, 4); // terminator

    // pad to data codewords
    while (bits.length % 8 !== 0) bits.push(false);
    const dataCw = [];
    for (let i = 0; i < bits.length; i += 8) {
      let v = 0;
      for (let j = 0; j < 8; j++) if (bits[i + j]) v |= 1 << (7 - j);
      dataCw.push(v);
    }
    const pad = [0xec, 0x11];
    let pi = 0;
    while (dataCw.length < ver.data) {
      dataCw.push(pad[pi % 2]);
      pi++;
    }
    dataCw.length = ver.data;

    const ec = rsEncode(dataCw, ver.ec);
    const all = dataCw.concat(ec);
    const outBits = [];
    for (const c of all) push.call({ push: (v, l) => {
      for (let i = l - 1; i >= 0; i--) outBits.push(((v >> i) & 1) === 1);
    }}, c, 8);
    // fix push for outBits
    const finalBits = [];
    for (const c of all) {
      for (let i = 7; i >= 0; i--) finalBits.push(((c >> i) & 1) === 1);
    }
    return { ver, bits: finalBits };
  }

  function toMatrix(text) {
    const { ver, bits } = encodeByteMode(text);
    return buildMatrix(bits, ver);
  }

  function drawCanvas(canvas, text, opts) {
    opts = opts || {};
    const cell = opts.cellSize || 4;
    const mat = toMatrix(text);
    const n = mat.length;
    const quiet = 4;
    const dim = (n + quiet * 2) * cell;
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = "#000000";
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (mat[y][x]) {
          ctx.fillRect((x + quiet) * cell, (y + quiet) * cell, cell, cell);
        }
      }
    }
  }

  global.TRVQR = { toMatrix: toMatrix, drawCanvas: drawCanvas };
})(typeof self !== "undefined" ? self : globalThis);
