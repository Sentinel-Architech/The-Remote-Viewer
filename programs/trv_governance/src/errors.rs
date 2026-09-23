use anchor_lang::prelude::*;

#[error_code]
pub enum TrvError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid proof signature")]
    InvalidProofSignature,
    #[msg("Proposal not found")]
    ProposalNotFound,
    #[msg("Already voted")]
    AlreadyVoted,
}
