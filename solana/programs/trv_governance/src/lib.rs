//! TRV Governance — Solana Anchor SCAFFOLD.
//! Not audited. Not mainnet. Placeholder accounts + init only.

use anchor_lang::prelude::*;

declare_id!("TRVgov11111111111111111111111111111111111");

#[program]
pub mod trv_governance {
    use super::*;

    /// Initialize governance config PDA (threshold in raw token units).
    pub fn initialize(ctx: Context<Initialize>, proposal_threshold: u64) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        cfg.authority = ctx.accounts.authority.key();
        cfg.proposal_threshold = proposal_threshold;
        cfg.bump = ctx.bumps.config;
        msg!("TRV governance config initialized");
        Ok(())
    }

    /// Scaffold: record a proposal hash (no execution engine yet).
    pub fn propose(ctx: Context<Propose>, description_hash: [u8; 32]) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority);

        let prop = &mut ctx.accounts.proposal;
        prop.proposer = ctx.accounts.authority.key();
        prop.description_hash = description_hash;
        prop.yes_votes = 0;
        prop.executed = false;
        prop.bump = ctx.bumps.proposal;

        msg!("TRV proposal recorded (scaffold)");
        Ok(())
    }
}

#[account]
pub struct GovernanceConfig {
    pub authority: Pubkey,
    pub proposal_threshold: u64,
    pub bump: u8,
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,
    pub description_hash: [u8; 32],
    pub yes_votes: u64,
    pub executed: bool,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 1,
        seeds = [b"trv-config"],
        bump
    )]
    pub config: Account<'info, GovernanceConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(description_hash: [u8; 32])]
pub struct Propose<'info> {
    #[account(
        seeds = [b"trv-config"],
        bump = config.bump
    )]
    pub config: Account<'info, GovernanceConfig>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 1 + 1,
        seeds = [b"trv-proposal", description_hash.as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
