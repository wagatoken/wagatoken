# WAGA Coffee - Frontend Application

This is the frontend-only deployment branch for the WAGA Coffee traceability platform.

## About WAGA Coffee

WAGA Coffee is a blockchain-based coffee traceability system that provides transparency and authenticity verification for premium coffee batches. Built on Base Sepolia network with IPFS integration for metadata storage.

## Features

- **Coffee Batch Tracking**: Complete traceability from farm to cup
- **NFT Certificates**: Each batch has a unique digital certificate
- **Redemption System**: Token holders can redeem for physical coffee
- **Admin Dashboard**: Batch management and inventory control
- **User Portal**: Track owned tokens and redemption history

## Smart Contracts (Base Sepolia)

- **WAGACoffeeToken**: `0xE69bdd3E783212D11522E7f0057c9F52FC4D0A39`
- **WAGAInventoryManager**: `0xe882dcD6F1283F83Ab19F954d70fC024eE70A908`
- **WAGACoffeeRedemption**: `0xc235C005202a9ec26d59120B8e9c2cc6AB432fC4`
- **WAGAProofOfReserve**: `0xaA42A460107A61D34D461fb59c46343b1a8FAdc5`

All contracts are verified on [Basescan](https://sepolia.basescan.org/).

## Technologies

- **Frontend**: Next.js 14.2.5 with TypeScript
- **Styling**: Tailwind CSS with custom Web3 components
- **Blockchain**: Base Sepolia (Ethereum L2)
- **Storage**: IPFS via Pinata
- **Authentication**: Web3 wallet connection

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Web3 wallet (MetaMask recommended)
- Base Sepolia testnet setup

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd WAGA_MVP_V2
```

2. **Install dependencies**
```bash
cd frontend
npm install
```

3. **Environment Setup**
Copy the example environment file and configure it with your values:
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local` with your actual values:
- **Pinata credentials**: For IPFS storage
- **Contract addresses**: Use the deployed Base Sepolia contracts above
- **Chainlink subscription**: For oracle functionality
- **API keys**: For external services

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## Deployment

This branch is optimized for Netlify deployment with all Solidity files excluded.

### Netlify Settings
- **Build command**: `cd frontend && npm run build`
- **Publish directory**: `frontend/.next`
- **Environment variables**: Configure in Netlify dashboard using values from `.env.example`

**Required Netlify Environment Variables:**
```
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway_url
NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS=0xE69bdd3E783212D11522E7f0057c9F52FC4D0A39
NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS=0xe882dcD6F1283F83Ab19F954d70fC024eE70A908
NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS=0xc235C005202a9ec26d59120B8e9c2cc6AB432fC4
NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS=0xaA42A460107A61D34D461fb59c46343b1a8FAdc5
NEXT_PUBLIC_CHAINLINK_FUNCTIONS_ROUTER=0xf9B8fc078197181C841c296C876945aaa425B278
NEXT_PUBLIC_CHAINLINK_DON_ID=fun-base-sepolia-1
NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID=your_subscription_id
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
WAGA_API_KEY=your_production_api_key
```

## Network Configuration

The application is configured for Base Sepolia testnet:
- **RPC URL**: Base Sepolia via Alchemy
- **Chain ID**: 84532
- **Currency**: ETH

## Support

For issues or questions, please contact the WAGA Coffee team.

---
*WAGA Coffee - Bringing transparency to every cup* ☕