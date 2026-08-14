//! TRV Governance — Solana Anchor SCAFFOLD.
//! Not audited. Not mainnet. No production security claims.

use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

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
        cfg.vote_mint = Pubkey::default();
        cfg.bump = ctx.bumps.config;
        msg!("TRV config init threshold={}", proposal_threshold);
        Ok(())
    }

    /// Authority sets SPL mint used for vote weight (scaffold).
    pub fn set_vote_mint(ctx: Context<SetVoteMint>, mint: Pubkey) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);
        require!(mint != Pubkey::default(), TrvError::InvalidMint);
        cfg.vote_mint = mint;
        msg!("TRV vote_mint set {}", mint);
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

    /// Deactivate own node registration (scaffold).
    pub fn deactivate_node(ctx: Context<DeactivateNode>) -> Result<()> {
        let node = &mut ctx.accounts.node;
        require!(node.active, TrvError::NodeInactive);
        node.active = false;
        msg!("TRV node deactivated {}", node.operator);
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

    /// Manual weight vote (scaffold / tests). Prefer vote_with_token when mint is set.
    pub fn vote(ctx: Context<Vote>, weight: u64) -> Result<()> {
        cast_vote(
            &mut ctx.accounts.proposal,
            &mut ctx.accounts.vote_record,
            ctx.accounts.voter.key(),
            weight,
        )
    }

    /// Vote weight = SPL token account amount (must match config.vote_mint, owner = voter).
    pub fn vote_with_token(ctx: Context<VoteWithToken>) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require!(cfg.vote_mint != Pubkey::default(), TrvError::MintNotSet);

        let ta = &ctx.accounts.token_account;
        require_keys_eq!(ta.mint, cfg.vote_mint, TrvError::MintMismatch);
        require_keys_eq!(ta.owner, ctx.accounts.voter.key(), TrvError::TokenOwnerMismatch);

        let weight = ta.amount;
        cast_vote(
            &mut ctx.accounts.proposal,
            &mut ctx.accounts.vote_record,
            ctx.accounts.voter.key(),
            weight,
        )
    }

    /// Mark executed only if yes_votes >= proposal_threshold. Scaffold: authority only.
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

fn cast_vote<'info>(
    prop: &mut Account<'info, Proposal>,
    record: &mut Account<'info, VoteRecord>,
    voter: Pubkey,
    weight: u64,
) -> Result<()> {
    require!(weight > 0, TrvError::ZeroWeight);
    require!(!prop.executed, TrvError::AlreadyExecuted);

    record.proposal = prop.key();
    record.voter = voter;
    record.weight = weight;

    prop.yes_votes = prop
        .yes_votes
        .checked_add(weight)
        .ok_or(TrvError::Overflow)?;

    msg!("TRV vote voter={} weight={} total_yes={}", voter, weight, prop.yes_votes);
    Ok(())
}

#[account]
pub struct GovernanceConfig {
    pub authority: Pubkey,       // 32
    pub proposal_threshold: u64, // 8
    pub node_count: u64,         // 8
    pub vote_mint: Pubkey,       // 32
    pub bump: u8,                // 1
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,
    pub description_hash: [u8; 32],
    pub yes_votes: u64,
    pub executed: bool,
    pub bump: u8,
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub weight: u64,
    pub bump: u8,
}

#[account]
pub struct Node {
    pub operator: Pubkey,
    pub active: bool,
    pub registered_at: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 32 + 1,
        seeds = [b"trv-config"],
        bump
    )]
    pub config: Account<'info, GovernanceConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetVoteMint<'info> {
    #[account(mut, seeds = [b"trv-config"], bump = config.bump)]
    pub config: Account<'info, GovernanceConfig>,
    pub authority: Signer<'info>,
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
pub struct DeactivateNode<'info> {
    #[account(
        mut,
        seeds = [b"trv-node", operator.key().as_ref()],
        bump = node.bump,
        has_one = operator @ TrvError::Unauthorized
    )]
    pub node: Account<'info, Node>,
    pub operator: Signer<'info>,
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
pub struct VoteWithToken<'info> {
    #[account(seeds = [b"trv-config"], bump = config.bump)]
    pub config: Account<'info, GovernanceConfig>,
    #[account(
        mut,
        seeds = [b"trv-proposal", proposal.description_hash.as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        init,
        payer = voter,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = [b"trv-vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    /// Voter's ATA (or any token account they own) for config.vote_mint.
    pub token_account: Account<'info, TokenAccount>,
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
    #[msg("Vote mint not set")]
    MintNotSet,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Token mint mismatch")]
    MintMismatch,
    #[msg("Token account owner mismatch")]
    TokenOwnerMismatch,
    #[msg("Node already inactive")]
    NodeInactive,
}
