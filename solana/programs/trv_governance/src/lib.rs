//! TRV Governance — Solana Anchor SCAFFOLD.
//! Not audited. Not mainnet. No production security claims.

use anchor_lang::prelude::*;

declare_id!("TRVgov11111111111111111111111111111111111");

#[program]
pub mod trv_governance {
    use super::*;

    /// Initialize governance config PDA.
    pub fn initialize(ctx: Context<Initialize>, proposal_threshold: u64) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        cfg.authority = ctx.accounts.authority.key();
        cfg.proposal_threshold = proposal_threshold;
        cfg.node_count = 0;
        cfg.bump = ctx.bumps.config;
        msg!("TRV config init threshold={}", proposal_threshold);
        Ok(())
    }

    /// Register a permanent node operator (scaffold).
    /// Product later: active permanent node → unlimited free comms reward.
    pub fn register_node(ctx: Context<RegisterNode>) -> Result<()> {
        let node = &mut ctx.accounts.node;
        node.operator = ctx.accounts.operator.key();
        node.active = true;
        node.registered_at = Clock::get()?.unix_timestamp;
        node.bump = ctx.bumps.node;

        let cfg = &mut ctx.accounts.config;
        cfg.node_count = cfg
            .node_count
            .checked_add(1)
            .ok_or(TrvError::Overflow)?;

        msg!("TRV node registered operator={}", node.operator);
        Ok(())
    }

    /// Record a proposal. Scaffold: only config authority may propose.
    pub fn propose(ctx: Context<Propose>, description_hash: [u8; 32]) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);

        let prop = &mut ctx.accounts.proposal;
        prop.proposer = ctx.accounts.authority.key();
        prop.description_hash = description_hash;
        prop.yes_votes = 0;
        prop.executed = false;
        prop.bump = ctx.bumps.proposal;

        msg!("TRV proposal recorded");
        Ok(())
    }

    /// Open vote: any signer, once per proposal (VoteRecord PDA).
    /// Weight is caller-supplied scaffold; real design = SPL / stake snapshot.
    pub fn vote(ctx: Context<Vote>, weight: u64) -> Result<()> {
        require!(weight > 0, TrvError::ZeroWeight);

        let prop = &mut ctx.accounts.proposal;
        require!(!prop.executed, TrvError::AlreadyExecuted);

        let record = &mut ctx.accounts.vote_record;
        record.proposal = prop.key();
        record.voter = ctx.accounts.voter.key();
        record.weight = weight;
        record.bump = ctx.bumps.vote_record;

        prop.yes_votes = prop
            .yes_votes
            .checked_add(weight)
            .ok_or(TrvError::Overflow)?;

        msg!(
            "TRV vote voter={} weight={} total_yes={}",
            record.voter,
            weight,
            prop.yes_votes
        );
        Ok(())
    }

    /// Mark executed only if yes_votes >= proposal_threshold.
    /// Scaffold: authority only.
    pub fn execute_if_threshold(ctx: Context<ExecuteIfThreshold>) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);

        let prop = &mut ctx.accounts.proposal;
        require!(!prop.executed, TrvError::AlreadyExecuted);
        require!(
            prop.yes_votes >= cfg.proposal_threshold,
            TrvError::ThresholdNotMet
        );

        prop.executed = true;
        msg!("TRV proposal executed (scaffold flag only)");
        Ok(())
    }
}

#[account]
pub struct GovernanceConfig {
    pub authority: Pubkey,       // 32
    pub proposal_threshold: u64, // 8
    pub node_count: u64,         // 8
    pub bump: u8,                // 1
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,             // 32
    pub description_hash: [u8; 32],   // 32
    pub yes_votes: u64,               // 8
    pub executed: bool,               // 1
    pub bump: u8,                     // 1
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey, // 32
    pub voter: Pubkey,    // 32
    pub weight: u64,      // 8
    pub bump: u8,         // 1
}

#[account]
pub struct Node {
    pub operator: Pubkey,    // 32
    pub active: bool,        // 1
    pub registered_at: i64,  // 8
    pub bump: u8,            // 1
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 1,
        seeds = [b"trv-config"],
        bump
    )]
    pub config: Account<'info, GovernanceConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterNode<'info> {
    #[account(mut, seeds = [b"trv-config"], bump = config.bump)]
    pub config: Account<'info, GovernanceConfig>,
    #[account(
        init,
        payer = operator,
        space = 8 + 32 + 1 + 8 + 1,
        seeds = [b"trv-node", operator.key().as_ref()],
        bump
    )]
    pub node: Account<'info, Node>,
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(description_hash: [u8; 32])]
pub struct Propose<'info> {
    #[account(seeds = [b"trv-config"], bump = config.bump)]
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

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(seeds = [b"trv-config"], bump = config.bump)]
    pub config: Account<'info, GovernanceConfig>,
    #[account(
        mut,
        seeds = [b"trv-proposal", proposal.description_hash.as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    /// One vote per (proposal, voter). Re-init fails → no double vote.
    #[account(
        init,
        payer = voter,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = [b"trv-vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteIfThreshold<'info> {
    #[account(seeds = [b"trv-config"], bump = config.bump)]
    pub config: Account<'info, GovernanceConfig>,
    #[account(
        mut,
        seeds = [b"trv-proposal", proposal.description_hash.as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    pub authority: Signer<'info>,
}

#[error_code]
pub enum TrvError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Zero vote weight")]
    ZeroWeight,
    #[msg("Already executed")]
    AlreadyExecuted,
    #[msg("Threshold not met")]
    ThresholdNotMet,
    #[msg("Arithmetic overflow")]
    Overflow,
}
