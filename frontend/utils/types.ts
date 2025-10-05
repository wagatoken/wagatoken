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

// ZK Proof System Types - matching IZKVerifier.sol interface
export enum ProofType {
  PRICE_COMPETITIVENESS = 0,
  QUALITY_STANDARDS = 1,
  SUPPLY_CHAIN_PROVENANCE = 2,
  EUDR_DEFORESTATION_COMPLIANCE = 3,
  EUDR_GEOLOCATION_VERIFICATION = 4,
  ECTA_PERMIT_VALIDITY = 5,
  QUALITY_CERTIFICATE_AUTHENTICITY = 6,
  ORIGIN_VERIFICATION_PROOF = 7,
  BOE_FOREX_COMPLIANCE = 8
}

export interface BatchProofStatus {
  priceVerified: boolean;
  qualityVerified: boolean;
  supplyChainVerified: boolean;
  eudrDeforestationVerified: boolean;
  eudrGeolocationVerified: boolean;
  ethiopianComplianceVerified: boolean;
}

export interface ZKProofData {
  proofType: ProofType;
  proofHash: string;
  verified: boolean;
  verificationTimestamp: number;
  circuitName: string;
  publicSignals?: string[];
}

export interface CircuitVerifier {
  name: string;
  address: string;
  proofType: ProofType;
  description: string;
}

// Circuit verification mapping
export const CIRCUIT_VERIFIERS: CircuitVerifier[] = [
  {
    name: "PricePrivacyCircuitVerifier",
    address: "", // To be filled from deployment
    proofType: ProofType.PRICE_COMPETITIVENESS,
    description: "Verifies price competitiveness while maintaining privacy"
  },
  {
    name: "QualityTierCircuitVerifier", 
    address: "",
    proofType: ProofType.QUALITY_STANDARDS,
    description: "Verifies quality tier certifications"
  },
  {
    name: "SupplyChainPrivacyCircuitVerifier",
    address: "",
    proofType: ProofType.SUPPLY_CHAIN_PROVENANCE,
    description: "Verifies supply chain provenance while protecting sensitive data"
  },
  {
    name: "EUDRDeforestationCircuitVerifier",
    address: "",
    proofType: ProofType.EUDR_DEFORESTATION_COMPLIANCE,
    description: "Verifies EUDR deforestation compliance"
  },
  {
    name: "EUDRGeolocationCircuitVerifier",
    address: "",
    proofType: ProofType.EUDR_GEOLOCATION_VERIFICATION,
    description: "Verifies EUDR geolocation requirements"
  },
  {
    name: "EthiopianComplianceCircuitVerifier",
    address: "",
    proofType: ProofType.ECTA_PERMIT_VALIDITY,
    description: "Verifies Ethiopian export compliance including ECTA permits, quality certificates, origin verification, and BOE forex compliance"
  }
];
