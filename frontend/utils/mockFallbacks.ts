/**
 * Mock fallback implementations for when blockchain/IPFS are not available
 * These maintain the same interface as the real smart contract functions
 * but provide dummy data for development/testing purposes
 */

import { BatchCreationData, CoffeeBatchMetadata } from './ipfsMetadata';

export interface ExtendedBatchCreationData extends BatchCreationData {
  productType?: 'RETAIL_BAGS' | 'GREEN_BEANS' | 'ROASTED_BEANS';
  unitWeight?: string;
  moistureContent?: number;
  density?: number;
  defectCount?: number;
  cooperativeId?: string;
  processorId?: string;
}

// Track if we're in mock mode
let isMockMode = false;
let mockBatches: Map<string, any> = new Map();
let mockBatchCounter = 1;

export function setMockMode(enabled: boolean) {
  isMockMode = enabled;
  console.log(`🎭 Mock mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
}

export function isMockModeEnabled(): boolean {
  return isMockMode;
}

// Mock data generators
function generateMockBatchId(): string {
  const id = mockBatchCounter++;
  return id.toString();
}

function generateMockTransactionHash(): string {
  return '0x' + Math.random().toString(16).substr(2, 64);
}

function generateMockIPFSUri(): string {
  return `ipfs://Qm${Math.random().toString(36).substr(2, 44)}`;
}

function generateMockMetadataHash(): string {
  return Math.random().toString(16).substr(2, 64);
}

// Mock implementations that mirror the real smart contract functions

export async function mockCreateBatchBlockchainFirst(
  batchData: BatchCreationData | ExtendedBatchCreationData
): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
  qrCodeDataUrl: string;
  verificationQR: string;
}> {
  console.log('🎭 Mock: Creating batch (blockchain-first simulation)...');
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const batchId = generateMockBatchId();
  const transactionHash = generateMockTransactionHash();
  const ipfsUri = generateMockIPFSUri();
  const metadataHash = generateMockMetadataHash();
  
  // Store mock batch data
  const mockBatch = {
    ...batchData,
    batchId,
    transactionHash,
    ipfsUri,
    metadataHash,
    isVerified: false,
    isMetadataVerified: true,
    productType: 'productType' in batchData ? batchData.productType : 'RETAIL_BAGS',
    createdAt: new Date(),
    privacyLevel: 0,
    zkProofs: []
  };
  
  mockBatches.set(batchId, mockBatch);
  
  // Generate mock QR codes (base64 placeholder)
  const qrCodeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const verificationQR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  console.log(`🎭 Mock: Batch ${batchId} created successfully`);
  
  return {
    batchId,
    ipfsUri,
    metadataHash,
    transactionHash,
    qrCodeDataUrl,
    verificationQR
  };
}

export async function mockGetActiveBatchIds(): Promise<string[]> {
  console.log('🎭 Mock: Fetching active batch IDs...');
  return Array.from(mockBatches.keys());
}

export async function mockGetBatchInfoWithMetadata(batchId: string): Promise<{
  batchId: string;
  name: string;
  origin: string;
  farmer: string;
  quantity: number;
  packagingInfo: string;
  pricePerUnit: string;
  isVerified: boolean;
  isMetadataVerified: boolean;
  metadata?: CoffeeBatchMetadata;
  productType?: string;
  unitWeight?: string;
  privacyLevel?: number;
}> {
  console.log(`🎭 Mock: Fetching batch info for ${batchId}...`);
  
  const batch = mockBatches.get(batchId);
  if (!batch) {
    throw new Error(`Mock batch ${batchId} not found`);
  }
  
  // Generate mock metadata
  const metadata: CoffeeBatchMetadata = {
    name: batch.name || `Coffee Batch #${batchId}`,
    description: batch.description || 'Premium coffee batch created in mock mode',
    image: `https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Batch+${batchId}`,
    external_url: `https://waga.coffee/batch/${batchId}`,
    attributes: [
      { trait_type: 'Origin', value: batch.origin || 'Mock Origin' },
      { trait_type: 'Quality Grade', value: batch.qualityGrade || 'AA' },
      { trait_type: 'Processing Method', value: batch.processingMethod || 'Washed' },
      { trait_type: 'Batch Size', value: batch.quantity?.toString() || '100' },
      { trait_type: 'Product Type', value: batch.productType || 'RETAIL_BAGS' }
    ],
    properties: {
      batchId,
      blockchainId: batchId,
      productType: batch.productType || 'RETAIL_BAGS',
      unitWeight: batch.unitWeight || batch.packagingInfo || '250g',
      farmer: batch.farmer || 'Mock Farmer',
      origin: batch.origin || 'Mock Origin',
      quantity: batch.quantity || 100,
      pricePerUnit: batch.pricePerUnit || '25.00',
      packagingInfo: batch.packagingInfo || '250g',
      isVerified: batch.isVerified || false,
      createdAt: batch.createdAt?.toISOString() || new Date().toISOString()
    }
  };
  
  return {
    batchId,
    name: metadata.name,
    origin: batch.origin || 'Mock Origin',
    farmer: batch.farmer || 'Mock Farmer',
    quantity: batch.quantity || 100,
    packagingInfo: batch.packagingInfo || '250g',
    pricePerUnit: batch.pricePerUnit || '25.00',
    isVerified: batch.isVerified || false,
    isMetadataVerified: batch.isMetadataVerified || true,
    metadata,
    productType: batch.productType || 'RETAIL_BAGS',
    unitWeight: batch.unitWeight || batch.packagingInfo || '250g',
    privacyLevel: batch.privacyLevel || 0
  };
}

export async function mockRequestBatchVerification(
  batchId: string,
  recipient: string
): Promise<{ requestId: string; transactionHash: string }> {
  console.log(`🎭 Mock: Requesting verification for batch ${batchId}...`);
  
  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const batch = mockBatches.get(batchId);
  if (batch) {
    batch.isVerified = true;
    batch.verificationDate = new Date();
    mockBatches.set(batchId, batch);
  }
  
  return {
    requestId: '0x' + Math.random().toString(16).substr(2, 64),
    transactionHash: generateMockTransactionHash()
  };
}

export async function mockGetUserBatchBalance(address: string, batchId: string): Promise<number> {
  console.log(`🎭 Mock: Getting user balance for batch ${batchId}...`);
  
  const batch = mockBatches.get(batchId);
  if (batch && batch.isVerified) {
    return Math.floor(Math.random() * 10) + 1; // Random balance 1-10
  }
  return 0;
}

export async function mockRequestCoffeeRedemption(
  batchId: string,
  quantity: number,
  deliveryAddress: string
): Promise<{ redemptionId: string; transactionHash: string }> {
  console.log(`🎭 Mock: Requesting redemption for ${quantity} tokens of batch ${batchId}...`);
  
  // Simulate redemption delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    redemptionId: '0x' + Math.random().toString(16).substr(2, 64),
    transactionHash: generateMockTransactionHash()
  };
}

export async function mockGetUserRoles(): Promise<{
  isAdmin: boolean;
  isVerifier: boolean;
  isMinter: boolean;
  isRedemption: boolean;
  isFulfiller: boolean;
}> {
  console.log('🎭 Mock: Getting user roles...');
  
  // In mock mode, give admin all roles for testing
  return {
    isAdmin: true,
    isVerifier: true,
    isMinter: true,
    isRedemption: true,
    isFulfiller: true
  };
}

// ZK Mock Functions
export async function mockSetBatchPrivacyLevel(
  batchId: string,
  privacyLevel: number
): Promise<{ transactionHash: string }> {
  console.log(`🎭 Mock: Setting privacy level ${privacyLevel} for batch ${batchId}...`);
  
  const batch = mockBatches.get(batchId);
  if (batch) {
    batch.privacyLevel = privacyLevel;
    mockBatches.set(batchId, batch);
  }
  
  return {
    transactionHash: generateMockTransactionHash()
  };
}

export async function mockGetBatchPrivacyLevel(batchId: string): Promise<number> {
  console.log(`🎭 Mock: Getting privacy level for batch ${batchId}...`);
  
  const batch = mockBatches.get(batchId);
  return batch?.privacyLevel || 0;
}

export async function mockSetBatchPrivacy(
  batchId: string,
  pricingLevel: number,
  qualityLevel: number,
  supplyChainLevel: number
): Promise<{ transactionHash: string }> {
  console.log(`🎭 Mock: Setting batch privacy config for ${batchId}...`);
  
  const batch = mockBatches.get(batchId);
  if (batch) {
    batch.privacyConfig = {
      pricingLevel,
      qualityLevel,
      supplyChainLevel,
      creator: '0x1234567890123456789012345678901234567890'
    };
    mockBatches.set(batchId, batch);
  }
  
  return {
    transactionHash: generateMockTransactionHash()
  };
}

export async function mockGetBatchPublicClaims(batchId: string): Promise<{
  pricingDisplay: string;
  qualityDisplay: string;
  supplyChainDisplay: string;
}> {
  console.log(`🎭 Mock: Getting public claims for batch ${batchId}...`);
  
  const batch = mockBatches.get(batchId);
  const config = batch?.privacyConfig;
  
  return {
    pricingDisplay: config?.pricingLevel === 0 ? 'Public: $25.00' : 'Private: Range verified',
    qualityDisplay: config?.qualityLevel === 0 ? 'Public: Grade AA' : 'Private: Quality verified',
    supplyChainDisplay: config?.supplyChainLevel === 0 ? 'Public: Full trace' : 'Private: Chain verified'
  };
}

export async function mockVerifyZKProof(): Promise<boolean> {
  console.log('🎭 Mock: Verifying ZK proof...');
  
  // Simulate proof verification delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Random success/failure for testing
  return Math.random() > 0.2; // 80% success rate
}

export async function mockGetBatchProductType(batchId: string): Promise<number> {
  console.log(`🎭 Mock: Getting product type for batch ${batchId}...`);
  
  const batch = mockBatches.get(batchId);
  const productTypeMap: { [key: string]: number } = {
    'RETAIL_BAGS': 0,
    'GREEN_BEANS': 1,
    'ROASTED_BEANS': 2
  };
  
  return productTypeMap[batch?.productType || 'RETAIL_BAGS'] || 0;
}

export async function mockGetBatchUnitWeight(batchId: string): Promise<string> {
  console.log(`🎭 Mock: Getting unit weight for batch ${batchId}...`);
  
  const batch = mockBatches.get(batchId);
  return batch?.unitWeight || batch?.packagingInfo || '250g';
}

// Add some initial mock data for demo purposes
export function initializeMockData() {
  if (mockBatches.size === 0) {
    console.log('🎭 Initializing mock data...');
    
    // Create a few sample batches
    const sampleBatches = [
      {
        batchId: '1',
        name: 'Ethiopian Yirgacheffe',
        origin: 'Yirgacheffe, Ethiopia',
        farmer: 'Tadesse Cooperative',
        quantity: 150,
        packagingInfo: '250g',
        pricePerUnit: '28.50',
        productType: 'RETAIL_BAGS',
        unitWeight: '250g',
        isVerified: true,
        isMetadataVerified: true,
        privacyLevel: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        batchId: '2',
        name: 'Colombian Huila Premium',
        origin: 'Huila, Colombia',
        farmer: 'Finca El Paraiso',
        quantity: 200,
        packagingInfo: '500g',
        pricePerUnit: '32.00',
        productType: 'RETAIL_BAGS',
        unitWeight: '500g',
        isVerified: false,
        isMetadataVerified: true,
        privacyLevel: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        batchId: '3',
        name: 'Guatemalan Green Beans',
        origin: 'Antigua, Guatemala',
        farmer: 'Cooperativa La Hermandad',
        quantity: 50,
        packagingInfo: '60kg',
        pricePerUnit: '240.00',
        productType: 'GREEN_BEANS',
        unitWeight: '60kg',
        isVerified: true,
        isMetadataVerified: true,
        privacyLevel: 2,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ];
    
    sampleBatches.forEach(batch => {
      mockBatches.set(batch.batchId, batch);
      if (batch.batchId === '3') {
        mockBatchCounter = 4; // Set counter to continue from here
      }
    });
    
    console.log(`🎭 Initialized ${sampleBatches.length} mock batches`);
  }
}

// Reset mock data (useful for testing)
export function resetMockData() {
  mockBatches.clear();
  mockBatchCounter = 1;
  console.log('🎭 Mock data reset');
}

// Get mock statistics
export function getMockStats() {
  const batches = Array.from(mockBatches.values());
  const verifiedBatches = batches.filter(b => b.isVerified);
  const totalSupply = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
  
  return {
    totalBatches: batches.length,
    activeBatches: batches.filter(b => !b.isVerified).length,
    verifiedBatches: verifiedBatches.length,
    totalSupply,
    redemptionRate: verifiedBatches.length > 0 ? Math.round((verifiedBatches.length / batches.length) * 100) : 0
  };
}
