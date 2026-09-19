use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

declare_id!("TRVg0v3rnance11111111111111111111111111111"); // Placeholder – replace after `anchor keys list`

#[program]
pub mod trv_governance {
    use super::*;

    /// Initialize the global governance state (one-time).
    pub fn init_governance(ctx: Context<InitGovernance>) -> Result<()> {
        instructions::init_governance::handler(ctx)
    }

    /// Create a new governance proposal.
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
    ) -> Result<()> {
        instructions::create_proposal::handler(ctx, title, description)
    }

    /// Cast a yes/no vote on a proposal.
    pub fn cast_vote(ctx: Context<CastVote>, proposal_id: u64, support: bool) -> Result<()> {
        instructions::cast_vote::handler(ctx, proposal_id, support)
    }

    /// Submit an optical-air-gap or SIWS posture proof.
    pub fn submit_posture_proof(
        ctx: Context<SubmitPostureProof>,
        proof_hash: [u8; 32],
        signature: [u8; 64],
    ) -> Result<()> {
        instructions::submit_posture::handler(ctx, proof_hash, signature)
    }
}
