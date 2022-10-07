

use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("3WaqHiT6QrbDCEDN3sxwSFRMnTcU6fTx2G16yaysKBBj");

#[program]
pub mod data_share {
    use super::*;
    
    pub fn send_file(ctx: Context<SendFile>, nrows: u32, ncols: u32, hash : String ) -> Result<()> {
        let file: &mut Account<File> = &mut ctx.accounts.file;
        let author: &Signer = &ctx.accounts.author;
        
        file.author = *author.key;
        file.nrows=nrows;
        file.ncols=ncols;
        file.hash = hash;
        Ok(())
    }
    
}

#[derive(Accounts)]
pub struct SendFile<'info> {   
    #[account(init, payer = author, space = File::LEN)]
    pub file: Account<'info, File>,
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(address = system_program::ID)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: AccountInfo<'info>,
}


#[account]
pub struct File {
    pub author: Pubkey,
    pub nrows: u32,
    pub ncols: u32,
    pub hash : String,
}


const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const ROW_LENGTH: usize = 32;
const COL_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const HASH_LENGTH: usize = 300; 


impl File {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + ROW_LENGTH
        + COL_LENGTH
        + STRING_LENGTH_PREFIX + HASH_LENGTH ; // Content.
}

#[error_code]
pub enum ErrorCode {
    #[msg("Owner can't buy his own data.")]
    OwnerCantBuy,
}