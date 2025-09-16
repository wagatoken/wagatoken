#!/bin/bash

# Set environment variables for Netlify using the CLI
# This script reads from .env.netlify and sets them in Netlify

echo "🚀 Setting Netlify environment variables..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Please install it first:"
    echo "npm install -g netlify-cli"
    exit 1
fi

# Check if .env.netlify exists
if [ ! -f ".env.netlify" ]; then
    echo "❌ .env.netlify file not found"
    exit 1
fi

# Set each environment variable
echo "Setting Smart Contract Addresses..."
netlify env:set NEXT_PUBLIC_WAGA_COFFEE_TOKEN_CORE_ADDRESS "0x440146a5B87f28ab901D6268139181e07fb36e05"
netlify env:set NEXT_PUBLIC_WAGA_BATCH_MANAGER_ADDRESS "0xa215A65CD9565d1c1336a8cB0DF3B9994f4f471F"
netlify env:set NEXT_PUBLIC_WAGA_ZK_MANAGER_ADDRESS "0x79f476822073d0B4075b980D21c3fC0977410e70"
netlify env:set NEXT_PUBLIC_PRIVACY_LAYER_ADDRESS "0xf5259f49433d4dC6CFF2cAB77Cea707aF554f540"
netlify env:set NEXT_PUBLIC_WAGA_TREASURY_ADDRESS "0x75E2C46DF97cC53e8A31a1A564B987790D685177"
netlify env:set NEXT_PUBLIC_WAGA_COFFEE_REDEMPTION_ADDRESS "0xb886AD129f764cDbD128f6B96d9345334842AA6d"
netlify env:set NEXT_PUBLIC_WAGA_CDP_INTEGRATION_ADDRESS "0x3C5d7c7472144523917c817d199e875d18fBAaBA"
netlify env:set NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS "0xE794464994fC1084346C1643354Bbf7d8e3c0Ad3"
netlify env:set NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS "0x8A72F2d8Def334B0E99A3522126662bDf4Dd3AE1"
netlify env:set NEXT_PUBLIC_CIRCOM_VERIFIER_ADDRESS "0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776"
netlify env:set NEXT_PUBLIC_PRICE_VERIFIER_ADDRESS "0x0c8431117460D5bA4c981861bfc7DE9FCcF8F632"
netlify env:set NEXT_PUBLIC_QUALITY_VERIFIER_ADDRESS "0x9b9692C019CC2E104F9E7189ccfdDAab6c7368b1"
netlify env:set NEXT_PUBLIC_SUPPLY_CHAIN_VERIFIER_ADDRESS "0xD21a65E672Ad2BD4760A03EC23913Cfa61192811"

echo "Setting Network Configuration..."
netlify env:set NEXT_PUBLIC_CHAIN_ID "84532"
netlify env:set NEXT_PUBLIC_NETWORK_NAME "Base Sepolia"
netlify env:set NEXT_PUBLIC_RPC_URL "https://sepolia.base.org"
netlify env:set NEXT_PUBLIC_BLOCK_EXPLORER "https://sepolia.basescan.org"

echo "Setting Chainlink Configuration..."
netlify env:set NEXT_PUBLIC_CHAINLINK_DON_ID "0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000"
netlify env:set NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID "429"
netlify env:set NEXT_PUBLIC_CHAINLINK_ROUTER "0xf9B8fc078197181C841c296C876945aaa425B278"

echo "Setting IPFS/Pinata Configuration..."
netlify env:set NEXT_PUBLIC_GATEWAY_URL "violet-rainy-toad-577.mypinata.cloud"
netlify env:set PINATA_JWT "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMzkxMDZlOS00NTA1LTQ2MGMtOGFjMy0xNzk0YTZmMzk1N2IiLCJlbWFpbCI6ImVtbWFudWVsQGVhcmVzZWFyY2gubmV0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQ2MzUyZjIxNDQ4MzM0ZDE3ZmY5Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTNkNzZkMzMwOWE3ZDg5NzUwZGI2MTg1MzhlMGM4YjYyYjNmYjc0ZmM4YzAxNjMxOTY4OWY2ZDQ5NjAwMzg3YyIsImV4cCI6MTc4NzY2MDc0Mn0.FtrZaVFOQyUZ84Ttniwwv4pufeBU9oErYzlsEcB5sGY"
netlify env:set NEXT_PUBLIC_PINATA_JWT "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMzkxMDZlOS00NTA1LTQ2MGMtOGFjMy0xNzk0YTZmMzk1N2IiLCJlbWFpbCI6ImVtbWFudWVsQGVhcmVzZWFyY2gubmV0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQ2MzUyZjIxNDQ4MzM0ZDE3ZmY5Iiwic2NvcGVkS2V5U2VjcmV0IjoiYTNkNzZkMzMwOWE3ZDg5NzUwZGI2MTg1MzhlMGM4YjYyYjNmYjc0ZmM4YzAxNjMxOTY4OWY2ZDQ5NjAwMzg3YyIsImV4cCI6MTc4NzY2MDc0Mn0.FtrZaVFOQyUZ84Ttniwwv4pufeBU9oErYzlsEcB5sGY"
netlify env:set NEXT_PUBLIC_IPFS_GATEWAY "https://violet-rainy-toad-577.mypinata.cloud/ipfs/"
netlify env:set NEXT_PUBLIC_PINATA_API_BASE "https://api.pinata.cloud"

echo "Setting Development Configuration..."
netlify env:set NEXT_PUBLIC_DEBUG "true"
netlify env:set NEXT_PUBLIC_API_TIMEOUT "30000"

echo ""
echo "✅ All environment variables have been set!"
echo ""
echo "🔧 You can verify the variables with:"
echo "netlify env:list"
echo ""
echo "🚀 To redeploy with new environment variables:"
echo "netlify deploy --prod --build"
