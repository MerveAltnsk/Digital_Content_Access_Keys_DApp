# Digital Content Access Keys DApp

A decentralized application built on Stellar's Soroban platform for managing digital content access through blockchain-based keys.

## 🌟 Features

- **Mint Access Keys**: Create secure digital access tokens for your content
- **Transfer & Share**: Easily transfer or sell access rights to others
- **Balance Management**: Track subscription status and key ownership
- **Account Freezing**: Handle subscription expiration and access control
- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **Wallet Integration**: Seamless connection with Freighter wallet

## 🏗️ Architecture

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Freighter API** for wallet integration
- **Stellar SDK** for blockchain interactions

### Smart Contract
- **Rust** with Soroban SDK
- **Access Key Management** with expiration and transfer capabilities
- **Account Freezing** for subscription control
- **Event Emissions** for transparency

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust 1.74+
- Stellar CLI
- Freighter wallet browser extension

### Frontend Setup

1. **Clone and install dependencies**
```bash
git clone <your-repo>
cd digital-access-keys-dapp
npm install
```

2. **Configure environment**
```bash
# Create .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_NETWORK=testnet
```

3. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your DApp.

### Smart Contract Setup

1. **Navigate to contract directory**
```bash
mkdir contract && cd contract
```

2. **Initialize Soroban project**
```bash
cargo init --lib
# Copy the provided lib.rs and Cargo.toml files
```

3. **Build the contract**
```bash
cargo build --target wasm32-unknown-unknown --release
```

4. **Deploy to Soroban Testnet**
```bash
# Install Stellar CLI
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/digital_access_keys.wasm \
  --source your-secret-key \
  --network testnet
```

5. **Initialize the contract**
```bash
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source your-secret-key \
  --network testnet \
  -- initialize \
  --admin YOUR_PUBLIC_KEY
```

## 🔧 Configuration

### Frontend Configuration

Update `utils/contract.ts` with your deployed contract address:

```typescript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### Wallet Setup

1. Install [Freighter](https://freighter.app/) browser extension
2. Create or import a Stellar account
3. Switch to Testnet for development
4. Fund your account using [Stellar Laboratory](https://laboratory.stellar.org/#account-creator)

## 📱 Usage

### For Content Creators

1. **Connect Wallet**: Click "Connect Freighter Wallet"
2. **Set Content Metadata**: Define your digital content details
3. **Mint Access Keys**: Create keys with expiration dates
4. **Manage Access**: Monitor key usage and transfers

### For Content Consumers

1. **Connect Wallet**: Link your Freighter wallet
2. **Purchase Keys**: Buy access keys from creators
3. **Access Content**: Use valid keys to access digital content
4. **Transfer Keys**: Share or resell keys (if transferable)

## 🔐 Smart Contract Functions

### Core Functions

- `mint(to, content_id, expires_at, transferable)` - Create new access key
- `transfer(key_id, to)` - Transfer key to another address  
- `balance(address)` - Get access key balance
- `freeze_account(account, freeze)` - Freeze/unfreeze account

### Utility Functions

- `is_key_valid(key_id)` - Check if key is active and not expired
- `get_key(key_id)` - Get access key details
- `get_user_keys(user)` - Get all keys owned by user
- `set_content_metadata()` - Set content information

## 🎨 UI Components

### Main Features

- **Wallet Connection**: Secure Freighter integration
- **Dashboard**: Overview of keys and balances
- **Key Management**: Mint, transfer, and view keys
- **Modern Design**: Gradient backgrounds and glass morphism effects

### Responsive Design

- Mobile-first approach
- Tailwind CSS utilities
- Custom animations and transitions
- Dark theme optimized

## 🧪 Testing

### Frontend Testing
```bash
npm run lint        # ESLint checks
npm run type-check  # TypeScript validation
npm run build       # Production build test
```

### Contract Testing
```bash
cd contract
cargo test          # Run Rust tests
```

## 🚀 Deployment

### Frontend Deployment

**Vercel (Recommended)**
```bash
npm run build
# Deploy to Vercel
```

**Manual Deployment**
```bash
npm run build
npm start           # Production server
```

### Contract Deployment

**Testnet**
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/digital_access_keys.wasm \
  --source your-secret-key \
  --network testnet
```

**Mainnet**
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/digital_access_keys.wasm \
  --source your-secret-key \
  --network mainnet
```

## 🔍 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure Freighter is installed and unlocked
   - Check network settings (Testnet vs Mainnet)

2. **Transaction Failed**
   - Verify account has sufficient XLM for fees
   - Check contract address is correct

3. **Contract Call Failed**
   - Ensure contract is properly initialized
   - Verify function parameters are correct

### Debug Mode

Enable debug logging in `utils/contract.ts`:
```typescript
const DEBUG = true; // Set to true for detailed logs
```

## 📚 Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Freighter Wallet](https://freighter.app/)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue for bugs or feature requests
- Join [Stellar Discord](https://discord.gg/stellar) for community support
- Check [Stellar Stack Exchange](https://stellar.stackexchange.com/) for Q&A

---

Built with ❤️ using Stellar & Soroban
