# 🌟 Stellar – Habit Tracker & Digital Access Keys DApp

This project is a motivational habit tracker and digital content access management system built with **Next.js**, **Rust**, and **Soroban smart contracts**.  
It allows users to track daily habits, earn stars, and unlock exclusive content via blockchain-based access keys.

## 🚀 Features

- 🧠 **Habit tracking** (water intake, reading, screen time, etc.)
- 🔑 **Digital content access key system** (mint, transfer, freeze)
- 💬 Motivational messages by **Ben Stellar**
- 📱 Modern frontend built with **Next.js** and **Tailwind CSS**
- 🪙 Freighter Wallet integration (for authentication and signing)
- 📦 Soroban smart contract logic for key management

## 📂 Project Structure

```bash
/frontend        # Next.js + Tailwind CSS frontend
/contract        # Rust-based Soroban smart contract
/tests           # Smart contract test suite
/scripts         # Optional deploy scripts
/README.md       # This document!
```

## 🛠️ Installation
1️⃣ Clone the repo:

```bash
git clone https://github.com/<your_username>/<repo_name>.git
cd <repo_name>
```
2️⃣ Install frontend dependencies:

```bash
 
cd frontend
npm install
```
3️⃣ Start the frontend app:

```bash
 
npm run dev
4️⃣ Build the Soroban smart contract:
```
```bash
 
cd ../contract
cargo build --target wasm32-unknown-unknown --release
5️⃣ Run smart contract tests (optional):
```
```bash
 
cargo test
Make sure you have Rust, cargo, wasm32 target, and Soroban CLI tools installed.
```
## ⚙️ Usage
On first visit, connect your Freighter Wallet.

Track your habits and earn stars as daily motivation.

Unlock premium digital content with earned or purchased access keys.

Admin can mint keys, transfer ownership, and freeze accounts if needed.

## 📸 Screenshots
Coming soon! (Add /frontend/public/screenshots/*.png and reference them here)

## 📄 License
This project is licensed under the MIT License.

 

## 🔗 Resources:

🌐 Stellar Developer Docs

📚 Soroban Smart Contracts

💼 Freighter Wallet

Note:
To test the Soroban smart contract locally, ensure you compile it in the /contract folder before frontend integration.
You can simulate the logic with mock users inside the test suite (/tests).

yaml
Kopyala
Düzenle

---

Let me know if you'd like to add:
- deployment instructions to Futurenet / Soroban Previewnet  
- `.env` example for wallet connections  
- UI screenshots or demo link badges  

I'm happy to extend it!
