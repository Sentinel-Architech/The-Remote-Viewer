//! Minimal FedAvg round using oxicuda-federated.
//! Later: replace the local client list with P2P-collected updates.

use oxicuda_federated::prelude::*;

const PARAM_DIM: usize = 4;

type ClientUpdate = (Vec<f32>, f32);

fn main() {
    let mut global = FedAvgState::new(PARAM_DIM);
    let initial = vec![0.0_f32; PARAM_DIM];
    global.set_params(&initial);

    // Simulated clients — replace with P2P collection later
    let clients: Vec<ClientUpdate> = vec![
        (vec![0.10, 0.20, 0.30, 0.40], 12.0),
        (vec![0.30, 0.20, 0.10, 0.00], 8.0),
        (vec![0.15, 0.25, 0.35, 0.45], 20.0),
    ];

    let new_global = fedavg_round(&mut global, &clients);

    println!("New global params: {:?}", new_global);
    for (i, _) in clients.iter().enumerate() {
        println!("→ would send global model to client {}", i);
    }
}

fn fedavg_round(state: &mut FedAvgState, updates: &[ClientUpdate]) -> Vec<f32> {
    state.aggregate(updates);
    state.params().to_vec()
}
