//! Robust Soliton degree distribution — matches TS `robust-soliton.ts`.
//! Defaults: c = 0.1, delta = 0.05.

/// Deterministic unit interval from seed (same family as TS seedToUnit).
pub fn seed_to_unit(seed: u32) -> f64 {
    ((seed as f64) * 12.9898).sin().abs() * 43758.5453 % 1.0
}

fn ideal_soliton(k: usize) -> Vec<f64> {
    let mut rho = vec![0.0; k + 1];
    if k == 0 {
        return rho;
    }
    rho[1] = 1.0 / k as f64;
    for i in 2..=k {
        rho[i] = 1.0 / (i as f64 * (i as f64 - 1.0));
    }
    rho
}

/// Robust soliton μ(i) for i in 1..=k.
pub fn robust_soliton(k: usize, c: f64, delta: f64) -> Vec<f64> {
    if k == 0 {
        return vec![0.0];
    }
    let rho = ideal_soliton(k);
    let r = c * (k as f64 / delta).ln() * (k as f64).sqrt();
    let mut tau = vec![0.0; k + 1];
    let threshold = if r > 0.0 {
        ((k as f64 / r).floor() as usize).max(1)
    } else {
        1
    };
    for i in 1..=k {
        if i < threshold {
            tau[i] = r / (i as f64 * k as f64);
        } else if i == threshold {
            tau[i] = (r * (r / delta).ln()) / k as f64;
        }
    }
    let mut beta = 0.0;
    for i in 1..=k {
        beta += rho[i] + tau[i];
    }
    let mut mu = vec![0.0; k + 1];
    if beta > 0.0 {
        for i in 1..=k {
            mu[i] = (rho[i] + tau[i]) / beta;
        }
    }
    mu
}

pub fn soliton_cdf(mu: &[f64]) -> Vec<f64> {
    let mut cdf = vec![0.0; mu.len()];
    let mut acc = 0.0;
    for i in 0..mu.len() {
        acc += mu[i];
        cdf[i] = acc;
    }
    cdf
}

/// Sample degree in 1..=k from CDF.
pub fn sample_degree_from_cdf(cdf: &[f64], u: f64, k: usize) -> usize {
    for i in 1..=k {
        if i < cdf.len() && u < cdf[i] {
            return i;
        }
    }
    k.max(1)
}

pub fn sample_degree_soliton(k: usize, seed: u32, c: f64, delta: f64) -> usize {
    let mu = robust_soliton(k, c, delta);
    let cdf = soliton_cdf(&mu);
    sample_degree_from_cdf(&cdf, seed_to_unit(seed), k)
}

/// Legacy Phase-1 heuristic (R2 hard-cut interop).
pub fn sample_degree_legacy(k: usize, seed: u32) -> usize {
    let x = seed_to_unit(seed);
    if x < 0.5 {
        1
    } else if x < 0.75 {
        2.min(k)
    } else if x < 0.9 {
        3.min(k)
    } else {
        (1 + (x * k as f64) as usize).min(k).max(1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn seed_unit_in_range() {
        for s in 0..64u32 {
            let u = seed_to_unit(s);
            assert!((0.0..1.0).contains(&u), "seed {s} u={u}");
        }
    }

    #[test]
    fn soliton_degree_bounds() {
        let k = 16;
        for seed in 0..64u32 {
            let d = sample_degree_soliton(k, seed, 0.1, 0.05);
            assert!(d >= 1 && d <= k, "d={d}");
        }
    }
}
