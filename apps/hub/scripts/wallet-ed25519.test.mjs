import test from "node:test";
import assert from "node:assert/strict";

const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const PKCS8_HEAD = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

function b58(bytes) {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      const x = digits[i] * 256 + carry;
      digits[i] = x % 58;
      carry = Math.floor(x / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => ALPHA[d]).join("");
}

function b64urlToBytes(s) {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function seedToPkcs8(seed) {
  const out = new Uint8Array(48);
  out.set(PKCS8_HEAD);
  out.set(seed, 16);
  return out;
}

async function pubRaw(seed) {
  const priv = await crypto.subtle.importKey("pkcs8", seedToPkcs8(seed), { name: "Ed25519" }, true, ["sign"]);
  const jwk = await crypto.subtle.exportKey("jwk", priv);
  return b64urlToBytes(jwk.x);
}

test("Ed25519 pubkey is 32 bytes and deterministic for a seed", async () => {
  const seed = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
  const a = await pubRaw(seed);
  const b = await pubRaw(seed);
  assert.equal(a.length, 32);
  assert.deepEqual([...a], [...b]);
  const addr = b58(a);
  assert.ok(addr.length >= 32 && addr.length <= 44);
});

test("Ed25519 address is not the SHA-256 hash of the seed", async () => {
  const seed = Uint8Array.from({ length: 32 }, (_, i) => (i * 7) % 256);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", seed));
  const ed = await pubRaw(seed);
  assert.notDeepEqual([...ed], [...hash]);
  assert.notEqual(b58(ed), b58(hash));
});

test("sign and verify a helm proof", async () => {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const pub = await pubRaw(seed);
  const priv = await crypto.subtle.importKey("pkcs8", seedToPkcs8(seed), { name: "Ed25519" }, false, ["sign"]);
  const msg = new TextEncoder().encode(`TRV-HELM|1|${b58(pub)}|test`);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, priv, msg));
  assert.equal(sig.length, 64);
  const key = await crypto.subtle.importKey("raw", pub, { name: "Ed25519" }, false, ["verify"]);
  assert.equal(await crypto.subtle.verify({ name: "Ed25519" }, key, sig, msg), true);
});

test("64-byte Solana secret is seed || pubkey", async () => {
  const seed = Uint8Array.from({ length: 32 }, (_, i) => 255 - i);
  const pub = await pubRaw(seed);
  const secret = new Uint8Array(64);
  secret.set(seed);
  secret.set(pub, 32);
  assert.deepEqual([...secret.slice(0, 32)], [...seed]);
  assert.deepEqual([...secret.slice(32)], [...pub]);
  assert.ok(b58(secret).length > 80);
});
