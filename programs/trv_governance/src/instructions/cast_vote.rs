use anchor_lang::prelude::*;
use crate::state::{Proposal, VoteRecord};
use crate::errors::TrvError;

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(mut)]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CastVote>, proposal_id: u64, support: bool) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    require!(proposal.id == proposal_id, TrvError::ProposalNotFound);

    let record = &mut ctx.accounts.vote_record;
    record.proposal = proposal.key();
    record.voter = ctx.accounts.voter.key();
    record.support = support;
    record.bump = ctx.bumps.vote_record;

    if support {
        proposal.yes_votes = proposal.yes_votes.checked_add(1).ok_or(TrvError::Overflow)?;
    } else {
        proposal.no_votes = proposal.no_votes.checked_add(1).ok_or(TrvError::Overflow)?;
    }

    Ok(())
}
