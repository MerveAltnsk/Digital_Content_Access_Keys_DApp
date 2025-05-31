#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, Map, symbol_short};

// Event definitions
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct KeyMintedEvent {
    pub key_id: String,
    pub owner: Address,
    pub content_name: String,
    pub price: i128,
    pub duration_days: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct KeyTransferredEvent {
    pub key_id: String,
    pub from: Address,
    pub to: Address,
    pub price: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountFrozenEvent {
    pub key_id: String,
    pub owner: Address,
}

// Data structures
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccessKey {
    pub id: String,
    pub owner: Address,
    pub content_name: String,
    pub price: i128,
    pub duration_days: u64,
    pub created_at: u64,
    pub expires_at: u64,
    pub is_active: bool,
    pub is_frozen: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserBalance {
    pub address: Address,
    pub active_keys: Vec<String>,
    pub expired_keys: Vec<String>,
    pub frozen_keys: Vec<String>,
}

// Storage keys
#[contracttype]
pub enum DataKey {
    AccessKey(String),
    UserBalance(Address),
    KeyCounter,
    Admin,
}

#[contract]
pub struct DigitalContentAccessKeysContract;

#[contractimpl]
impl DigitalContentAccessKeysContract {
    /// Initialize the contract
    pub fn initialize(env: Env, admin: Address) {
        // Ensure admin is authorized
        admin.require_auth();
        
        // Set admin
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Initialize key counter
        env.storage().instance().set(&DataKey::KeyCounter, &0u64);
    }

    /// Mint a new access key
    pub fn mint_key(
        env: Env, 
        owner: Address, 
        content_name: String, 
        price: i128, 
        duration_days: u64
    ) -> String {
        // Owner must authorize the transaction
        owner.require_auth();
        
        // Validate inputs
        if price < 0 {
            panic!("Price cannot be negative");
        }
        if duration_days == 0 {
            panic!("Duration must be greater than 0");
        }
        
        // Generate unique key ID
        let counter: u64 = env.storage().instance()
            .get(&DataKey::KeyCounter)
            .unwrap_or(0);
        
        let key_id = format!("key_{}", counter);
        
        // Get current timestamp
        let current_time = env.ledger().timestamp();
        let expires_at = current_time + (duration_days * 24 * 60 * 60);
        
        // Create access key
        let access_key = AccessKey {
            id: key_id.clone(),
            owner: owner.clone(),
            content_name: content_name.clone(),
            price,
            duration_days,
            created_at: current_time,
            expires_at,
            is_active: true,
            is_frozen: false,
        };
        
        // Store the access key
        env.storage().persistent()
            .set(&DataKey::AccessKey(key_id.clone()), &access_key);
        
        // Update user balance
        Self::add_key_to_user_balance(&env, &owner, &key_id, true);
        
        // Update counter
        env.storage().instance()
            .set(&DataKey::KeyCounter, &(counter + 1));
        
        // Emit event
        env.events().publish((
            symbol_short!("key_mint"),
            KeyMintedEvent {
                key_id: key_id.clone(),
                owner,
                content_name,
                price,
                duration_days,
            }
        ));
        
        key_id
    }

    /// Transfer an access key to another address
    pub fn transfer_key(
        env: Env, 
        key_id: String, 
        from: Address, 
        to: Address, 
        price: i128
    ) -> bool {
        // From address must authorize
        from.require_auth();
        
        // Get the access key
        let mut access_key: AccessKey = env.storage().persistent()
            .get(&DataKey::AccessKey(key_id.clone()))
            .expect("Access key not found");
        
        // Validate ownership
        if access_key.owner != from {
            panic!("Not the owner of this key");
        }
        
        // Check if key is active and not frozen
        if !access_key.is_active || access_key.is_frozen {
            panic!("Key is not transferable");
        }
        
        // Check expiration
        let current_time = env.ledger().timestamp();
        if current_time >= access_key.expires_at {
            panic!("Key has expired");
        }
        
        // Update ownership
        access_key.owner = to.clone();
        
        // Store updated key
        env.storage().persistent()
            .set(&DataKey::AccessKey(key_id.clone()), &access_key);
        
        // Update user balances
        Self::remove_key_from_user_balance(&env, &from, &key_id);
        Self::add_key_to_user_balance(&env, &to, &key_id, true);
        
        // Emit event
        env.events().publish((
            symbol_short!("key_xfer"),
            KeyTransferredEvent {
                key_id,
                from,
                to,
                price,
            }
        ));
        
        true
    }

    /// Get user's access key balance and status
    pub fn get_balance(env: Env, user: Address) -> UserBalance {
        env.storage().persistent()
            .get(&DataKey::UserBalance(user.clone()))
            .unwrap_or(UserBalance {
                address: user,
                active_keys: Vec::new(&env),
                expired_keys: Vec::new(&env),
                frozen_keys: Vec::new(&env),
            })
    }

    /// Check if user has valid access to content
    pub fn verify_access(env: Env, user: Address, key_id: String) -> bool {
        let access_key: AccessKey = match env.storage().persistent()
            .get(&DataKey::AccessKey(key_id)) {
            Some(key) => key,
            None => return false,
        };
        
        // Check ownership
        if access_key.owner != user {
            return false;
        }
        
        // Check if active and not frozen
        if !access_key.is_active || access_key.is_frozen {
            return false;
        }
        
        // Check expiration
        let current_time = env.ledger().timestamp();
        access_key.expires_at > current_time
    }

    /// Freeze an account (admin or owner can freeze)
    pub fn freeze_account(env: Env, caller: Address, key_id: String) -> bool {
        caller.require_auth();
        
        // Get the access key
        let mut access_key: AccessKey = env.storage().persistent()
            .get(&DataKey::AccessKey(key_id.clone()))
            .expect("Access key not found");
        
        // Check if caller is admin or owner
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin)
            .expect("Admin not set");
        
        if caller != admin && caller != access_key.owner {
            panic!("Not authorized to freeze this key");
        }
        
        // Freeze the key
        access_key.is_frozen = true;
        access_key.is_active = false;
        
        // Store updated key
        env.storage().persistent()
            .set(&DataKey::AccessKey(key_id.clone()), &access_key);
        
        // Update user balance
        Self::move_key_to_frozen(&env, &access_key.owner, &key_id);
        
        // Emit event
        env.events().publish((
            symbol_short!("acc_frzn"),
            AccountFrozenEvent {
                key_id,
                owner: access_key.owner,
            }
        ));
        
        true
    }

    /// Get access key details
    pub fn get_key_details(env: Env, key_id: String) -> Option<AccessKey> {
        env.storage().persistent()
            .get(&DataKey::AccessKey(key_id))
    }

    /// Get all access keys for a user
    pub fn get_user_keys(env: Env, user: Address) -> Vec<AccessKey> {
        let balance = Self::get_balance(env.clone(), user);
        let mut keys = Vec::new(&env);
        
        // Collect active keys
        for key_id in balance.active_keys.iter() {
            if let Some(key) = Self::get_key_details(env.clone(), key_id) {
                keys.push_back(key);
            }
        }
        
        // Collect expired keys
        for key_id in balance.expired_keys.iter() {
            if let Some(key) = Self::get_key_details(env.clone(), key_id) {
                keys.push_back(key);
            }
        }
        
        // Collect frozen keys
        for key_id in balance.frozen_keys.iter() {
            if let Some(key) = Self::get_key_details(env.clone(), key_id) {
                keys.push_back(key);
            }
        }
        
        keys
    }

    /// Update expired keys (can be called by anyone)
    pub fn update_expired_keys(env: Env, user: Address) -> bool {
        let mut balance = Self::get_balance(env.clone(), user.clone());
        let current_time = env.ledger().timestamp();
        let mut updated = false;
        
        // Check active keys for expiration
        let mut new_active_keys = Vec::new(&env);
        
        for key_id in balance.active_keys.iter() {
            if let Some(key) = Self::get_key_details(env.clone(), key_id.clone()) {
                if current_time >= key.expires_at {
                    // Move to expired
                    balance.expired_keys.push_back(key_id.clone());
                    
                    // Update key status
                    let mut expired_key = key;
                    expired_key.is_active = false;
                    env.storage().persistent()
                        .set(&DataKey::AccessKey(key_id), &expired_key);
                    
                    updated = true;
                } else {
                    new_active_keys.push_back(key_id);
                }
            }
        }
        
        if updated {
            balance.active_keys = new_active_keys;
            env.storage().persistent()
                .set(&DataKey::UserBalance(user), &balance);
        }
        
        updated
    }

    // Helper functions
    fn add_key_to_user_balance(env: &Env, user: &Address, key_id: &String, is_active: bool) {
        let mut balance = Self::get_balance(env.clone(), user.clone());
        
        if is_active {
            balance.active_keys.push_back(key_id.clone());
        } else {
            balance.expired_keys.push_back(key_id.clone());
        }
        
        env.storage().persistent()
            .set(&DataKey::UserBalance(user.clone()), &balance);
    }
    
    fn remove_key_from_user_balance(env: &Env, user: &Address, key_id: &String) {
        let mut balance = Self::get_balance(env.clone(), user.clone());
        
        // Remove from all lists
        balance.active_keys.retain(|k| k != key_id);
        balance.expired_keys.retain(|k| k != key_id);
        balance.frozen_keys.retain(|k| k != key_id);
        
        env.storage().persistent()
            .set(&DataKey::UserBalance(user.clone()), &balance);
    }
    
    fn move_key_to_frozen(env: &Env, user: &Address, key_id: &String) {
        let mut balance = Self::get_balance(env.clone(), user.clone());
        
        // Remove from active/expired
        balance.active_keys.retain(|k| k != key_id);
        balance.expired_keys.retain(|k| k != key_id);
        
        // Add to frozen
        balance.frozen_keys.push_back(key_id.clone());
        
        env.storage().persistent()
            .set(&DataKey::UserBalance(user.clone()), &balance);
    }
}

// Trait implementation for Vec retain method (helper)
trait VecRetain<T> {
    fn retain<F>(&mut self, f: F) where F: Fn(&T) -> bool;
}

impl<T: Clone + PartialEq> VecRetain<T> for Vec<T> {
    fn retain<F>(&mut self, f: F) where F: Fn(&T) -> bool {
        let mut new_vec = Vec::new(self.env());
        for item in self.iter() {
            if f(&item) {
                new_vec.push_back(item);
            }
        }
        *self = new_vec;
    }
}