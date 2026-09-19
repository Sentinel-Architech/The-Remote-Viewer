use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

declare_id!("TRVg0v3rnance11111111111111111111111111111"); // Placeholder – replace after keygen

#[program]
pub mod trv_governance {
    use super::*;

    pub fn create_proposal(ctx: Context<CreateProposal>, title: String, description: String) -> Result<()> {
        instructions::create_proposal::handler(ctx, title, description)
    }

    pub fn cast_vote(ctx: Context<CastVote>, proposal_id: u64, support: bool) -> Result<()> {
        instructions::cast_vote::handler(ctx, proposal_id, support)
    }

    pub fn submit_posture_proof(
        ctx: Context<SubmitPostureProof>,
        proof_hash: [u8; 32],
        signature: [u8; 64],
    ) -> Result<()> {
        instructions::submit_posture::handler(ctx, proof_hash, signature)
    }
}
