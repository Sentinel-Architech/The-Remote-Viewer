use anchor_lang::prelude::*;
use crate::state::Proposal;
use crate::errors::TrvError;

#[derive(Accounts)]
pub struct CastVote<'info> {
    pub voter: Signer<'info>,

    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

pub fn handler(ctx: Context<CastVote>, _proposal_id: u64, support: bool) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;

    // TODO: track individual votes to prevent double-voting
    if support {
        proposal.yes_votes = proposal.yes_votes.checked_add(1).ok_or(TrvError::Unauthorized)?;
    } else {
        proposal.no_votes = proposal.no_votes.checked_add(1).ok_or(TrvError::Unauthorized)?;
    }

    Ok(())
}
