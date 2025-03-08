use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("7EZ46vkJMH8X49ZhSKhCfjfdNCJhGJGGBFzUUEae9Ygi");

#[program]
pub mod bruh {
    use super::*;

    pub fn authorize_transfer(ctx: Context<AuthorizeTransfer>, amount: u64) -> Result<()> {
        let config = &ctx.accounts.config;
        let project_wallet = &ctx.accounts.project_wallet;

        require_keys_eq!(
            config.project_wallet,
            project_wallet.key(),
            ErrorCode::Unauthorized
        );

        let cpi_accounts = anchor_spl::token::Approve {
            to: ctx.accounts.project_token_account.to_account_info(),
            delegate: ctx.accounts.authorizer.to_account_info(),
            authority: ctx.accounts.project_wallet.to_account_info(),
        };

        let cpi_context =
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::approve(cpi_context, amount)?;

        Ok(())
    }

    pub fn initialize(
        ctx: Context<Initialize>,
        admin: Pubkey,
        payment: u64,
        max_purchases: u8,
        project_wallet: Pubkey,
        default_referrer: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;

        config.admin = admin;
        config.payment = payment;
        config.max_purchases_per_user = max_purchases;
        config.project_wallet = project_wallet;

        let default_referrer_account = &mut ctx.accounts.default_referrer_account;
        default_referrer_account.user = default_referrer;
        default_referrer_account.is_bound = false;
        default_referrer_account.purchase_count = 0;

        emit!(UpdateConfigEvent {
            admin,
            payment,
            max_purchases,
        });

        Ok(())
    }

    pub fn bind_referrer(ctx: Context<BindReferrer>, referrer: Pubkey) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        require!(!user_account.is_bound, ErrorCode::AlreadyBound);
        require!(
            referrer != ctx.accounts.user.key(),
            ErrorCode::CannotBindSelf
        );

        if user_account.user == Pubkey::default() {
            user_account.bump = ctx.bumps.user_account;
        }

        // let referrer_account = &mut ctx.accounts.referrer_account;
        // require!(referrer_account.purchase_count > 0, ErrorCode::NotPurchase);

        user_account.user = ctx.accounts.user.key();
        user_account.referrer = referrer;
        user_account.is_bound = true;

        emit!(BindReferrerEvent {
            user: ctx.accounts.user.key(),
            referrer,
        });
        Ok(())
    }

    pub fn private_sale(ctx: Context<PrivateSale>, total_amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let config = &ctx.accounts.config;

        require!(
            user_account.purchase_count < config.max_purchases_per_user,
            ErrorCode::MaxPurchaseReached
        );
        require_keys_eq!(
            ctx.accounts.project_wallet.key(),
            config.project_wallet,
            ErrorCode::Unauthorized
        );
        require!(total_amount == config.payment, ErrorCode::NotMatchPayment);

        let level_rewards = [4, 3, 3];

        let mut remaining_amount = total_amount;

        let referrer_accounts = [
            &ctx.accounts.referrer_1,
            &ctx.accounts.referrer_2,
            &ctx.accounts.referrer_3,
        ];

        for (level, reward_percent) in level_rewards.iter().enumerate() {
            if referrer_accounts[level].key() == Pubkey::default() {
                break;
            }

            let reward = total_amount * reward_percent / 100;

            transfer_sol(
                &ctx.accounts.user.to_account_info(),
                &referrer_accounts[level].to_account_info(),
                &ctx.accounts.system_program.to_account_info(),
                reward,
            )?;

            remaining_amount = remaining_amount.saturating_sub(reward);
        }

        transfer_sol(
            &ctx.accounts.user.to_account_info(),
            &ctx.accounts.project_wallet.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
            remaining_amount,
        )?;

    let (authority_pda, bump) = Pubkey::find_program_address(&[b"authority"], ctx.program_id);
    let seeds = &[b"authority", &[bump][..]];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.project_token_account.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.authorizer.to_account_info(),
    };

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );

    token::transfer(cpi_context, 3000)?;

        user_account.purchase_count += 1;

        emit!(PrivateSaleEvent {
            user: ctx.accounts.user.key(),
            amount: 3000,
        });

        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        payment: u64,
        max_purchases: u8,
        project_wallet: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        require_keys_eq!(
            config.admin,
            ctx.accounts.admin.key(),
            ErrorCode::Unauthorized
        );

        config.payment = payment;
        config.max_purchases_per_user = max_purchases;
        config.project_wallet = project_wallet;

        emit!(UpdateConfigEvent {
            admin: ctx.accounts.admin.key(),
            payment,
            max_purchases,
        });

        Ok(())
    }

    pub fn get_referrer(ctx: Context<GetReferrer>) -> Result<Pubkey> {
        let user_account = &ctx.accounts.user_account;
        Ok(user_account.referrer)
    }

    pub fn get_config(ctx: Context<GetConfig>) -> Result<Config> {
        Ok(*ctx.accounts.config)
    }
}

fn transfer_sol<'info>(
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let ix = anchor_lang::solana_program::system_instruction::transfer(from.key, to.key, amount);

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[from.clone(), to.clone(), system_program.clone()],
    ).map_err(Into::into)
}

#[derive(Accounts)]
pub struct AuthorizeTransfer<'info> {
    #[account(mut)]
    pub project_wallet: Signer<'info>,

    #[account(mut)]
    pub project_token_account: Account<'info, TokenAccount>,

    #[account(mut,seeds = [b"authority"],bump)]
    pub authorizer: AccountInfo<'info>,

    #[account()]
    pub config: Account<'info, Config>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub default_referrer: SystemAccount<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + std::mem::size_of::<Config>(),
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = admin,
        space = 8 + std::mem::size_of::<UserAccount>(),
        seeds = [b"bruh", default_referrer.key().as_ref()],
        bump
    )]
    pub default_referrer_account: Account<'info, UserAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default, Copy)]
pub struct Config {
    pub admin: Pubkey,
    pub payment: u64,
    pub max_purchases_per_user: u8,
    pub project_wallet: Pubkey,
}

#[account]
#[derive(Default)]
pub struct UserAccount {
    pub user: Pubkey,
    pub referrer: Pubkey,
    pub is_bound: bool,
    pub purchase_count: u8,
    pub bump: u8,
}

#[event]
pub struct PrivateSaleEvent {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct BindReferrerEvent {
    pub user: Pubkey,
    pub referrer: Pubkey,
}

#[event]
pub struct UpdateConfigEvent {
    pub admin: Pubkey,
    pub payment: u64,
    pub max_purchases: u8,
}

#[derive(Accounts)]
pub struct BindReferrer<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(init_if_needed, payer = user, space = 8 + 32 + 32 + 1 + 1 + 1, seeds = [b"bruh", user.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub referrer_account: Account<'info, UserAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PrivateSale<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, has_one = user, seeds = [b"bruh", user.key().as_ref()], bump = user_account.bump )]
    pub user_account: Account<'info, UserAccount>,

    #[account()]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub project_wallet: Signer<'info>,

    #[account(mut)]
    pub referrer_1: SystemAccount<'info>,
    #[account(mut)]
    pub referrer_2: SystemAccount<'info>,
    #[account(mut)]
    pub referrer_3: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"authority"], // 固定种子
        bump                    // 自动获取 bump 值
    )]
    pub authorizer: AccountInfo<'info>, // 改为 PDA

    #[account(mut, associated_token::mint = project_token_account.mint, associated_token::authority = user)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut, associated_token::mint = project_token_account.mint,associated_token::authority = project_wallet)]
    pub project_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    pub admin: Signer<'info>,
    #[account(mut, has_one = admin)]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
pub struct GetReferrer<'info> {
    #[account()]
    pub user_account: Account<'info, UserAccount>,
}

#[derive(Accounts)]
pub struct GetConfig<'info> {
    #[account()]
    pub config: Account<'info, Config>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("User already bound to a referrer.")]
    AlreadyBound,
    #[msg("User has not bound to a referrer.")]
    NotBound,
    #[msg("User reached max purchase limit.")]
    MaxPurchaseReached,
    #[msg("Unauthorized access.")]
    Unauthorized,
    #[msg("User has not purchase.")]
    NotPurchase,
    #[msg("Payment amount does not match.")]
    NotMatchPayment,
    #[msg("User cannot bind to themselves.")]
    CannotBindSelf,
}
