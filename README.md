# WAGA Coffee - Blockchain Coffee Traceability Platform

*Onchain Coffee, OffChain Impact* ☕

This is the complete WAGA Coffee traceability platform - a professional Web3 application bringing transparency and authenticity to Ethiopian coffee supply chains.

## About WAGA Coffee

WAGA Coffee is a cutting-edge blockchain-based coffee traceability system that provides complete transparency from farm to cup. Built on Base Sepolia network with Chainlink oracles and IPFS integration, WAGA ensures every coffee batch is verified, tracked, and authenticated on-chain.

**Mission**: Fair and transparent coffee trading through decentralized technology, empowering Ethiopian coffee farmers and ensuring quality for consumers worldwide.

## ✨ Key Features

### 🌾 **Complete Coffee Ecosystem**
- **Farm-to-Cup Traceability**: Every batch tracked from Ethiopian farms to your cup
- **ERC-1155 NFT Certificates**: Unique digital certificates for each verified batch
- **Smart Redemption System**: Token holders can redeem for physical coffee delivery
- **Real-time Inventory**: Live tracking of coffee stock and availability

### 🎛️ **Professional Portals**
- **Admin Portal**: Comprehensive batch management and verification system for WAGA staff
- **Distributor Portal**: Request verified coffee batches and manage token redemptions
- **Browse Coffee**: Explore verified Ethiopian coffee batches with detailed information
- **Documentation Hub**: Complete technical documentation and user guides

### 🎨 **Enhanced User Experience**
- **Custom WAGA Icons**: Professional coffee-specific iconography throughout the platform
- **Color-Themed Interface**: Intuitive color coding using color theory principles
- **Gentle Animations**: Subtle sideways swaying animations for enhanced visual appeal
- **Web3 Aesthetics**: Professional blockchain-inspired design with glass morphism effects
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔗 **Blockchain Integration**
- **Chainlink Functions**: Decentralized verification of coffee inventory and quality
- **IPFS Metadata**: Immutable storage of batch details, certificates, and farm information
- **Multi-Contract Architecture**: Modular smart contract system for scalability
- **Gas Optimization**: Efficient contract interactions and batch operations

## 📊 Live Platform Statistics

Our real-time dashboard displays:
- **4 Smart Contracts** deployed and verified on Base Sepolia
- **7+ Coffee Batches** currently tracked and verified
- **85%+ Verification Rate** for submitted batches
- **Active IPFS Storage** via Pinata integration

## 🔗 Smart Contracts (Base Sepolia)

- **WAGACoffeeToken**: `0xE69bdd3E783212D11522E7f0057c9F52FC4D0A39`
- **WAGAInventoryManager**: `0xe882dcD6F1283F83Ab19F954d70fC024eE70A908`
- **WAGACoffeeRedemption**: `0xc235C005202a9ec26d59120B8e9c2cc6AB432fC4`
- **WAGAProofOfReserve**: `0xaA42A460107A61D34D461fb59c46343b1a8FAdc5`

All contracts are verified on [Basescan](https://sepolia.basescan.org/).

## 🛠️ Technology Stack

### Frontend & UI
- **Framework**: Next.js 14.2.5 with TypeScript for type-safe development
- **Styling**: Tailwind CSS with custom Web3 components and animations
- **Icons**: @web3icons/react library + custom WAGA coffee iconography
- **Components**: Modular React components with professional Web3 aesthetics
- **Animations**: CSS keyframes for gentle sideways swaying and slide effects

### Blockchain & Web3
- **Network**: Base Sepolia (Ethereum L2) for fast, low-cost transactions
- **Oracles**: Chainlink Functions for decentralized data verification
- **Storage**: IPFS via Pinata for immutable metadata and certificates
- **Wallet Integration**: Web3 wallet connection with MetaMask support
- **Contract Interaction**: Ethers.js for blockchain interactions

### Infrastructure
- **Deployment**: Netlify with optimized build pipeline
- **API**: RESTful endpoints for batch data and IPFS integration
- **Environment**: Secure environment variable management
- **Monitoring**: Real-time batch tracking and verification status

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm for development
- **Web3 Wallet** (MetaMask recommended) for blockchain interactions
- **Base Sepolia Testnet** configured in your wallet
- **Git** for repository management

### 🔧 Local Development Setup

1. **Clone the Repository**
```bash
git clone https://github.com/wagatoken/wagatoken.git
cd wagatoken
```

2. **Install Dependencies**
```bash
cd frontend
npm install
```

3. **Environment Configuration**
Create your environment file:
```bash
cp .env.example .env.local
```

Configure your `.env.local` with the required values:
```env
# Pinata IPFS Configuration
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway_url

# Smart Contract Addresses (Base Sepolia)
NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS=0xE69bdd3E783212D11522E7f0057c9F52FC4D0A39
NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS=0xe882dcD6F1283F83Ab19F954d70fC024eE70A908
NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS=0xc235C005202a9ec26d59120B8e9c2cc6AB432fC4
NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS=0xaA42A460107A61D34D461fb59c46343b1a8FAdc5

# Chainlink Functions Configuration
NEXT_PUBLIC_CHAINLINK_FUNCTIONS_ROUTER=0xf9B8fc078197181C841c296C876945aaa425B278
NEXT_PUBLIC_CHAINLINK_DON_ID=fun-base-sepolia-1
NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID=your_subscription_id

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
WAGA_API_KEY=your_development_api_key
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Access the Application**
Navigate to [http://localhost:3001](http://localhost:3001)

### 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Optional: Preview the build locally
npm run preview
```

## 🌐 Deployment

### Netlify Deployment (Recommended)

This application is optimized for Netlify deployment with the following configuration:

**Build Settings:**
- **Build command**: `cd frontend && npm run build`
- **Publish directory**: `frontend/dist` or `frontend/.next`
- **Node version**: 18.x or higher

**Environment Variables** (Configure in Netlify Dashboard):
```env
# Production Pinata Configuration
PINATA_JWT=your_production_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=your_production_gateway_url

# Smart Contract Addresses (Base Sepolia)
NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS=0xE69bdd3E783212D11522E7f0057c9F52FC4D0A39
NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS=0xe882dcD6F1283F83Ab19F954d70fC024eE70A908
NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS=0xc235C005202a9ec26d59120B8e9c2cc6AB432fC4
NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS=0xaA42A460107A61D34D461fb59c46343b1a8FAdc5

# Chainlink Production Configuration
NEXT_PUBLIC_CHAINLINK_FUNCTIONS_ROUTER=0xf9B8fc078197181C841c296C876945aaa425B278
NEXT_PUBLIC_CHAINLINK_DON_ID=fun-base-sepolia-1
NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID=your_production_subscription_id

# Production API
NEXT_PUBLIC_API_BASE_URL=https://your-production-domain.com
WAGA_API_KEY=your_production_api_key
```

### Alternative Deployment Options
- **Vercel**: Full Next.js support with automatic deployments
- **Railway**: Docker-based deployment with database integration
- **AWS Amplify**: Scalable hosting with CI/CD pipelines

## ⚙️ Network Configuration

### Base Sepolia Testnet Setup
The application is configured for Base Sepolia testnet with the following parameters:

- **Network Name**: Base Sepolia
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: `84532`
- **Currency Symbol**: `ETH`
- **Block Explorer**: `https://sepolia.basescan.org/`

### MetaMask Configuration
Add Base Sepolia to your MetaMask:
1. Open MetaMask → Networks → Add Network
2. Enter the network details above
3. Get testnet ETH from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

## 📁 Project Structure

```
WAGA_MVP_V2/
├── frontend/                    # Next.js application
│   ├── app/                    # App router pages and components
│   │   ├── components/         # Reusable React components
│   │   │   └── icons/         # Custom WAGA iconography
│   │   ├── admin/             # Admin portal pages
│   │   ├── distributor/       # Distributor portal pages
│   │   ├── browse/            # Coffee browsing interface
│   │   └── docs/              # Documentation pages
│   ├── utils/                 # Utility functions and configurations
│   └── public/                # Static assets
├── src/                       # Smart contracts (Solidity)
├── script/                    # Deployment and interaction scripts
├── test/                      # Smart contract tests
└── lib/                       # External libraries and dependencies
```

## 🎨 Design System

### Color Themes
- **Blockchain** (Blue/Purple): Trust, technology, smart contracts
- **Coffee** (Amber/Orange): Warmth, energy, coffee essence
- **Verification** (Green): Security, success, authenticity
- **Storage** (Purple): Data, innovation, IPFS integration

### Custom Animations
- **Gentle Sway**: Subtle left-right movement for stat cards
- **Slide Animations**: Smooth entrance effects for feature cards
- **Glass Morphism**: Professional Web3 aesthetic with backdrop blur

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support & Contact

- **Documentation**: Visit our [comprehensive docs](/docs)
- **Issues**: Report bugs via GitHub Issues
- **Email**: contact@wagacoffee.io
- **Discord**: Join our developer community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chainlink**: Decentralized oracle infrastructure
- **Base**: Layer 2 scaling solution
- **Pinata**: IPFS hosting and management
- **OpenZeppelin**: Secure smart contract standards
- **Ethiopian Coffee Farmers**: The heart of our mission

---

**WAGA Coffee - Bringing transparency to every cup** ☕  
*Onchain Coffee, OffChain Impact*

---

*Built with ❤️ for the Ethiopian coffee community*