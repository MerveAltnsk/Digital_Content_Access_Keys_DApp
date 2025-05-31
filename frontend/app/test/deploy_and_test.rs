#!/bin/bash
# deploy.sh - Contract deployment script

echo "🚀 Digital Content Access Keys - Stellar Soroban Deployment"
echo "============================================================"

# Build the contract
echo "📦 Building Rust contract..."
cargo build --target wasm32-unknown-unknown --release

if [ $? -ne 0 ]; then
    echo "❌ Contract build failed!"
    exit 1
fi

echo "✅ Contract built successfully!"

# Deploy to testnet
echo "🌐 Deploying to Stellar testnet..."
CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/digital_content_access_keys.wasm \
    --source account \
    --network testnet)

if [ $? -ne 0 ]; then
    echo "❌ Contract deployment failed!"
    exit 1
fi

echo "✅ Contract deployed successfully!"
echo "📝 Contract ID: $CONTRACT_ID"

# Initialize the contract
echo "🔧 Initializing contract..."
ADMIN_ADDRESS="YOUR_ADMIN_ADDRESS_HERE"

soroban contract invoke \
    --id $CONTRACT_ID \
    --source account \
    --network testnet \
    -- \
    initialize \
    --admin $ADMIN_ADDRESS

if [ $? -ne 0 ]; then
    echo "❌ Contract initialization failed!"
    exit 1
fi

echo "✅ Contract initialized successfully!"
echo "🎉 Deployment completed!"
echo ""
echo "Contract Details:"
echo "- Contract ID: $CONTRACT_ID"
echo "- Network: Testnet"
echo "- Admin: $ADMIN_ADDRESS"
echo ""
echo "📋 Next steps:"
echo "1. Update your frontend with the contract ID"
echo "2. Test the contract functions"
echo "3. Deploy frontend to production"

---

#!/bin/bash
# test-contract.sh - Contract testing script

echo "🧪 Testing Digital Content Access Keys Contract"
echo "================================================"

# Build and test
echo "📦 Building and running tests..."
cargo test --features testutils

if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

echo "✅ All tests passed!"

# Optional: Run specific tests
echo ""
echo "📋 Available test commands:"
echo "  cargo test test_mint_key"
echo "  cargo test test_transfer_key"
echo "  cargo test test_balance"
echo "  cargo test test_freeze_account"

---

# soroban-config.toml - Soroban CLI configuration

# Testnet configuration
[[networks]]
name = "testnet"
rpc_url = "https://soroban-testnet.stellar.org/"
network_passphrase = "Test SDF Network ; September 2015"

# Mainnet configuration (for production)
[[networks]]
name = "mainnet"
rpc_url = "https://soroban-mainnet.stellar.org/"
network_passphrase = "Public Global Stellar Network ; September 2015"

# Local development configuration
[[networks]]
name = "local"
rpc_url = "http://localhost:8000/soroban/rpc"
network_passphrase = "Standalone Network ; February 2017"

---

# .env.example - Environment variables template

# Frontend Configuration
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=YOUR_CONTRACT_ID_HERE
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org/

# Development
NODE_ENV=development

# Stellar Configuration
STELLAR_NETWORK=testnet
CONTRACT_ADMIN_SECRET=YOUR_ADMIN_SECRET_KEY_HERE

---

#!/bin/bash
# setup.sh - Initial setup script

echo "🔧 Setting up Digital Content Access Keys DApp"
echo "==============================================="

# Check dependencies
echo "📋 Checking dependencies..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first."
    exit 1
fi

# Check Soroban CLI
if ! command -v soroban &> /dev/null; then
    echo "📦 Installing Soroban CLI..."
    cargo install --locked soroban-cli
fi

# Add wasm32 target
echo "📦 Adding wasm32 target..."
rustup target add wasm32-unknown-unknown

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📄 Creating .env.local file..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your configuration"
fi

echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Run 'chmod +x *.sh' to make scripts executable"
echo "3. Run './deploy.sh' to deploy the contract"
echo "4. Run 'npm run dev' to start the frontend"