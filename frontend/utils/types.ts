export interface CoffeeBatch {
  batchId: number;
  quantity: number;
  price: number;
  packaging: string;
  metadataHash: string;
  ipfsUri?: string; // Added to match smart contract
  verification: {
    lastVerified: string;
    verificationStatus: 'pending' | 'verified' | 'failed';
    inventoryActual: number;
  };
  batchDetails: {
    farmName: string;
    location: string;
    productionDate: string; // Changed from harvestDate to match smart contract
    expiryDate: string;
    processingMethod?: string;
    qualityScore?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChainlinkFunctionsResponse {
  quantity: number;
  price: number;
  packaging: string;
  metadataHash: string;
}

export interface VerificationRequest {
  batchId: number;
  requestId: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export interface ChainlinkFunctionsRequest {
  requestId: string;
  batchId: number;
  verificationType: 'reserve' | 'inventory';
  status: 'pending' | 'fulfilled' | 'failed';
  submittedAt: string;
  completedAt?: string;
  result?: ChainlinkFunctionsResult;
  error?: string;
  transactionHash?: string;
}

export interface ChainlinkFunctionsResult {
  verifiedQuantity: number;
  verifiedPrice: number;
  verifiedPackaging: string;
  verifiedMetadataHash: string;
  verified: boolean;
}

export interface ChainlinkConfig {
  subscriptionId: string;
  donId: string;
  routerAddress: string;
  proofOfReserveAddress: string;
  inventoryManagerAddress: string;
}

export interface RedemptionRequest {
  redemptionId: number;
  consumer: string;
  batchId: number;
  quantity: number;
  deliveryAddress: string;
  requestDate: string;
  status: 'Requested' | 'Processing' | 'Fulfilled' | 'Cancelled';
  fulfillmentDate?: string;
  packagingInfo?: string;
}

export interface UserTokenBalance {
  batchId: number;
  balance: number;
  batchDetails: {
    farmName: string;
    location: string;
    packaging: string;
    pricePerUnit: number;
  };
}

export interface RedemptionFormData {
  batchId: number;
  quantity: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryCountry: string;
  specialInstructions?: string;
}

// Add smart contract interaction types
export interface SmartContractBatch {
  productionDate: number; // Unix timestamp
  expiryDate: number; // Unix timestamp
  isVerified: boolean;
  currentQuantity: number;
  pricePerUnit: number; // In wei
  packagingInfo: string;
  metadataHash: string;
  isMetadataVerified: boolean;
  lastVerifiedTimestamp: number;
}

export interface ContractConfig {
  coffeeTokenAddress: string;
  proofOfReserveAddress: string;
  inventoryManagerAddress: string;
  redemptionContractAddress: string;
}
