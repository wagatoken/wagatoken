// Contract addresses and configuration for Base Sepolia deployment
export const CONTRACTS = {
  // Core Contracts
  WAGACoffeeTokenCore: '0x1Ec1Cf49a01Ecac84E15b89321c79aEd0Afc67ec',
  WAGACoffeeViews: '0xb17701f6E819724683A3633F4a8743ae226CD5b7',
  
  // Management Contracts
  WAGABatchManager: '0x0604bD16E816323BCe84481612f5b4517a2654a8',
  WAGAZKManager: '0xd8F264B4e7FBCE17dd0D3491D1684Ec5F630c023',
  PrivacyLayer: '0xA7d5D48eD8549E48001F82F7c477D0D22893d453',
  
  // Financial Contracts
  WAGATreasury: '0xE83d8f2B6c0583ccDaB2F4f9a1B51b6cCB1edff9',
  WAGACoffeeRedemption: '0x713a778C978b0b4Ce6F90a9E5b73ec58c86b0568',
  WAGACDPIntegration: '0x063BF20CeDC4C4067D788e1452e5272B43EFa7A5',
  
  // Operational Contracts
  WAGAProofOfReserve: '0xe118d0b9285265ffe2912bA7958A4d40A047AcdB',
  WAGAInventoryManagerMVP: '0x4db07F076b73d0d9c4EFCcD56AAe418f034538f6',
  
  // ZK Verifier Contracts
  CircomVerifier: '0x7020dCe4c666dC092671796643a56AF6CF744dc8',
  PriceVerifier: '0x20f35e42ef87E3e73c53c3b0514052E217Ecd339',
  QualityVerifier: '0xaBDDD851b6d4DD6585f45EEEAda0fA08390Db74E',
  SupplyChainVerifier: '0xc24EDB0D8dC46c34474852B56e3d1287e4401501',
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 84532, // Base Sepolia
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
} as const;

// Contract roles (bytes32 hashed values)
export const ROLES = {
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  ADMIN_ROLE: '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775',
  PROCESSOR_ROLE: '0x6d0ff0d7b05c65e4a2dd54cfc3ad2caa89a9e33bbd82bb17b8b4f59b72d99f0a',
  MINTER_ROLE: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
  DISTRIBUTOR_ROLE: '0x8a4fc8d7b7c80bb5bb7b1fcc2c89b2cc15ff5c3c4fcadfbae7f93e7f2a17e5b4',
  VERIFIER_ROLE: '0x2b34d2b5e2a5b4c4f4ba0e4a8e4b7a6b3e6b9e7b8e2e6e2e4a6b8e6e2a4b6e8',
  FULFILLER_ROLE: '0x2b34d2b5e2a5b4c4f4ba0e4a8e4b7a6b3e6b9e7b8e2e6e2e4a6b8e6e2a4b6e9',
  REDEMPTION_ROLE: '0x7b4c5a8e6e2a4b6e8a6b8e2a4b6e8e6e2a4b6e8a6b8e2a4b6e8a6b8e2a4b6e8',
} as const;

// Batch info structure for type safety
export interface BatchInfo {
  productionDate: bigint;
  expiryDate: bigint;
  isVerified: boolean;
  quantity: bigint;
  pricePerUnit: bigint;
  packagingInfo: string;
  metadataHash: string;
  isMetadataVerified: boolean;
  lastVerifiedTimestamp: bigint;
}

// Redemption request structure
export interface RedemptionRequest {
  consumer: string;
  batchId: bigint;
  quantity: bigint;
  requestDate: bigint;
  status: number; // 0: Requested, 1: Processing, 2: Fulfilled, 3: Cancelled
  fulfillmentDate: bigint;
}

// Privacy configuration structure
export interface PrivacyConfig {
  level: number; // 0: Public, 1: Protected, 2: Private
  pricingPrivate: boolean;
  qualityPrivate: boolean;
  supplyChainPrivate: boolean;
  pricingClaim: string;
  qualityClaim: string;
  supplyChainClaim: string;
}

// Treasury payment info
export interface PaymentInfo {
  required: bigint;
  collected: bigint;
}

// Contract event types
export interface BatchCreatedEvent {
  batchId: bigint;
  creator: string;
  quantity: bigint;
  pricePerUnit: bigint;
  metadataURI: string;
}

export interface RedemptionRequestedEvent {
  redemptionId: bigint;
  consumer: string;
  batchId: bigint;
  quantity: bigint;
  packagingInfo: string;
}

export interface PaymentReceivedEvent {
  payer: string;
  batchId: bigint;
  amount: bigint;
  timestamp: bigint;
}
