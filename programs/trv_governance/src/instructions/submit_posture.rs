use anchor_lang::prelude::*;
use crate::state::PostureRecord;
use crate::errors::TrvError;

#[derive(Accounts)]
pub struct SubmitPostureProof<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + PostureRecord::INIT_SPACE,
        seeds = [b"posture", user.key().as_ref()],
        bump
    )]
    pub posture_record: Account<'info, PostureRecord>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SubmitPostureProof>,
    proof_hash: [u8; 32],
    _signature: [u8; 64],
) -> Result<()> {
    // TODO: verify Ed25519 / SIWS signature against proof_hash
    // For now we accept the proof and record it.

    let record = &mut ctx.accounts.posture_record;
    record.user = ctx.accounts.user.key();
    record.proof_hash = proof_hash;
    record.submitted_at = Clock::get()?.unix_timestamp;
    record.bump = ctx.bumps.posture_record;

    Ok(())
}
