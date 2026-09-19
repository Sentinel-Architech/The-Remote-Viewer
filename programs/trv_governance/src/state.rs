use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GovernanceState {
    pub authority: Pubkey,
    pub proposal_count: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Pubkey,
    #[max_len(64)]
    pub title: String,
    #[max_len(256)]
    pub description: String,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct PostureRecord {
    pub user: Pubkey,
    pub proof_hash: [u8; 32],
    pub submitted_at: i64,
    pub bump: u8,
}
