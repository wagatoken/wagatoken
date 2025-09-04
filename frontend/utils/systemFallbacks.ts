/**
 * WAGA System Fallback Solutions
 * Provides mock implementations when blockchain, IPFS, or database are unavailable
 */

import { BatchCreationData, CoffeeBatchMetadata } from './ipfsMetadata';
import { BatchInfo, VerificationRequest, RedemptionRequest, ExtendedBatchCreationData } from './smartContracts';

// System status interface
export interface SystemStatus {
  blockchain: boolean;
  ipfs: boolean;
  database: boolean;
  chainlink: boolean;
}

// Mock data store for fallback mode
class MockDataStore {
  private static instance: MockDataStore;
  private batches: Map<string, BatchInfo> = new Map();
  private verificationRequests: Map<string, VerificationRequest> = new Map();
  private redemptionRequests: Map<string, RedemptionRequest> = new Map();
  private userBalances: Map<string, Map<string, number>> = new Map(); // userAddress -> batchId -> balance
  private batchCounter = 1;
  private requestCounter = 1;
  private redemptionCounter = 1;

  static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  // Initialize with some sample data
  constructor() {
    this.initSampleData();
  }

  private initSampleData() {
    // Sample batches
    const sampleBatches = [
      {
        batchId: "1",
        productionDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        expiryDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
        isVerified: true,
        quantity: 100,
        pricePerUnit: "0.05",
        packagingInfo: "250g",
        metadataHash: "QmSampleHash1",
        isMetadataVerified: true,
        lastVerifiedTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        ipfsUri: "ipfs://QmSampleHash1",
      },
      {
        batchId: "2",
        productionDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
        expiryDate: Date.now() + 350 * 24 * 60 * 60 * 1000,
        isVerified: false,
        quantity: 75,
        pricePerUnit: "0.08",
        packagingInfo: "500g",
        metadataHash: "QmSampleHash2",
        isMetadataVerified: true,
        lastVerifiedTimestamp: 0,
        ipfsUri: "ipfs://QmSampleHash2",
      }
    ];

    sampleBatches.forEach(batch => this.batches.set(batch.batchId, batch));

    // Sample user balances
    const sampleAddress = "0x1234567890123456789012345678901234567890";
    const userBalances = new Map();
    userBalances.set("1", 10);
    userBalances.set("2", 5);
    this.userBalances.set(sampleAddress, userBalances);
  }

  createBatch(batchData: BatchCreationData | ExtendedBatchCreationData): {
    batchId: string;
    ipfsUri: string;
    metadataHash: string;
    transactionHash: string;
    qrCodeDataUrl: string;
    verificationQR: string;
  } {
    const batchId = this.batchCounter.toString();
    this.batchCounter++;

    const mockHash = `QmMock${batchId}${Date.now()}`;
    const mockTxHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const batch: BatchInfo = {
      batchId,
      productionDate: (batchData.productionDate instanceof Date ? batchData.productionDate.getTime() : batchData.productionDate) || Date.now(),
      expiryDate: (batchData.expiryDate instanceof Date ? batchData.expiryDate.getTime() : batchData.expiryDate) || Date.now() + 365 * 24 * 60 * 60 * 1000,
      isVerified: false,
      quantity: batchData.quantity,
      pricePerUnit: batchData.pricePerUnit.toString(),
      packagingInfo: batchData.packagingInfo,
      metadataHash: mockHash,
      isMetadataVerified: true,
      lastVerifiedTimestamp: 0,
      ipfsUri: `ipfs://${mockHash}`,
    };

    this.batches.set(batchId, batch);

    return {
      batchId,
      ipfsUri: `ipfs://${mockHash}`,
      metadataHash: mockHash,
      transactionHash: mockTxHash,
      qrCodeDataUrl: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
      verificationQR: `https://verify.waga.coffee/batch/${batchId}`
    };
  }

  getActiveBatchIds(): string[] {
    return Array.from(this.batches.keys());
  }

  getBatch(batchId: string): BatchInfo | undefined {
    return this.batches.get(batchId);
  }

  getAllBatches(): BatchInfo[] {
    return Array.from(this.batches.values());
  }

  getUserBalance(userAddress: string, batchId: string): number {
    const userBalances = this.userBalances.get(userAddress);
    return userBalances?.get(batchId) || 0;
  }

  requestVerification(batchId: string, userAddress: string): string {
    const requestId = `req_${this.requestCounter}`;
    this.requestCounter++;

    const request: VerificationRequest = {
      requestId,
      batchId,
      requestQuantity: 0,
      verifiedQuantity: 0,
      requestPrice: "0",
      verifiedPrice: "0",
      recipient: userAddress,
      completed: false,
      verified: false,
      shouldMint: false
    };

    this.verificationRequests.set(requestId, request);

    // Simulate async verification
    setTimeout(() => {
      const batch = this.batches.get(batchId);
      if (batch) {
        batch.isVerified = true;
        batch.lastVerifiedTimestamp = Date.now();
        this.batches.set(batchId, batch);

        // Mock mint tokens
        const userBalances = this.userBalances.get(userAddress) || new Map();
        const currentBalance = userBalances.get(batchId) || 0;
        userBalances.set(batchId, currentBalance + batch.quantity);
        this.userBalances.set(userAddress, userBalances);

        // Update verification request
        request.completed = true;
        request.verified = true;
        request.shouldMint = true;
        this.verificationRequests.set(requestId, request);
      }
    }, 2000); // 2 second delay

    return requestId;
  }

  requestRedemption(batchId: string, quantity: number, deliveryAddress: string, userAddress: string): string {
    const redemptionId = this.redemptionCounter.toString();
    this.redemptionCounter++;

    const redemption: RedemptionRequest = {
      redemptionId,
      consumer: userAddress,
      batchId,
      quantity,
      deliveryAddress,
      requestDate: Date.now(),
      status: 0, // Pending
      fulfillmentDate: 0
    };

    this.redemptionRequests.set(redemptionId, redemption);

    // Update user balance
    const userBalances = this.userBalances.get(userAddress);
    if (userBalances) {
      const currentBalance = userBalances.get(batchId) || 0;
      if (currentBalance >= quantity) {
        userBalances.set(batchId, currentBalance - quantity);
        this.userBalances.set(userAddress, userBalances);
      }
    }

    return redemptionId;
  }

  getRedemption(redemptionId: string): RedemptionRequest | undefined {
    return this.redemptionRequests.get(redemptionId);
  }
}

/**
 * Check system availability
 */
export async function checkSystemStatus(): Promise<SystemStatus> {
  const status: SystemStatus = {
    blockchain: false,
    ipfs: false,
    database: false,
    chainlink: false
  };

  try {
    // Check blockchain
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_accounts' });
        status.blockchain = true;
      } catch (e) {
        console.log('Blockchain not available');
      }
    }

    // Check IPFS (via Pinata)
    try {
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        headers: {
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || ''
        }
      });
      status.ipfs = response.ok;
    } catch (e) {
      console.log('IPFS not available');
    }

    // Check database
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      status.database = data.success;
    } catch (e) {
      console.log('Database not available');
    }

    // Chainlink is dependent on blockchain
    status.chainlink = status.blockchain;

  } catch (error) {
    console.error('Error checking system status:', error);
  }

  return status;
}

/**
 * Fallback implementations that work without external systems
 */
export class SystemFallbacks {
  private static mockStore = MockDataStore.getInstance();

  /**
   * Create batch with fallback
   */
  static async createBatch(
    batchData: BatchCreationData | ExtendedBatchCreationData,
    systemStatus?: SystemStatus
  ): Promise<{
    batchId: string;
    ipfsUri: string;
    metadataHash: string;
    transactionHash: string;
    qrCodeDataUrl: string;
    verificationQR: string;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain && status.ipfs) {
      // Try real implementation
      try {
        const { createBatchBlockchainFirst } = await import('./smartContracts');
        const result = await createBatchBlockchainFirst(batchData);
        return { ...result, fallbackMode: false };
      } catch (error) {
        console.warn('Blockchain creation failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback batch creation (offline mode)');
    const result = this.mockStore.createBatch(batchData);
    return { ...result, fallbackMode: true };
  }

  /**
   * Get active batch IDs with fallback
   */
  static async getActiveBatchIds(systemStatus?: SystemStatus): Promise<{
    batchIds: string[];
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain) {
      try {
        const { getActiveBatchIds } = await import('./smartContracts');
        const batchIds = await getActiveBatchIds();
        return { batchIds, fallbackMode: false };
      } catch (error) {
        console.warn('Blockchain fetch failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback batch IDs (offline mode)');
    const batchIds = this.mockStore.getActiveBatchIds();
    return { batchIds, fallbackMode: true };
  }

  /**
   * Get batch info with fallback
   */
  static async getBatchInfo(
    batchId: string,
    systemStatus?: SystemStatus
  ): Promise<{
    batchInfo: BatchInfo | null;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain) {
      try {
        const { getBatchInfoWithMetadata } = await import('./smartContracts');
        const batchInfo = await getBatchInfoWithMetadata(batchId);
        return { batchInfo, fallbackMode: false };
      } catch (error) {
        console.warn('Blockchain batch fetch failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback batch info (offline mode)');
    const batchInfo = this.mockStore.getBatch(batchId) || null;
    return { batchInfo, fallbackMode: true };
  }

  /**
   * Request verification with fallback
   */
  static async requestVerification(
    batchId: string,
    userAddress: string,
    systemStatus?: SystemStatus
  ): Promise<{
    requestId: string;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain && status.chainlink) {
      try {
        const { requestBatchVerification } = await import('./smartContracts');
        const requestId = await requestBatchVerification(batchId);
        return { requestId, fallbackMode: false };
      } catch (error) {
        console.warn('Blockchain verification failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback verification (offline mode)');
    const requestId = this.mockStore.requestVerification(batchId, userAddress);
    return { requestId, fallbackMode: true };
  }

  /**
   * Request redemption with fallback
   */
  static async requestRedemption(
    batchId: string,
    quantity: number,
    deliveryAddress: string,
    userAddress: string,
    systemStatus?: SystemStatus
  ): Promise<{
    redemptionId: string;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain) {
      try {
        const { requestCoffeeRedemption } = await import('./smartContracts');
        const txHash = await requestCoffeeRedemption(batchId, quantity, deliveryAddress);
        return { redemptionId: txHash, fallbackMode: false };
      } catch (error) {
        console.warn('Blockchain redemption failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback redemption (offline mode)');
    const redemptionId = this.mockStore.requestRedemption(batchId, quantity, deliveryAddress, userAddress);
    return { redemptionId, fallbackMode: true };
  }

  /**
   * Get user balance with fallback
   */
  static async getUserBalance(
    userAddress: string,
    batchId: string,
    systemStatus?: SystemStatus
  ): Promise<{
    balance: number;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain) {
      try {
        const { getUserBatchBalance } = await import('./smartContracts');
        const balance = await getUserBatchBalance(batchId, userAddress);
        return { balance, fallbackMode: false };
      } catch (error) {
        console.warn('Blockchain balance fetch failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback balance (offline mode)');
    const balance = this.mockStore.getUserBalance(userAddress, batchId);
    return { balance, fallbackMode: true };
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(systemStatus?: SystemStatus): Promise<{
    totalBatches: number;
    activeBatches: number;
    verifiedBatches: number;
    totalSupply: number;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.database) {
      try {
        const response = await fetch('/api/waga/stats');
        if (response.ok) {
          const stats = await response.json();
          return { ...stats, fallbackMode: false };
        }
      } catch (error) {
        console.warn('Database stats failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback stats (offline mode)');
    const batches = this.mockStore.getAllBatches();
    const verifiedBatches = batches.filter(b => b.isVerified);
    
    return {
      totalBatches: batches.length,
      activeBatches: batches.length,
      verifiedBatches: verifiedBatches.length,
      totalSupply: batches.reduce((sum, batch) => sum + batch.quantity, 0),
      fallbackMode: true
    };
  }
}

/**
 * ZK Fallback Functions
 */
export class ZKFallbacks {
  /**
   * Generate mock ZK proof
   */
  static generateMockZKProof(inputs: number[]): {
    proof: {
      a: [string, string];
      b: [[string, string], [string, string]];
      c: [string, string];
    };
    inputs: [string, string, string];
  } {
    // Generate mock proof values
    const mockProof = {
      a: ["0x1234567890abcdef", "0xfedcba0987654321"] as [string, string],
      b: [
        ["0x1111111111111111", "0x2222222222222222"] as [string, string],
        ["0x3333333333333333", "0x4444444444444444"] as [string, string]
      ] as [[string, string], [string, string]],
      c: ["0x5555555555555555", "0x6666666666666666"] as [string, string]
    };

    const mockInputs: [string, string, string] = [
      inputs[0]?.toString() || "0",
      inputs[1]?.toString() || "0", 
      inputs[2]?.toString() || "0"
    ];

    return { proof: mockProof, inputs: mockInputs };
  }

  /**
   * Verify ZK proof with fallback
   */
  static async verifyZKProof(
    proof: any,
    inputs: [string, string, string],
    systemStatus?: SystemStatus
  ): Promise<{
    verified: boolean;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain) {
      try {
        const { verifyZKProof } = await import('./smartContracts');
        const verified = await verifyZKProof(proof, inputs);
        return { verified, fallbackMode: false };
      } catch (error) {
        console.warn('ZK verification failed, using fallback:', error);
      }
    }

    // Use fallback - always return true for demo
    console.log('🔄 Using fallback ZK verification (offline mode)');
    return { verified: true, fallbackMode: true };
  }
}

/**
 * Inventory Management Fallbacks
 */
export class InventoryFallbacks {
  /**
   * Get inventory status with fallback
   */
  static async getInventoryStatus(systemStatus?: SystemStatus): Promise<{
    lowInventoryBatches: string[];
    expiredBatches: string[];
    expiringBatches: string[]; // Within 30 days
    totalInventory: number;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain) {
      try {
        // TODO: Implement real inventory manager contract calls
        // const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);
        // ... real implementation
      } catch (error) {
        console.warn('Inventory check failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback inventory status (offline mode)');
    const mockStore = MockDataStore.getInstance();
    const batches = mockStore.getAllBatches();
    
    const now = Date.now();
    const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);
    
    const lowInventoryBatches = batches.filter(b => b.quantity < 20).map(b => b.batchId);
    const expiredBatches = batches.filter(b => b.expiryDate < now).map(b => b.batchId);
    const expiringBatches = batches.filter(b => 
      b.expiryDate > now && b.expiryDate < thirtyDaysFromNow
    ).map(b => b.batchId);
    
    return {
      lowInventoryBatches,
      expiredBatches,
      expiringBatches,
      totalInventory: batches.reduce((sum, batch) => sum + batch.quantity, 0),
      fallbackMode: true
    };
  }

  /**
   * Request inventory verification with fallback
   */
  static async requestInventoryVerification(
    batchId: string,
    systemStatus?: SystemStatus
  ): Promise<{
    requestId: string;
    fallbackMode: boolean;
  }> {
    const status = systemStatus || await checkSystemStatus();

    if (status.blockchain && status.chainlink) {
      try {
        // TODO: Implement real inventory verification
        // const proofOfReserve = getContract(PROOF_OF_RESERVE_ADDRESS, PROOF_OF_RESERVE_ABI, signer);
        // const requestId = await proofOfReserve.requestInventoryVerification(batchId, source);
        // return { requestId, fallbackMode: false };
      } catch (error) {
        console.warn('Inventory verification failed, using fallback:', error);
      }
    }

    // Use fallback
    console.log('🔄 Using fallback inventory verification (offline mode)');
    const requestId = `inv_req_${Date.now()}`;
    return { requestId, fallbackMode: true };
  }
}
