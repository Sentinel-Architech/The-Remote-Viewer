use anchor_lang::prelude::*;
use crate::state::GovernanceState;

#[derive(Accounts)]
pub struct InitGovernance<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + GovernanceState::INIT_SPACE,
        seeds = [b"governance"],
        bump
    )]
    pub governance: Account<'info, GovernanceState>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitGovernance>) -> Result<()> {
    let governance = &mut ctx.accounts.governance;
    governance.authority = ctx.accounts.authority.key();
    governance.proposal_count = 0;
    governance.bump = ctx.bumps.governance;
    Ok(())
}
