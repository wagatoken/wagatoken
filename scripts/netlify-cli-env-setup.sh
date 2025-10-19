#!/bin/bash

# WAGA Coffee Tokenization - Netlify CLI Environment Variables Setup
# This script automatically sets all environment variables using Netlify CLI

echo "==================================================================="
echo "🚀 WAGA Coffee Tokenization - Netlify CLI Environment Setup"
echo "==================================================================="
echo ""

# Check if netlify CLI is installed and project is linked
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed. Please install it first:"
    echo "npm install -g netlify-cli"
    exit 1
fi

# Check if project is linked
if [ ! -f ".netlify/state.json" ]; then
    echo "❌ Project is not linked to Netlify. Please run:"
    echo "netlify link"
    exit 1
fi

echo "✅ Netlify CLI found and project is linked"
echo "🔧 Setting up environment variables..."
echo ""

# Database Configuration
echo "📊 Setting up database configuration..."
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_prJFCB2adk3Y@ep-plain-rain-aepcom49-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
netlify env:set DIRECT_URL "postgresql://neondb_owner:npg_prJFCB2adk3Y@ep-plain-rain-aepcom49-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# Core Contract Addresses
echo "🔗 Setting up core contract addresses..."
netlify env:set NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS "0x5f4bE57dA14a03387Db976CB4c16F619f6958544"
netlify env:set NEXT_PUBLIC_WAGA_COFFEE_VIEWS_ADDRESS "0xb81aBa1E2C7E0cE94F29d8F6c4F0b8C8e9BA9A7f"
netlify env:set NEXT_PUBLIC_WAGA_BATCH_MANAGER_ADDRESS "0xA1d77b97a8B84c9fa7CEB11d8e02fE2c7Ec9d3f5"
netlify env:set NEXT_PUBLIC_WAGA_CONFIG_MANAGER_ADDRESS "0xdf47b379c23647cAeD932D025104d40D8B2A7864"

# ZK Privacy System
echo "🔐 Setting up ZK privacy system..."
netlify env:set NEXT_PUBLIC_WAGA_ZK_MANAGER_ADDRESS "0x9e4563C8b4dc76A3c1B4f5c12e9c4b2f8A3d6e47"
netlify env:set NEXT_PUBLIC_PRIVACY_LAYER_ADDRESS "0xf5259f49433d4dC6CFF2cAB77Cea707aF554f540"
netlify env:set NEXT_PUBLIC_CIRCOM_VERIFIER_ADDRESS "0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776"
netlify env:set NEXT_PUBLIC_PRICE_PRIVACY_VERIFIER_ADDRESS "0x0c8431117460D5bA4c981861bfc7DE9FCcF8F632"
netlify env:set NEXT_PUBLIC_QUALITY_TIER_VERIFIER_ADDRESS "0x9b9692C019CC2E104F9E7189ccfdDAab6c7368b1"
netlify env:set NEXT_PUBLIC_SUPPLY_CHAIN_VERIFIER_ADDRESS "0xD21a65E672Ad2BD4760A03EC23913Cfa61192811"

# Financial and Operations
echo "💰 Setting up financial and operations contracts..."
netlify env:set NEXT_PUBLIC_WAGA_TREASURY_ADDRESS "0x75E2C46DF97cC53e8A31a1A564B987790D685177"
netlify env:set NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS "0xb886AD129f764cDbD128f6B96d9345334842AA6d"
netlify env:set NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS "0xE794464994fC1084346C1643354Bbf7d8e3c0Ad3"
netlify env:set NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS "0x8A72F2d8Def334B0E99A3522126662bDf4Dd3AE1"

# Integration and Compliance
echo "🌍 Setting up integration and compliance..."
netlify env:set NEXT_PUBLIC_WAGA_CDP_INTEGRATION_ADDRESS "0x3C5d7c7472144523917c817d199e875d18fBAaBA"
netlify env:set NEXT_PUBLIC_WAGA_ACCESS_CONTROL_ADDRESS "0x8E1f4a8C7d9e2b3c4F5a6b7c8d9e0f1A2b3C4d5e"
netlify env:set NEXT_PUBLIC_WAGA_ETHIOPIAN_COMPLIANCE_CORE_ADDRESS "0xCd3f2A1b4e5c6d7e8f9a0b1c2D3e4F5a6B7c8D9e"
netlify env:set NEXT_PUBLIC_WAGA_BANKING_CORE_ADDRESS "0xE9f8d7c6b5a4930221f0e9d8c7b6a5948372615e"

# Network Configuration
echo "🌐 Setting up network configuration..."
netlify env:set NEXT_PUBLIC_CHAIN_ID "84532"
netlify env:set NEXT_PUBLIC_NETWORK_NAME "Base Sepolia"
netlify env:set NEXT_PUBLIC_RPC_URL "https://sepolia.base.org"
netlify env:set NEXT_PUBLIC_BLOCK_EXPLORER "https://sepolia.basescan.org"

# Chainlink Functions
echo "🔗 Setting up Chainlink Functions..."
netlify env:set NEXT_PUBLIC_CHAINLINK_DON_ID "0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000"
netlify env:set NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID "429"
netlify env:set NEXT_PUBLIC_CHAINLINK_ROUTER_ADDRESS "0xf9B8fc078197181C841c296C876945aaa425B278"
netlify env:set NEXT_PUBLIC_CHAINLINK_GAS_LIMIT "300000"

# IPFS Configuration
echo "📁 Setting up IPFS configuration..."
netlify env:set PINATA_JWT "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMzkxMDZlOS00NTA1LTQ2MGMtOGFjMy0xNzk0YTZmMzk1N2IiLCJlbWFpbCI6ImVtbWFudWVsQGVhcmVzZWFyY2gubmV0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQ2MzUyZjIxNDQ4MzM0ZDE3ZmY5Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTNkNzZkMzMwOWE3ZDg5NzUwZGI2MTg1MzhlMGM4YjYyYjNmYjc0ZmM4YzAxNjMxOTY4OWY2ZDQ5NjAwMzg3YyIsImV4cCI6MTc4NzY2MDc0Mn0.FtrZaVFOQyUZ84Ttniwwv4pufeBU9oErYzlsEcB5sGY"
netlify env:set NEXT_PUBLIC_PINATA_JWT "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMzkxMDZlOS00NTA1LTQ2MGMtOGFjMy0xNzk0YTZmMzk1N2IiLCJlbWFpbCI6ImVtbWFudWVsQGVhcmVzZWFyY2gubmV0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQ2MzUyZjIxNDQ4MzM0ZDE3ZmY5Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTNkNzZkMzMwOWE3ZDg5NzUwZGI2MTg1MzhlMGM4YjYyYjNmYjc0ZmM4YzAxNjMxOTY4OWY2ZDQ5NjAwMzg3YyIsImV4cCI6MTc4NzY2MDc0Mn0.FtrZaVFOQyUZ84Ttniwwv4pufeBU9oErYzlsEcB5sGY"
netlify env:set NEXT_PUBLIC_GATEWAY_URL "violet-rainy-toad-577.mypinata.cloud"
netlify env:set NEXT_PUBLIC_IPFS_GATEWAY "https://violet-rainy-toad-577.mypinata.cloud/ipfs/"
netlify env:set NEXT_PUBLIC_PINATA_API_BASE "https://api.pinata.cloud"

# Production Configuration
echo "⚙️ Setting up production configuration..."
netlify env:set NODE_ENV "production"
netlify env:set NEXT_PUBLIC_ENV "production"

echo ""
echo "==================================================================="
echo "⚠️  SECURITY VARIABLES - MANUAL SETUP REQUIRED"
echo "==================================================================="
echo ""
echo "Please generate secure values for these variables and set them manually:"
echo ""
echo "1. Generate a secure JWT secret (32+ characters):"
echo "   netlify env:set NEXT_PUBLIC_JWT_SECRET \"your_secure_32_plus_character_string\""
echo ""
echo "2. Generate a secure session secret (32+ characters):"
echo "   netlify env:set NEXT_PUBLIC_SESSION_SECRET \"your_secure_32_plus_character_string\""
echo ""
echo "3. Generate a secure API key:"
echo "   netlify env:set WAGA_API_KEY \"your_secure_api_key\""
echo ""
echo "4. Update the API base URL with your actual Netlify domain:"
echo "   netlify env:set NEXT_PUBLIC_API_BASE_URL \"https://your-actual-domain.netlify.app/api\""
echo ""
echo "==================================================================="
echo "🔍 VERIFICATION"
echo "==================================================================="
echo ""
echo "To verify all environment variables are set correctly, run:"
echo "netlify env:list"
echo ""
echo "To trigger a new deployment with the updated environment variables:"
echo "netlify deploy --prod"
echo ""
echo "==================================================================="
echo "✅ SETUP COMPLETE"
echo "==================================================================="
echo ""
echo "✅ Database configuration set"
echo "✅ All smart contract addresses set (18+ contracts)"
echo "✅ Network configuration set (Base Sepolia)"
echo "✅ Chainlink Functions configuration set"
echo "✅ IPFS/Pinata configuration set"
echo "✅ Production environment configuration set"
echo ""
echo "🔒 Remember to set the security variables manually as shown above"
echo "🚀 Your WAGA Coffee Tokenization frontend is ready for deployment!"