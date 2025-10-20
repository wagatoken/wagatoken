# Required Environment Variables for Frontend

## Database
- `DATABASE_URL` - PostgreSQL database connection
- `NETLIFY_DATABASE_URL` - Netlify-specific database URL (auto-generated)

## Core Smart Contracts (CRITICAL - used in smartContracts.ts)
- `NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS` - Main coffee token contract
- `NEXT_PUBLIC_WAGA_COFFEE_VIEWS_ADDRESS` - Data access contract
- `NEXT_PUBLIC_WAGA_BATCH_OPERATIONS_ADDRESS` - Batch operations contract
- `NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS` - Proof of reserve contract
- `NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS` - Inventory management
- `NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS` - Coffee redemption
- `NEXT_PUBLIC_WAGA_TREASURY_ADDRESS` - Treasury operations
- `NEXT_PUBLIC_WAGA_CONFIG_MANAGER_ADDRESS` - Configuration management

## Banking & Financial (CRITICAL - used in banking integration)
- `NEXT_PUBLIC_WAGA_BANKING_CORE_ADDRESS` - USD/ETB conversion, banking operations
- `NEXT_PUBLIC_WAGA_CDP_INTEGRATION_ADDRESS` - CDP integration

## ZK Privacy System
- `NEXT_PUBLIC_WAGA_ZK_MANAGER_ADDRESS` - ZK proof management
- `NEXT_PUBLIC_PRIVACY_LAYER_ADDRESS` - Privacy layer contract
- `NEXT_PUBLIC_CIRCOM_VERIFIER_ADDRESS` - Circuit verification
- `NEXT_PUBLIC_PRICE_PRIVACY_VERIFIER_ADDRESS` - Price privacy proofs
- `NEXT_PUBLIC_QUALITY_TIER_VERIFIER_ADDRESS` - Quality verification
- `NEXT_PUBLIC_SUPPLY_CHAIN_VERIFIER_ADDRESS` - Supply chain proofs

## Ethiopian Compliance
- `NEXT_PUBLIC_WAGA_ETHIOPIAN_COMPLIANCE_CORE_ADDRESS` - Ethiopian compliance

## Chainlink Integration
- `NEXT_PUBLIC_CHAINLINK_DON_ID` - Chainlink DON identifier
- `NEXT_PUBLIC_CHAINLINK_ROUTER_ADDRESS` - Chainlink router contract
- `NEXT_PUBLIC_CHAINLINK_ROUTER` - Alternative router env var
- `NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID` - Chainlink subscription
- `NEXT_PUBLIC_CHAINLINK_GAS_LIMIT` - Gas limit (optional, defaults to 300000)

## Network Configuration
- `NEXT_PUBLIC_CHAIN_ID` - Blockchain network ID
- `NEXT_PUBLIC_RPC_URL` - RPC endpoint URL
- `NEXT_PUBLIC_NETWORK_NAME` - Human readable network name
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` - Specific RPC for Base Sepolia

## IPFS/Storage
- `NEXT_PUBLIC_PINATA_JWT` - Pinata JWT token for IPFS
- `NEXT_PUBLIC_GATEWAY_URL` - IPFS gateway URL
- `PINATA_JWT` - Server-side Pinata JWT (fallback)

## API Configuration
- `NEXT_PUBLIC_API_BASE_URL` - Base URL for API calls
- `NEXT_PUBLIC_API_TIMEOUT` - API timeout setting

## Optional/Less Critical
- `NEXT_PUBLIC_COINBASE_API_KEY` - Coinbase integration (if used)
- `NEXT_PUBLIC_INVENTORY_MANAGER_ADDRESS` - Alternative inventory manager
- `NEXT_PUBLIC_PROOF_OF_RESERVE_ADDRESS` - Alternative proof of reserve

## Build Configuration (Netlify)
- `NODE_VERSION` - Node.js version
- `NPM_CONFIG_PRODUCTION` - NPM configuration
- `NPM_CONFIG_LEGACY_PEER_DEPS` - NPM legacy peer deps
- `NEXT_PRIVATE_STANDALONE` - Next.js standalone mode