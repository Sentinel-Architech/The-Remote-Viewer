# Reversible Data Hiding — Histogram Shifting (First Implementation)

Start here. Lowest complexity, pure integer arithmetic, perfect reversibility.

## Algorithm (Ni et al. style)
1. Compute histogram of the cover (grayscale or single channel).
2. Locate peak bin `p` and a zero (or minimum) bin `z`.
3. Shift all bins between `p` and `z` by one to free the bin next to the peak.
4. Embed secret bits at the peak: leave value = `p` for bit 0, move to freed bin for bit 1.
5. Extraction reverses the process exactly → original cover + secret recovered.

## Why first
- Runs on tablet / Acer / Termux without heavy dependencies.
- Perfect inverse required by the "reverse distortion" design.
- Capacity is modest but sufficient for keys, short messages, and identity claims.

Later upgrades: Difference Expansion, Prediction-Error Expansion, content-adaptive variants.
