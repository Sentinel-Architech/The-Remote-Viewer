# LT interop golden vectors

## `golden-degrees-k8.json`

Once filled, `degrees[seed]` is the Soliton degree for `k=8`, `c=0.1`, `delta=0.05`, seeds `0..31`.

Both TypeScript (`lt-core` + `robust-soliton`) and Rust (`fountain::soliton`) must produce the same list.

### Fill procedure

```bash
# Node one-liner style (from optical-airgap after wiring):
# print sampleDegreeFromCdf(solitonCdf(robustSoliton({k:8})), seedToUnit(s), 8) for s=0..31
```

Or in Rust tests temporarily `println!` the degree vector and paste into JSON.

### R2 risk

If TS and Rust diverge, freeze the golden file and fix the buggy side — do not silently change both.
