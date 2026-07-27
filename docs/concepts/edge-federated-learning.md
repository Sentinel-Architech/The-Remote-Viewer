# Edge Federated Learning — Minimal FedAvg Example

Toy round using [`oxicuda-federated`](https://crates.io/crates/oxicuda-federated).
Designed so the local client list can later be replaced by your P2P / libp2p transport.

## Dependencies

```toml
[dependencies]
oxicuda-federated = "0.5"
```

(Check crates.io for the latest 0.5.x / 0.x version.)

## Core idea

1. Each **client** trains locally and produces a parameter vector + weight.
2. A **server** (or any designated aggregator node) runs FedAvg over the updates.
3. The new global parameters are broadcast back to clients.

No raw data ever leaves the client — only the update vector.

## Minimal example

```rust
use oxicuda_federated::prelude::*;

/// Dimension of the model parameters (toy: 4 weights).
const PARAM_DIM: usize = 4;

/// One client's contribution: (parameters, sample_weight).
type ClientUpdate = (Vec<f32>, f32);

fn main() {
    // --- 1. Global state (held by aggregator / coordinator node) ---
    let mut global = FedAvgState::new(PARAM_DIM);

    // Optional: seed with an initial model
    let initial = vec![0.0_f32; PARAM_DIM];
    global.set_params(&initial);

    // --- 2. Simulate local clients (later: receive over P2P) ---
    // In production these come from encrypted peer messages.
    let clients: Vec<ClientUpdate> = vec![
        // Client A — trained on its local data
        (vec![0.10, 0.20, 0.30, 0.40], 12.0), // 12 local samples
        // Client B
        (vec![0.30, 0.20, 0.10, 0.00], 8.0),
        // Client C
        (vec![0.15, 0.25, 0.35, 0.45], 20.0),
    ];

    // --- 3. Aggregate (FedAvg) ---
    let new_global = fedavg_round(&mut global, &clients);

    println!("New global params: {:?}", new_global);

    // --- 4. Broadcast new_global back to clients (later: P2P publish) ---
    // For now just print.
    for (i, _) in clients.iter().enumerate() {
        println!("→ would send global model to client {}", i);
    }
}

/// One FedAvg round.
///
/// `state` is mutated in place; also returns the new parameter vector
/// for easy broadcasting.
fn fedavg_round(state: &mut FedAvgState, updates: &[ClientUpdate]) -> Vec<f32> {
    // oxicuda-federated expects a slice of (params, weight)
    state.aggregate(updates);

    // Pull the averaged parameters out for transport
    state.params().to_vec()
}
```

## Wiring to your P2P layer later

Replace the hard-coded `clients` vector with something like:

```rust
async fn collect_updates_from_peers(
    swarm: &mut Swarm<SentinelBehaviour>,
    timeout: Duration,
) -> Vec<ClientUpdate> {
    // 1. Announce "FL round N — send your delta"
    // 2. Wait for encrypted peer messages containing (Vec<f32>, f32)
    // 3. Authenticate / verify signatures (Ed25519 or ML-DSA)
    // 4. Return the collected updates
    todo!()
}

async fn broadcast_global(
    swarm: &mut Swarm<SentinelBehaviour>,
    params: &[f32],
) {
    // Publish the new global model over gossipsub / request-response
    todo!()
}
```

Then the round becomes:

```rust
let updates = collect_updates_from_peers(&mut swarm, Duration::from_secs(30)).await;
let new_global = fedavg_round(&mut global, &updates);
broadcast_global(&mut swarm, &new_global).await;
```

## Optional hardening (next steps)

| Concern | Approach |
|--------|----------|
| Malicious clients | Use `qora-fl` trimmed-mean / Krum instead of plain FedAvg |
| Privacy of updates | Apply DP noise before upload (oxicuda-federated has RDP accountants) |
| Integrity | Sign each update with the peer's sovereign identity key |
| Bandwidth | Enable the crate's communication compression |
| TEE aggregation | Evaluate `smp-tee-runtime` for the aggregator side |

## Notes for Sentinel / TRV

- Keep the **aggregator role** optional and rotatable (any trusted peer can run a round).
- Prefer aggregating **LoRA / adapter deltas** or small heads rather than full model weights.
- Never send raw user data — only the update vector (and ideally a DP-noised one).
- Pair with your existing zero-trust / E2E channel so the FL control plane inherits the same guarantees as the rest of the protocol.
