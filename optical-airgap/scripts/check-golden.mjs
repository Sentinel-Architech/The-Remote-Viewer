/**
 * Verify Soliton degrees for k=8 match golden-degrees-k8.json (Sentinel Standard).
 * Zero npm deps — pure math mirror of robust-soliton.ts
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
  readFileSync(join(__dirname, "../fountain/testdata/golden-degrees-k8.json"), "utf8")
);

function seedToUnit(seed) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}
function idealSoliton(k) {
  const rho = new Float64Array(k + 1);
  rho[1] = 1 / k;
  for (let i = 2; i <= k; i++) rho[i] = 1 / (i * (i - 1));
  return rho;
}
function robustSoliton(k, c, delta) {
  const rho = idealSoliton(k);
  const R = c * Math.log(k / delta) * Math.sqrt(k);
  const tau = new Float64Array(k + 1);
  const threshold = Math.max(1, Math.floor(k / R) || 1);
  for (let i = 1; i <= k; i++) {
    if (i < threshold) tau[i] = R / (i * k);
    else if (i === threshold) tau[i] = (R * Math.log(R / delta)) / k;
  }
  let beta = 0;
  for (let i = 1; i <= k; i++) beta += rho[i] + tau[i];
  const mu = new Float64Array(k + 1);
  for (let i = 1; i <= k; i++) mu[i] = (rho[i] + tau[i]) / beta;
  return mu;
}
function sample(cdf, seed, k) {
  const u = seedToUnit(seed);
  for (let i = 1; i <= k; i++) if (u < cdf[i]) return i;
  return k;
}

const k = golden.k;
const mu = robustSoliton(k, golden.c, golden.delta);
const cdf = new Float64Array(mu.length);
let acc = 0;
for (let i = 0; i < mu.length; i++) {
  acc += mu[i];
  cdf[i] = acc;
}

let fail = 0;
for (let seed = 0; seed < golden.degrees.length; seed++) {
  const d = sample(cdf, seed, k);
  if (d !== golden.degrees[seed]) {
    console.error(`seed ${seed}: got ${d} expected ${golden.degrees[seed]}`);
    fail++;
  }
}
if (fail) {
  console.error(`FAIL ${fail} mismatches`);
  process.exit(1);
}
console.log(`OK golden degrees k=${k} n=${golden.degrees.length}`);
