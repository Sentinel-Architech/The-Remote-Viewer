/**
 * Robust Soliton degree distribution (Luby).
 * Used by LT encoder when configured; pure TS, no deps.
 */

export interface RobustSolitonParams {
  k: number;
  /** c typically 0.05–0.2 */
  c?: number;
  /** failure probability delta, e.g. 0.05 */
  delta?: number;
}

/** Ideal soliton ρ(i) */
export function idealSoliton(k: number): Float64Array {
  const rho = new Float64Array(k + 1);
  rho[1] = 1 / k;
  for (let i = 2; i <= k; i++) rho[i] = 1 / (i * (i - 1));
  return rho;
}

/** Robust soliton μ(i) = (ρ + τ) / β */
export function robustSoliton(params: RobustSolitonParams): Float64Array {
  const k = params.k;
  const c = params.c ?? 0.1;
  const delta = params.delta ?? 0.05;
  const rho = idealSoliton(k);
  const R = c * Math.log(k / delta) * Math.sqrt(k);
  const tau = new Float64Array(k + 1);
  const threshold = Math.floor(k / R);
  for (let i = 1; i <= k; i++) {
    if (i < threshold) tau[i] = R / (i * k);
    else if (i === threshold) tau[i] = (R * Math.log(R / delta)) / k;
    else tau[i] = 0;
  }
  let beta = 0;
  for (let i = 1; i <= k; i++) beta += rho[i] + tau[i];
  const mu = new Float64Array(k + 1);
  for (let i = 1; i <= k; i++) mu[i] = (rho[i] + tau[i]) / beta;
  return mu;
}

/** CDF for sampling */
export function solitonCdf(mu: Float64Array): Float64Array {
  const cdf = new Float64Array(mu.length);
  let acc = 0;
  for (let i = 0; i < mu.length; i++) {
    acc += mu[i];
    cdf[i] = acc;
  }
  return cdf;
}

/** Sample degree in 1..=k from CDF using u in [0,1) */
export function sampleDegreeFromCdf(cdf: Float64Array, u: number, k: number): number {
  for (let i = 1; i <= k; i++) {
    if (u < cdf[i]) return i;
  }
  return k;
}

/** Deterministic u from seed (same family as lt-core) */
export function seedToUnit(seed: number): number {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}
