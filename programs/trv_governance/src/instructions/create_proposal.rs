use anchor_lang::prelude::*;
use crate::state::{GovernanceState, Proposal};

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"governance"],
        bump = governance.bump
    )]
    pub governance: Account<'info, GovernanceState>,

    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", governance.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateProposal>, title: String, description: String) -> Result<()> {
    let governance = &mut ctx.accounts.governance;
    let proposal = &mut ctx.accounts.proposal;

    proposal.id = governance.proposal_count;
    proposal.proposer = ctx.accounts.proposer.key();
    proposal.title = title;
    proposal.description = description;
    proposal.yes_votes = 0;
    proposal.no_votes = 0;
    proposal.created_at = Clock::get()?.unix_timestamp;
    proposal.bump = ctx.bumps.proposal;

    governance.proposal_count = governance.proposal_count.checked_add(1).unwrap();

    Ok(())
}
