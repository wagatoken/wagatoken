#!/bin/bash

# WAGA Coffee Tokenization - Netlify CLI Environment Variables Setup
# This script automatically sets all environment variables using Netlify CLI
# Run this from the frontend directory where the project is linked

echo "==================================================================="
echo "🚀 WAGA Coffee Tokenization - Netlify CLI Environment Setup"
echo "==================================================================="
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed. Please install it first:"
    echo "npm install -g netlify-cli"
    exit 1
fi

echo "✅ Netlify CLI found"
echo "🔧 Setting up environment variables..."
echo ""

# Database Configuration
echo "📊 Setting up database configuration..."
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_prJFCB2adk3Y@ep-plain-rain-aepcom49-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
netlify env:set DIRECT_URL "postgresql://neondb_owner:npg_prJFCB2adk3Y@ep-plain-rain-aepcom49-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
netlify env:set NETLIFY_DATABASE_URL "postgresql://neondb_owner:npg_prJFCB2adk3Y@ep-plain-rain-aepcom49-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# Core Contract Addresses (using actual addresses from .env.local)
echo "🔗 Setting up core contract addresses..."
netlify env:set NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS "0x5f4bE57dA14a03387Db976CB4c16F619f6958544"
netlify env:set NEXT_PUBLIC_WAGA_COFFEE_VIEWS_ADDRESS "0x9E8705790E054d33c5aB8FaA4de8Ba5567847c32"
netlify env:set NEXT_PUBLIC_WAGA_BATCH_OPERATIONS_ADDRESS "0xe76eC63e59e39A0cd2Db131d31f8E9a8a6d853b1"
netlify env:set NEXT_PUBLIC_WAGA_CONFIG_MANAGER_ADDRESS "0xdf47b379c23647cAeD932D025104d40D8B2A7864"
netlify env:set NEXT_PUBLIC_WAGA_TREASURY_ADDRESS "0xe400f90fc4E59B0DA49c8f818C371d9233e7D83f"
netlify env:set NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS "0x4dc1Ea2637a74919262e31396B18ce83d2f0bfB3"
netlify env:set NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS "0xD12D8A514aB0D0f852A1FA9BB04547e1f896aeAb"
netlify env:set NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS "0x04f1e95C04faFc48A30f92E3479B292BB0b6D68a"

# ZK Privacy System (using actual addresses from .env.local)
echo "🔐 Setting up ZK privacy system..."
netlify env:set NEXT_PUBLIC_WAGA_ZK_MANAGER_ADDRESS "0x56d7F9947Cd6946153A24dE66d27Be9Eb071FD4e"
netlify env:set NEXT_PUBLIC_PRIVACY_LAYER_ADDRESS "0x9a6fD02FAfa63C7e9e88574EE0a4950b936f658D"
netlify env:set NEXT_PUBLIC_CIRCOM_VERIFIER_ADDRESS "0xEf6875Ae4418191422C0cD4D59036345A5e8cADF"

# ZK Circuit Verifiers (using actual addresses from .env.local)
echo "🔒 Setting up ZK circuit verifiers..."
netlify env:set NEXT_PUBLIC_PRICE_PRIVACY_VERIFIER_ADDRESS "0x2e69F0d719231858bC3b89a866df7b22cddBf8bE"
netlify env:set NEXT_PUBLIC_QUALITY_TIER_VERIFIER_ADDRESS "0x3fdF035db85Bd3848085Fb4d0267d7527eC1b5c1"
netlify env:set NEXT_PUBLIC_SUPPLY_CHAIN_VERIFIER_ADDRESS "0x02f0B0D48F9449ad3F43471CBf59d061C1791410"
netlify env:set NEXT_PUBLIC_EUDR_DEFORESTATION_VERIFIER_ADDRESS "0xE14EB9e795698d8E8e4201B94faB16d9aC33e28C"
netlify env:set NEXT_PUBLIC_EUDR_GEOLOCATION_VERIFIER_ADDRESS "0x92bbcC4fEDb0e77f092699510Fff142e3AA2f856"
netlify env:set NEXT_PUBLIC_ETHIOPIAN_COMPLIANCE_VERIFIER_ADDRESS "0x40a7b61a430087b4B4f5e74002aE57B7f735bc72"

# Business Logic Contracts (using actual addresses from .env.local)
echo "🌍 Setting up business logic contracts..."
netlify env:set NEXT_PUBLIC_WAGA_CDP_INTEGRATION_ADDRESS "0xe5b612F1154E10B98Be7b5eEC95bCC568C5feeeF"
netlify env:set NEXT_PUBLIC_WAGA_ETHIOPIAN_COMPLIANCE_CORE_ADDRESS "0x7F88fA7cFdAA15D9f4B735e89A2DA3026633c6a2"
netlify env:set NEXT_PUBLIC_WAGA_BANKING_CORE_ADDRESS "0x1B1CFE2272E65caE26823Aa4BA53877A290EAB32"

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

# IPFS Configuration (using actual values from .env.local)
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
echo "   netlify env:set NEXT_PUBLIC_API_BASE_URL \"https://waga-coffee-zkmvp.netlify.app/api\""
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
echo "✅ All smart contract addresses set (20+ contracts from your .env.local)"
echo "✅ Network configuration set (Base Sepolia)"
echo "✅ Chainlink Functions configuration set"
echo "✅ IPFS/Pinata configuration set"
echo "✅ Production environment configuration set"
echo ""
echo "🔒 Remember to set the security variables manually as shown above"
echo "🚀 Your WAGA Coffee Tokenization frontend is ready for deployment!"