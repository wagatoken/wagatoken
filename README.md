# ☕ WAGA Coffee Platform - Complete Coffee Value Chain on Blockchain

*Onchain Coffee - OffChain Impact*

A comprehensive coffee tokenization platform enabling transparent, privacy-preserving trade from farm to cup using blockchain technology, zero-knowledge proofs, automated verification systems, and integrated payment processing.

---

## 🎯 **What WAGA Coffee Platform Does**

WAGA transforms coffee trading by creating a **complete digital ecosystem** where every participant in the coffee value chain can tokenize, trade, and verify coffee while maintaining competitive privacy through zero-knowledge proofs.

### **🌟 Core Vision**
- **Farmers & Cooperatives**: Tokenize green coffee beans with verified quality and origin
- **Processors & Roasters**: Create retail coffee and roasted bean tokens with privacy-protected sourcing
- **Distributors & HORECAs**: Access verified coffee tokens with transparent pricing and payment processing
- **End Consumers**: Full traceability and quality assurance with integrated payment flows

---

## 🏗️ **System Architecture**

### **🔗 Blockchain Infrastructure**
- **Network**: Base Sepolia (Production: Base Mainnet)
- **Token Standard**: ERC-1155 (Multi-token support for different coffee types)
- **Verification**: Chainlink Functions for off-chain data validation
- **Privacy**: Zero-Knowledge circuits for selective transparency
- **Storage**: IPFS via Pinata for decentralized metadata

### **🎭 **Zero-Knowledge Privacy System**
- **Price Privacy**: Prove competitiveness without revealing exact pricing
- **Quality Privacy**: Verify standards without exposing proprietary scores
- **Supply Chain Privacy**: Confirm compliance without revealing sourcing details
- **Selective Transparency**: Show verification results to distributors, hide from competitors
- **Real Cryptographic Verification**: Production-ready Groth16 elliptic curve pairing
- **Trusted Setup**: Complete Powers of Tau ceremony with entropy contribution
- **On-chain Verification**: CircomVerifier with full cryptographic proof validation

### **💰 DeFi Integration & Payment Processing**
- **USDC Payments**: Native payment processing for redemptions and fees
- **Coinbase Commerce**: Hosted payment checkout integration
- **Coinbase Developer Platform**: Smart accounts and cross-border payments
- **Treasury System**: Automated fee collection and distribution
- **Cross-border Payments**: International coffee trade with reduced fees
- **Trade Finance**: Collateralized lending using coffee tokens
- **Fee Structure**: Platform sustainability through verification and transaction fees
- **Staking Rewards**: WAGA token incentives for ecosystem participation

---

## 🚀 **Platform Features**

### **📊 User Portals**

#### **🛠️ Admin Portal** (`/admin`)
- **Batch Management**: Create and verify coffee batches
- **Verification Control**: Approve processor-created batches
- **Analytics Dashboard**: Platform metrics and performance
- **Role Management**: Grant processor and distributor permissions

#### **🌱 Cooperative Portal** (`/cooperatives`)
- **Green Bean Tokenization**: Create 60kg green coffee bean batches
- **Quality Documentation**: Upload farm and processing verification
- **Origin Certification**: Geographic and sustainability credentials
- **Direct Sales**: Sell directly to roasters and processors

#### **🏭 Processor Portal** (`/processor`)
- **Batch Creation**: Independent coffee batch tokenization
- **Privacy Configuration**: Set ZK proof requirements for competitive protection
- **Request Management**: Track distributor batch requests
- **Payment Processing**: USDC fee handling for batch creation

#### **🔥 Roaster Portal** (`/roaster`)
- **Roasted Bean Creation**: Create 60kg roasted coffee bean batches
- **Roasting Process**: Document roasting profiles and quality standards
- **Green Bean Sourcing**: Purchase from cooperatives with payment integration
- **Distribution Network**: Sell to processors and distributors

#### **🚚 Distributor Portal** (`/distributor`)
- **Batch Discovery**: Browse available coffee with pricing transparency
- **Request System**: Request batch verification and token minting
- **Token Redemption**: Convert tokens to physical coffee delivery
- **Payment Integration**: Coinbase payment processing for purchases

#### **🌐 Public Browse** (`/browse`)
- **Coffee Catalog**: Explore verified coffee batches
- **Quality Indicators**: See verified quality without proprietary details
- **Origin Information**: Supply chain transparency with privacy protection
- **Direct Access**: Connect to distributor portal for purchasing

### **🔧 Technical Features**

#### **⚡ Smart Contract System**
- **WAGACoffeeTokenCore**: Core ERC-1155 with ZK privacy integration
- **WAGABatchManager**: Batch creation and metadata management
- **WAGAZKManager**: Zero-knowledge proof verification and management
- **PrivacyLayer**: Selective transparency and privacy controls
- **WAGATreasury**: USDC payment processing and fee collection
- **WAGACoffeeRedemption**: Token redemption with payment verification
- **WAGACDPIntegration**: Coinbase Developer Platform integration
- **WAGAProofOfReserve**: Chainlink-powered inventory verification
- **WAGAInventoryManagerMVP**: Inventory tracking and management
- **CircomVerifier**: Real cryptographic ZK proof verification hub
- **PricePrivacyCircuitVerifier**: Groth16 elliptic curve pairing for price proofs
- **QualityTierCircuitVerifier**: Cryptographic verification for quality standards
- **SupplyChainPrivacyCircuitVerifier**: Proof verification for supply chain compliance

#### **🔐 Privacy & Security**
- **ZK Circuits**: Circom-based privacy preserving proofs
- **Role-Based Access**: Granular permission system
- **Automated Verification**: Chainlink Functions for data integrity
- **Multi-signature**: Enhanced security for critical operations

#### **📈 Project Management**
- **GitHub Projects**: Complete development workflow management
- **Issue Templates**: Specialized templates for all development areas
- **Automated Workflows**: Smart assignment and milestone tracking
- **Quality Assurance**: Comprehensive testing and deployment pipelines

---

## 📋 **Current Development Status**

### ✅ **Phase 1: Core Infrastructure (Complete)**
- **Smart Contracts**: Deployed and verified on Base Sepolia
- **Frontend Portals**: Admin, Distributor, Cooperative, Roaster interfaces operational
- **ZK Circuits**: Compiled and tested for price, quality, supply chain privacy
- **Cryptographic Verifiers**: Production-ready Groth16 elliptic curve pairing
- **Trusted Setup**: Complete Powers of Tau ceremony with entropy contribution
- **ZK Integration**: CircomVerifier with real cryptographic verification
- **IPFS Integration**: Metadata storage and retrieval working
- **Chainlink Integration**: Functions and Automation deployed

### ✅ **Phase 2: Payment Integration & Product Expansion (Complete)**
- **Coinbase Commerce**: Hosted payment checkout integration
- **Coinbase Developer Platform**: Smart accounts and cross-border payments
- **Treasury System**: USDC payment processing and fee collection
- **Cross-border Payments**: International coffee trade with reduced fees
- **Product Line Expansion**: Green Beans, Roasted Beans, Retail Bags support
- **User Portal Expansion**: Cooperative and Roaster portals with specialized workflows
- **Payment-at-Redemption**: Integrated payment processing for token redemption

### 🔄 **Phase 3: Advanced Features & Optimization (In Progress)**
- **ZK Privacy Agent**: Separate repository for off-chain data provision
- **AgentKit Integration**: AI-powered coffee intelligence and analytics
- **Enhanced Test Coverage**: Debugging remaining 7 failing payment integration tests
- **Frontend-Backend Alignment**: Database schema optimization and API consistency
- **Multi-chain Deployment**: Cross-chain coffee token transfers
- **Mobile Application**: Native mobile app for all user types

---

## 🛠️ **Technology Stack**

### **Blockchain & Web3**
- **Solidity** `^0.8.18` - Smart contract development
- **Foundry** - Development, testing, and deployment framework
- **OpenZeppelin** - Security-audited contract libraries
- **Chainlink** - Oracle services for off-chain verification
- **Base** - L2 scaling solution for efficient transactions

### **Zero-Knowledge Proofs**
- **Circom** `^2.1.4` - Circuit design language
- **snarkjs** `^0.7.0` - Proof generation and verification
- **Groth16** - Efficient proof system for production use

### **Frontend & User Interface**
- **Next.js** `14` - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ethers.js** `v6` - Ethereum interaction library
- **MetaMask/WalletConnect** - Wallet integration

### **Backend & Storage**
- **PostgreSQL** (Neon) - User data and analytics
- **Drizzle ORM** - Type-safe database operations
- **IPFS** (Pinata) - Decentralized metadata storage
- **Netlify/Vercel** - Deployment and hosting

### **Development & DevOps**
- **GitHub Projects** - Comprehensive project management
- **GitHub Actions** - CI/CD automation
- **Tenderly** - Smart contract monitoring
- **Hardhat/Foundry** - Development and testing tools

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- **Node.js** 18+ and npm
- **Git** for repository management
- **MetaMask** wallet with Base Sepolia testnet
- **Base Sepolia ETH** for testing (from faucet)

### **1. Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/wagatoken/wagatoken.git
cd wagatoken

# Install dependencies
npm install

# Frontend setup
cd frontend
npm install
```

### **2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.local

# Configure required variables:
# - PINATA_JWT=your_pinata_jwt_token
# - NETLIFY_DATABASE_URL=your_database_connection
# - CHAINLINK_SUBSCRIPTION_ID=your_subscription_id
```

### **3. Smart Contract Deployment**
```bash
# Compile contracts
forge build

# Run tests
forge test

# Deploy to Base Sepolia (testnet)
forge script script/DeployWagaToken.s.sol --rpc-url base-sepolia --broadcast --verify

# Deploy to Base Mainnet (production)
forge script script/DeployWagaToken.s.sol --rpc-url base --broadcast --verify
```

### **4. ZK Circuit Setup**
```bash
# Navigate to circuits directory
cd circuits

# Install Circom dependencies
npm install

# Complete trusted setup ceremony
node continue-ceremony.js

# Compile circuits
node build-circuits.js

# Generate cryptographic verifiers
node generate-verifiers-only.js

# Test circuits
node test-circuits.js
```

#### **ZK Circuit Specifications**
- **PricePrivacyCircuit**: 3 public signals, 33 non-linear constraints
- **QualityTierCircuit**: 3 public signals, 35 non-linear constraints
- **SupplyChainPrivacyCircuit**: 5 public signals, 7 total constraints
- **Trusted Setup**: Complete Powers of Tau ceremony executed
- **Verifiers**: Production-ready Groth16 elliptic curve pairing contracts

### **5. Frontend Development**
```bash
# Start development server
cd frontend
npm run dev

# Open in browser
open http://localhost:3001
```

### **6. Production Deployment**
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify/Vercel
# Configure environment variables in deployment platform
```

---

## 📊 **Smart Contract Addresses**

### **Base Sepolia (Testnet)**
- **WAGACoffeeTokenCore**: `0xB1D14D241028bFbbA1eEA928B451Cb1d10DfA016`
- **WAGABatchManager**: Deployed and integrated
- **WAGAZKManager**: Deployed and integrated
- **PrivacyLayer**: Deployed and integrated
- **WAGATreasury**: Deployed with USDC integration
- **WAGACoffeeRedemption**: Deployed with payment verification
- **WAGACDPIntegration**: Deployed with Coinbase integration
- **WAGAProofOfReserve**: `0x4e7164E037464fFccF45b69E3c6246482E024A89`
- **WAGAInventoryManagerMVP**: `0x03dd8b6C292c8c0Da412d0944E0f11Fb08393F33`
- **CircomVerifier**: Deployed with cryptographic verification
- **PricePrivacyCircuitVerifier**: Deployed with ZK proof validation
- **QualityTierCircuitVerifier**: Deployed with quality verification
- **SupplyChainPrivacyCircuitVerifier**: Deployed with supply chain verification

All contracts verified on [BaseScan](https://sepolia.basescan.org/).

### **Base Mainnet (Production)**
*Contracts will be deployed upon mainnet launch*

---

## 🤝 **Contributing to WAGA Coffee Platform**

We welcome contributions from developers, coffee industry professionals, and blockchain enthusiasts!

### **🎯 Development Workflow**

#### **1. GitHub Projects Setup**
- Follow `GITHUB_PROJECTS_IMPLEMENTATION_GUIDE.md` for project board setup
- Use specialized issue templates for different components
- Track progress through automated project management

#### **2. Issue Creation**
Use our specialized templates:
- **🚀 Feature Request** - New platform features
- **🐛 Bug Report** - System issues and fixes
- **⚡ Smart Contract Task** - Solidity development
- **🎨 Frontend Task** - UI/UX improvements
- **⚡ ZK Circuit Task** - Privacy circuit development

#### **3. Development Phases**
- **Phase 1**: Processor integration and payment processing
- **Phase 2**: ZK enhancement and bulk coffee support  
- **Phase 3**: Advanced DeFi features and cross-chain deployment

#### **4. Code Standards**
- **Smart Contracts**: Follow OpenZeppelin patterns, comprehensive testing
- **Frontend**: TypeScript strict mode, responsive design, accessibility
- **ZK Circuits**: Security-first development, formal verification
- **Documentation**: Clear, comprehensive, regularly updated

### **📚 Development Resources**
- **Architecture Guide**: `PROJECT_TASKS.md` - Detailed task breakdown
- **Setup Instructions**: `GITHUB_PROJECTS_SETUP.md` - Project management
- **Issue Templates**: `.github/ISSUE_TEMPLATE/` - Structured contributions
- **Deployment Guide**: `script/` - Smart contract deployment
- **Circuit Documentation**: `circuits/` - ZK proof implementation

### **🔄 Contribution Process**
1. **Fork** the repository
2. **Create** feature branch following naming conventions
3. **Implement** changes with comprehensive tests
4. **Submit** pull request with detailed description
5. **Review** process with automated and manual verification

---

## 📖 **Project Documentation**

### **📋 Core Documentation**
- **`README.md`** - This comprehensive overview
- **`PROJECT_TASKS.md`** - Detailed development roadmap (472 lines)
- **`GITHUB_PROJECTS_SETUP.md`** - Project management setup
- **`GITHUB_PROJECTS_IMPLEMENTATION_GUIDE.md`** - Step-by-step implementation

### **🔧 Technical Documentation**
- **Smart Contracts**: Comprehensive NatSpec documentation in `/src`
- **Frontend Components**: TypeScript interfaces and component docs
- **ZK Circuits**: Circuit specifications and security proofs in `/circuits`
- **API Endpoints**: REST API documentation in `/frontend/app/api`

### **📊 Status and Monitoring**
- **Live Platform**: Track development at project boards
- **Smart Contract Monitoring**: Tenderly dashboard integration
- **Performance Metrics**: Platform analytics and user engagement
- **Quality Metrics**: Test coverage and deployment success rates

---

## 🛡️ **Security & Auditing**

### **🔒 Security Measures**
- **Smart Contract Auditing**: OpenZeppelin library usage, formal verification
- **ZK Circuit Security**: Mathematical proof verification, constraint analysis
- **Frontend Security**: Input sanitization, XSS prevention, secure wallet integration
- **Infrastructure Security**: Environment variable management, API rate limiting

### **🧪 Testing Framework**
- **Unit Tests**: Comprehensive coverage for all smart contracts
- **Integration Tests**: End-to-end workflow verification
- **ZK Circuit Tests**: Constraint satisfaction and proof verification
- **Frontend Tests**: Component testing and user workflow validation

### **📈 Quality Assurance**
- **Automated Testing**: GitHub Actions CI/CD pipeline
- **Code Review**: Mandatory peer review for all changes
- **Security Scanning**: Automated vulnerability detection
- **Performance Monitoring**: Real-time system performance tracking

---

## 🎯 **Business Model & Economics**

### **💰 Revenue Streams**
- **Batch Creation Fees**: Processors pay for tokenization services
- **Verification Fees**: WAGA verification and quality assurance
- **Redemption Fees**: Distribution and fulfillment services
- **Trade Finance**: Interest on collateralized coffee token lending

### **🏆 Value Proposition**
- **For Farmers**: Fair pricing through transparent marketplace
- **For Processors**: Global distribution without revealing trade secrets
- **For Distributors**: Verified quality with competitive pricing access
- **For Consumers**: Complete traceability and quality assurance

### **🌍 Market Impact**
- **Supply Chain Transparency**: End-to-end coffee journey tracking
- **Fair Trade**: Direct farmer compensation without intermediary exploitation
- **Quality Assurance**: Blockchain-verified quality standards
- **Global Access**: Worldwide coffee trading without geographical barriers

---

## 📞 **Community & Support**

### **🤝 Get Involved**
- **Discord**: Join our developer community
- **GitHub Discussions**: Technical discussions and feature requests
- **Twitter**: Follow [@WAGAToken](https://x.com/Wagatoken?t=DJ-g5RE824iE4dpeTUHc7w&s=09) for updates
- **Documentation**: Contribute to platform documentation

### **💬 Support Channels**
- **Technical Issues**: GitHub Issues with appropriate templates
- **Business Inquiries**: Contact through official channels
- **Security Reports**: Dedicated security disclosure process
- **General Questions**: Community Discord and discussions

### **🎯 Roadmap & Updates**
- **Quarterly Reviews**: Progress reports and milestone achievements
- **Community Calls**: Regular developer and stakeholder meetings
- **Feature Requests**: Community-driven development priorities
- **Partnership Announcements**: Strategic collaborations and integrations

---

## 📄 **License & Legal**

### **📜 Open Source License**
This project is licensed under the **MIT License** - see the `LICENSE` file for details.

### **⚖️ Compliance**
- **Data Privacy**: GDPR and CCPA compliant data handling
- **Financial Regulations**: Compliance with applicable DeFi regulations
- **International Trade**: Coffee import/export regulation compliance
- **Smart Contract Auditing**: Professional security audits before mainnet deployment


*Every bean tracked, every cup trusted.* ☕

---

## 📊 **Platform Statistics**

- **🏗️ Smart Contracts**: 14+ deployed and verified with comprehensive integration
- **☕ Coffee Batches**: 10+ tracked and tokenized across 3 product lines
- **🔐 ZK Circuits**: 3 privacy-preserving proof systems with real cryptography
- **🔐 Cryptographic Verifiers**: 4 Groth16 elliptic curve pairing contracts
- **💰 Payment Integration**: Coinbase Commerce, CDP, and Treasury systems
- **🎭 Privacy Levels**: Selective transparency with competitive protection
- **👥 User Portals**: 5 specialized interfaces (Admin, Cooperative, Processor, Roaster, Distributor)
- **📋 Development Tasks**: 40+ structured project items completed
- **🛠️ Components**: 25+ reusable frontend components
- **✅ Test Coverage**: 83/90 tests passing (92.2% success rate, 7 payment integration tests to debug)
- **🚀 Deployment**: Automated CI/CD pipeline with ZK integration and payment processing

*Building the future of coffee, one block at a time.* 🚀
