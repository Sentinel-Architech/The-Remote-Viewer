//! TRV Governance — Solana Anchor SCAFFOLD.
//! Not audited. Not mainnet. No production security claims.

use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

declare_id!("TRVgov11111111111111111111111111111111111");

#[program]
pub mod trv_governance {
    use super::*;

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

    pub fn transfer_authority(ctx: Context<TransferAuthority>, new_authority: Pubkey) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);
        require!(new_authority != Pubkey::default(), TrvError::InvalidAuthority);
        cfg.authority = new_authority;
        msg!("TRV authority transferred to {}", new_authority);
        Ok(())
    }

    pub fn set_proposal_threshold(ctx: Context<SetProposalThreshold>, threshold: u64) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);
        cfg.proposal_threshold = threshold;
        msg!("TRV proposal_threshold={}", threshold);
        Ok(())
    }

    pub fn set_vote_mint(ctx: Context<SetVoteMint>, mint: Pubkey) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);
        require!(mint != Pubkey::default(), TrvError::InvalidMint);
        cfg.vote_mint = mint;
        msg!("TRV vote_mint set {}", mint);
        Ok(())
    }

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

        msg!("TRV node registered {}", node.operator);
        Ok(())
    }

    pub fn deactivate_node(ctx: Context<DeactivateNode>) -> Result<()> {
        let node = &mut ctx.accounts.node;
        require!(node.active, TrvError::NodeInactive);
        node.active = false;
        msg!("TRV node deactivated {}", node.operator);
        Ok(())
    }

    pub fn grant_subscription(ctx: Context<GrantSubscription>, expires_at: i64) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);
        require!(expires_at > Clock::get()?.unix_timestamp, TrvError::SubscriptionExpired);

        let sub = &mut ctx.accounts.subscription;
        sub.owner = ctx.accounts.subscriber.key();
        sub.expires_at = expires_at;
        sub.bump = ctx.bumps.subscription;

        msg!("TRV subscription owner={} expires_at={}", sub.owner, expires_at);
        Ok(())
    }

    pub fn refresh_entitlement(ctx: Context<RefreshEntitlement>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let node_ok = ctx.accounts.node.active
            && ctx.accounts.node.operator == ctx.accounts.user.key();
        let sub_ok = ctx.accounts.subscription.owner == ctx.accounts.user.key()
            && ctx.accounts.subscription.expires_at > now;

        let ent = &mut ctx.accounts.entitlement;
        ent.user = ctx.accounts.user.key();
        ent.unlimited_comms = node_ok || sub_ok;
        ent.updated_at = now;
        ent.bump = ctx.bumps.entitlement;

        msg!(
            "TRV entitlement user={} unlimited={} node={} sub={}",
            ent.user,
            ent.unlimited_comms,
            node_ok,
            sub_ok
        );
        Ok(())
    }

    pub fn propose(ctx: Context<Propose>, description_hash: [u8; 32]) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);

        let prop = &mut ctx.accounts.proposal;
        prop.proposer = ctx.accounts.authority.key();
        prop.description_hash = description_hash;
        prop.yes_votes = 0;
        prop.executed = false;
        prop.cancelled = false;
        prop.bump = ctx.bumps.proposal;

        msg!("TRV proposal recorded");
        Ok(())
    }

    /// Authority cancels an open proposal (not yet executed).
    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);

        let prop = &mut ctx.accounts.proposal;
        require!(!prop.executed, TrvError::AlreadyExecuted);
        require!(!prop.cancelled, TrvError::AlreadyCancelled);

        prop.cancelled = true;
        msg!("TRV proposal cancelled");
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, weight: u64) -> Result<()> {
        cast_vote(
            &mut ctx.accounts.proposal,
            &mut ctx.accounts.vote_record,
            ctx.accounts.voter.key(),
            weight,
        )
    }

    pub fn vote_with_token(ctx: Context<VoteWithToken>) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require!(cfg.vote_mint != Pubkey::default(), TrvError::MintNotSet);

        let ta = &ctx.accounts.token_account;
        require_keys_eq!(ta.mint, cfg.vote_mint, TrvError::MintMismatch);
        require_keys_eq!(ta.owner, ctx.accounts.voter.key(), TrvError::TokenOwnerMismatch);

        cast_vote(
            &mut ctx.accounts.proposal,
            &mut ctx.accounts.vote_record,
            ctx.accounts.voter.key(),
            ta.amount,
        )
    }

    pub fn execute_if_threshold(ctx: Context<ExecuteIfThreshold>) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require_keys_eq!(ctx.accounts.authority.key(), cfg.authority, TrvError::Unauthorized);

        let prop = &mut ctx.accounts.proposal;
        require!(!prop.executed, TrvError::AlreadyExecuted);
        require!(!prop.cancelled, TrvError::AlreadyCancelled);
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
    require!(!prop.cancelled, TrvError::AlreadyCancelled);

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
    pub authority: Pubkey,
    pub proposal_threshold: u64,
    pub node_count: u64,
    pub vote_mint: Pubkey,
    pub bump: u8,
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,
    pub description_hash: [u8; 32],
    pub yes_votes: u64,
    pub executed: bool,
    pub cancelled: bool,
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

#[account]
pub struct Subscription {
    pub owner: Pubkey,
    pub expires_at: i64,
    pub bump: u8,
}

#[account]
pub struct Entitlement {
    pub user: Pubkey,
    pub unlimited_comms: bool,
    pub updated_at: i64,
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
pub struct TransferAuthority<'info> {
    #[account(mut, seeds = [b"trv-config"], bump = config.bump)]
    pub config: Account<'info, GovernanceConfig>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetProposalThreshold<'info> {
    #[account(mut, seeds = [b"trv-config"], bump = config.bump)]
    pub config: Account<'info, GovernanceConfig>,
    pub authority: Signer<'info>,
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
pub struct GrantSubscription<'info> {
    #[account(seeds = [b"trv-config"], bump = config.bump)]
    pub config: Account<'info, GovernanceConfig>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 32 + 8 + 1,
        seeds = [b"trv-sub", subscriber.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, Subscription>,
    /// CHECK: recorded owner; need not sign.
    pub subscriber: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefreshEntitlement<'info> {
    #[account(seeds = [b"trv-node", user.key().as_ref()], bump = node.bump)]
    pub node: Account<'info, Node>,
    #[account(seeds = [b"trv-sub", user.key().as_ref()], bump = subscription.bump)]
    pub subscription: Account<'info, Subscription>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 1 + 8 + 1,
        seeds = [b"trv-ent", user.key().as_ref()],
        bump
    )]
    pub entitlement: Account<'info, Entitlement>,
    #[account(mut)]
    pub user: Signer<'info>,
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
        space = 8 + 32 + 32 + 8 + 1 + 1 + 1,
        seeds = [b"trv-proposal", description_hash.as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
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
    #[msg("Already cancelled")]
    AlreadyCancelled,
    #[msg("Threshold not met")]
    ThresholdNotMet,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Vote mint not set")]
    MintNotSet,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Token mint mismatch")]
    MintMismatch,
    #[msg("Token account owner mismatch")]
    TokenOwnerMismatch,
    #[msg("Node already inactive")]
    NodeInactive,
    #[msg("Subscription expired or invalid expiry")]
    SubscriptionExpired,
}
