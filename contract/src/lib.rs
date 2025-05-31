#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, Vec, Map, String, BytesN,
};


#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccessKey {
    pub id: u64,
    pub owner: Address,
    pub content_id: String,
    pub expires_at: u64,
    pub is_active: bool,
    pub transferable: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContentMetadata {
    pub title: String,
    pub description: String,
    pub creator: Address,
    pub price: i128,
    pub max_keys: u32,
}

#[contracttype]
pub enum DataKey {
    AccessKey(u64),
    UserKeys(Address),
    ContentMeta(String),
    KeyCounter,
    FrozenAccount(Address),
    Balance(Address),
}

// Events
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct KeyMintedEvent {
    pub key_id: u64,
    pub owner: Address,
    pub content_id: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct KeyTransferredEvent {
    pub key_id: u64,
    pub from: Address,
    pub to: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountFrozenEvent {
    pub account: Address,
    pub frozen: bool,
}

const KEY_COUNTER: Symbol = symbol_short!("KEYCNT");

#[contract]
pub struct DigitalAccessKeysContract;

#[contractimpl]
impl DigitalAccessKeysContract {
    
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("ADMIN"), &admin);
        env.storage().instance().set(&KEY_COUNTER, &0u64);
    }

    /// Mint a new access key for digital content
    pub fn mint(
        env: Env,
        to: Address,
        content_id: String,
        expires_at: u64,
        transferable: bool,
    ) -> u64 {
        // Require authentication
        to.require_auth();
        
        // Check if account is frozen
        Self::require_not_frozen(&env, &to);
        
        // Get next key ID
        let key_id = Self::get_next_key_id(&env);
        
        // Create the access key
        let access_key = AccessKey {
            id: key_id,
            owner: to.clone(),
            content_id: content_id.clone(),
            expires_at,
            is_active: true,
            transferable,
        };
        
        // Store the access key
        env.storage().persistent().set(&DataKey::AccessKey(key_id), &access_key);
        
        // Update user's key list
        Self::add_key_to_user(&env, &to, key_id);
        
        // Update balance
        Self::increment_balance(&env, &to);
        
        // Emit event
        env.events().publish(
            (symbol_short!("mint"), &to),
            KeyMintedEvent {
                key_id,
                owner: to.clone(),
                content_id,
            }
        );
        
        key_id
    }

    /// Transfer an access key to another address
    pub fn transfer(env: Env, key_id: u64, to: Address) {
        // Get the access key
        let mut key: AccessKey = env.storage()
            .persistent()
            .get(&DataKey::AccessKey(key_id))
            .unwrap_or_else(|| panic!("Access key not found"));
        
        // Require owner authentication
        key.owner.require_auth();
        
        // Check if key is transferable
        if !key.transferable {
            panic!("This access key is not transferable");
        }
        
        // Check if key is active and not expired
        if !key.is_active {
            panic!("Access key is not active");
        }
        
        let current_time = env.ledger().timestamp();
        if current_time > key.expires_at {
            panic!("Access key has expired");
        }
        
        // Check if both accounts are not frozen
        Self::require_not_frozen(&env, &key.owner);
        Self::require_not_frozen(&env, &to);
        
        let from = key.owner.clone();
        
        // Remove key from previous owner
        Self::remove_key_from_user(&env, &from, key_id);
        Self::decrement_balance(&env, &from);
        
        // Add key to new owner
        Self::add_key_to_user(&env, &to, key_id);
        Self::increment_balance(&env, &to);
        
        // Update key owner
        key.owner = to.clone();
        env.storage().persistent().set(&DataKey::AccessKey(key_id), &key);
        
        // Emit event
        env.events().publish(
            (symbol_short!("transfer"), &from, &to),
            KeyTransferredEvent {
                key_id,
                from: from.clone(),
                to: to.clone(),
            }
        );
    }

    /// Get the balance of access keys for an address
    pub fn balance(env: Env, address: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(address))
            .unwrap_or(0)
    }

    /// Freeze or unfreeze an account
    pub fn freeze_account(env: Env, account: Address, freeze: bool) {
        let admin: Address = env.storage()
            .instance()
            .get(&symbol_short!("ADMIN"))
            .unwrap_or_else(|| panic!("Admin not set"));
        
        admin.require_auth();
        
        if freeze {
            env.storage().persistent().set(&DataKey::FrozenAccount(account.clone()), &true);
        } else {
            env.storage().persistent().remove(&DataKey::FrozenAccount(account.clone()));
        }
        
        // Emit event
        env.events().publish(
            (symbol_short!("freeze"), &account),
            AccountFrozenEvent {
                account: account.clone(),
                frozen: freeze,
            }
        );
    }

    /// Check if an account is frozen
    pub fn is_frozen(env: Env, account: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::FrozenAccount(account))
            .unwrap_or(false)
    }

    /// Get access key details
    pub fn get_key(env: Env, key_id: u64) -> Option<AccessKey> {
        env.storage()
            .persistent()
            .get(&DataKey::AccessKey(key_id))
    }

    /// Get all keys owned by an address
    pub fn get_user_keys(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserKeys(user))
            .unwrap_or(Vec::new(&env))
    }

    /// Check if a key is valid and active
    pub fn is_key_valid(env: Env, key_id: u64) -> bool {
        if let Some(key) = Self::get_key(env.clone(), key_id) {
            let current_time = env.ledger().timestamp();
            key.is_active && current_time <= key.expires_at
        } else {
            false
        }
    }

    /// Deactivate an expired key (can be called by anyone)
    pub fn deactivate_expired_key(env: Env, key_id: u64) {
        let mut key: AccessKey = env.storage()
            .persistent()
            .get(&DataKey::AccessKey(key_id))
            .unwrap_or_else(|| panic!("Access key not found"));
        
        let current_time = env.ledger().timestamp();
        
        if current_time > key.expires_at && key.is_active {
            key.is_active = false;
            env.storage().persistent().set(&DataKey::AccessKey(key_id), &key);
            
            // Decrease user balance
            Self::decrement_balance(&env, &key.owner);
        }
    }

    /// Set content metadata
    pub fn set_content_metadata(
        env: Env,
        content_id: String,
        title: String,
        description: String,
        creator: Address,
        price: i128,
        max_keys: u32,
    ) {
        creator.require_auth();
        
        let metadata = ContentMetadata {
            title,
            description,
            creator,
            price,
            max_keys,
        };
        
        env.storage().persistent().set(&DataKey::ContentMeta(content_id), &metadata);
    }

    /// Get content metadata
    pub fn get_content_metadata(env: Env, content_id: String) -> Option<ContentMetadata> {
        env.storage()
            .persistent()
            .get(&DataKey::ContentMeta(content_id))
    }

    // Internal helper functions
    fn get_next_key_id(env: &Env) -> u64 {
        let current_id: u64 = env.storage()
            .instance()
            .get(&KEY_COUNTER)
            .unwrap_or(0);
        
        let next_id = current_id + 1;
        env.storage().instance().set(&KEY_COUNTER, &next_id);
        next_id
    }

    fn add_key_to_user(env: &Env, user: &Address, key_id: u64) {
        let mut user_keys: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserKeys(user.clone()))
            .unwrap_or(Vec::new(env));
        
        user_keys.push_back(key_id);
        env.storage().persistent().set(&DataKey::UserKeys(user.clone()), &user_keys);
    }

    fn remove_key_from_user(env: &Env, user: &Address, key_id: u64) {
        let mut user_keys: Vec<u64> = env.storage()
            .persistent()
            .get(&DataKey::UserKeys(user.clone()))
            .unwrap_or(Vec::new(env));
        
        // Find and remove the key
        let mut new_keys = Vec::new(env);
        for i in 0..user_keys.len() {
            if user_keys.get(i).unwrap() != key_id {
                new_keys.push_back(user_keys.get(i).unwrap());
            }
        }
        
        env.storage().persistent().set(&DataKey::UserKeys(user.clone()), &new_keys);
    }

    fn increment_balance(env: &Env, address: &Address) {
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&DataKey::Balance(address.clone()))
            .unwrap_or(0);
        
        env.storage().persistent().set(&DataKey::Balance(address.clone()), &(current_balance + 1));
    }

    fn decrement_balance(env: &Env, address: &Address) {
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&DataKey::Balance(address.clone()))
            .unwrap_or(0);
        
        let new_balance = if current_balance > 0 { current_balance - 1 } else { 0 };
        env.storage().persistent().set(&DataKey::Balance(address.clone()), &new_balance);
    }

    fn require_not_frozen(env: &Env, address: &Address) {
        let is_frozen: bool = env.storage()
            .persistent()
            .get(&DataKey::FrozenAccount(address.clone()))
            .unwrap_or(false);
        
        if is_frozen {
            panic!("Account is frozen");
        }
    }
}