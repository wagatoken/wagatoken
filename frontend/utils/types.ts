export interface CoffeeBatch {
  batchId: number;
  quantity: number;
  price: number;
  packaging: string;
  metadataHash: string;
  verification: {
    lastVerified: string;
    verificationStatus: 'pending' | 'verified' | 'failed';
    inventoryActual: number;
  };
  batchDetails: {
    farmName: string;
    location: string;
    harvestDate: string;
    expiryDate: string;
    processingMethod?: string;
    qualityScore?: number;
  };
  ipfsHash?: string;
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
