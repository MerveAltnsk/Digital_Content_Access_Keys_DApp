#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};

#[test]
fn test_mint_key() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DigitalContentAccessKeysContract);
    let client = DigitalContentAccessKeysContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    
    // Initialize contract
    client.initialize(&admin);
    
    // Mint a key
    let key_id = client.mint_key(
        &user, 
        &String::from_str(&env, "Premium Course"), 
        &100i128, 
        &30u64
    );
    
    // Verify key was created
    let key_details = client.get_key_details(&key_id).unwrap();
    assert_eq!(key_details.owner, user);
    assert_eq!(key_details.content_name, String::from_str(&env, "Premium Course"));
    assert_eq!(key_details.price, 100i128);
    assert_eq!(key_details.duration_days, 30u64);
    assert_eq!(key_details.is_active, true);
    assert_eq!(key_details.is_frozen, false);
    
    // Verify user balance
    let balance = client.get_balance(&user);
    assert_eq!(balance.active_keys.len(), 1);
    assert_eq!(balance.active_keys.get(0).unwrap(), key_id);
}

#[test]
fn test_transfer_key() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DigitalContentAccessKeysContract);
    let client = DigitalContentAccessKeysContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    
    // Initialize contract
    client.initialize(&admin);
    
    // Mint a key
    let key_id = client.mint_key(
        &user1, 
        &String::from_str(&env, "Premium Course"), 
        &100i128, 
        &30u64
    );
    
    // Transfer the key
    let result = client.transfer_key(&key_id, &user1, &user2, &50i128);
    assert_eq!(result, true);
    
    // Verify ownership changed
    let key_details = client.get_key_details(&key_id).unwrap();
    assert_eq!(key_details.owner, user2);
    
    // Verify balances updated
    let balance1 = client.get_balance(&user1);
    let balance2 = client.get_balance(&user2);
    assert_eq!(balance1.active_keys.len(), 0);
    assert_eq!(balance2.active_keys.len(), 1);
}

#[test]
fn test_verify_access() {
    let env = Env::default();
    let contract_id = env.register_contract(None, DigitalContentAccessKeysContract);
    let client = DigitalContentAccessKeysContractClient::new(&env, &contract_id);
    
    // Create test addresses
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let other_user = Address::generate(&env);
    
    // Initialize contract
    client.initialize(&admin);
    
    // Mint a key
    let key_id = client.mint_key(
        &user, 
        &String::from_str(&env, "Premium Course"), 
        &100i128, 
        &30u64
    );
    
    // Verify access for owner
    assert_eq!(client.verify_access(&user, &key_id), true);
    
    // Verify no access for non-owner
    assert_eq!(client.verify_access(&other_user, &key_id), false);
}

#[test]
fn test_freeze_account() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Dig