# WAGA Coffee - Blockchain Coffee Traceability

*Track every bean. Trust every cup.* ☕

Coffee traceability that actually works. No BS, just blockchain.

## What WAGA Does

We built a system that tracks coffee from farm to your cup using blockchain technology. Every batch gets verified, stored on-chain, and turned into NFT certificates that distributors can redeem for real coffee.

**Simple mission**: Make coffee trading transparent and fair for farmers.

## Features

### Core System
- **Farm-to-Cup Tracking**: Every batch gets an ID, metadata stored on IPFS
- **NFT Certificates**: ERC-1155 tokens for verified batches
- **Physical Redemption**: Token holders get real coffee delivered
- **Live Inventory**: Real-time stock tracking

### User Interfaces
- **Admin Portal**: Create batches, manage verification (with progressive forms)
- **Distributor Portal**: Request batches, redeem tokens
- **Browse Coffee**: Find verified batches
- **Documentation**: Actually useful guides

### Tech Stack
- **Blockchain**: Base Sepolia (cheap, fast)
- **Verification**: Chainlink Functions
- **Storage**: IPFS via Pinata
- **Frontend**: Next.js 14 with TypeScript

## Current Status

- **4 Smart Contracts** deployed on Base Sepolia
- **7+ Coffee Batches** tracked and verified
- **Progressive Form System** - new step-by-step batch creation
- **Active IPFS Storage** via Pinata
- **Working QR Code Generation** for each batch

## Smart Contracts (Base Sepolia)

- **WAGACoffeeToken**: `0xB1D14D241028bFbbA1eEA928B451Cb1d10DfA016`
- **WAGAProofOfReserve**: `0x4e7164E037464fFccF45b69E3c6246482E024A89`
- **WAGAInventoryManager**: `0x03dd8b6C292c8c0Da412d0944E0f11Fb08393F33`
- **WAGARedemption**: `0x2770c93E0C2bf9e15e32319b3A8eFf7560B75E0C`

All verified on [Basescan](https://sepolia.basescan.org/).

## Quick Start

### What You Need
- Node.js 18+
- MetaMask wallet
- Base Sepolia testnet setup

### Run Locally
```bash
git clone https://github.com/team-waga/wagatoken.git
cd wagatoken/frontend
npm install
npm run dev
```

Open http://localhost:3001

### Environment Setup
Copy `.env.example` to `.env.local` and fill in:
- Pinata JWT for IPFS
- Contract addresses (already configured)
- Chainlink subscription ID

That's it. The app works.

## Deployment

For production, deploy to Netlify or Vercel. 

**Build**: `cd frontend && npm run build`

Configure these environment variables:
- Pinata JWT and gateway URL
- Smart contract addresses (already set for Base Sepolia)
- Chainlink subscription ID
- API base URL

## Contributing

1. Fork it
2. Create feature branch
3. Make changes
4. Submit PR

## Status

See [STATUS.md](STATUS.md) for detailed functionality report.

## License

MIT License

---

**WAGA Coffee** - Every bean tracked, every cup trusted. ☕