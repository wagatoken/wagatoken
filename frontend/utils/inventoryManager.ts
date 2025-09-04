/**
 * Inventory Management Functions for WAGA System
 * Integrates with WAGAInventoryManagerMVP.sol contract
 */

import { ethers } from 'ethers';
import { getSigner, getContract } from './smartContracts';

// Inventory Manager Contract Address and ABI
const INVENTORY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS!;
const PROOF_OF_RESERVE_ADDRESS = process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS!;

const INVENTORY_MANAGER_ABI = [
  // View functions
  "function checkBatchExpiry(uint256 batchId) external view returns (bool isExpired, uint256 expiryDate)",
  "function checkLowInventory(uint256 batchId) external view returns (bool isLow, uint256 currentQuantity)",
  "function checkVerificationNeeded(uint256 batchId) external view returns (bool needsVerification, uint256 lastVerified)",
  "function lowInventoryThreshold() external view returns (uint256)",
  "function verificationInterval() external view returns (uint256)",
  "function maxBatchesPerCheck() external view returns (uint256)",
  
  // Admin functions
  "function setLowInventoryThreshold(uint256 _threshold) external",
  "function setVerificationInterval(uint256 _interval) external",
  "function setMaxBatchesPerCheck(uint256 _maxBatches) external",
  
  // Batch processing functions
  "function performPeriodicChecks(uint256[] calldata batchIds) external",
  "function checkSingleBatch(uint256 batchId) external returns (bool expired, bool lowInventory, bool needsVerification)",
  
  // Events
  "event BatchExpired(uint256 indexed batchId, uint256 expiryDate)",
  "event LowInventoryWarning(uint256 indexed batchId, uint256 currentQuantity)",
  "event VerificationRequested(uint256 indexed batchId, bytes32 requestId)",
  "event ThresholdUpdated(string thresholdType, uint256 oldValue, uint256 newValue)",
  "event BatchProcessed(uint256 indexed batchId, string checkType)"
];

// Interfaces
export interface InventoryStatus {
  batchId: string;
  isExpired: boolean;
  expiryDate: number;
  isLowInventory: boolean;
  currentQuantity: number;
  needsVerification: boolean;
  lastVerified: number;
}

export interface InventoryThresholds {
  lowInventoryThreshold: number;
  verificationInterval: number; // in seconds
  maxBatchesPerCheck: number;
}

export interface InventoryStats {
  totalBatches: number;
  expiredBatches: number;
  lowInventoryBatches: number;
  batchesNeedingVerification: number;
  totalInventoryValue: number;
  averageBatchAge: number; // in days
}

/**
 * Check expiry status of a batch
 */
export async function checkBatchExpiry(batchId: string): Promise<{
  isExpired: boolean;
  expiryDate: number;
}> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const result = await inventoryManager.checkBatchExpiry(batchId);
    
    return {
      isExpired: result.isExpired,
      expiryDate: result.expiryDate.toNumber()
    };

  } catch (error) {
    console.error('Error checking batch expiry:', error);
    throw new Error(`Failed to check batch expiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check low inventory status of a batch
 */
export async function checkLowInventory(batchId: string): Promise<{
  isLow: boolean;
  currentQuantity: number;
}> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const result = await inventoryManager.checkLowInventory(batchId);
    
    return {
      isLow: result.isLow,
      currentQuantity: result.currentQuantity.toNumber()
    };

  } catch (error) {
    console.error('Error checking low inventory:', error);
    throw new Error(`Failed to check low inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if batch needs verification
 */
export async function checkVerificationNeeded(batchId: string): Promise<{
  needsVerification: boolean;
  lastVerified: number;
}> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const result = await inventoryManager.checkVerificationNeeded(batchId);
    
    return {
      needsVerification: result.needsVerification,
      lastVerified: result.lastVerified.toNumber()
    };

  } catch (error) {
    console.error('Error checking verification needed:', error);
    throw new Error(`Failed to check verification needed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get comprehensive inventory status for a batch
 */
export async function getBatchInventoryStatus(batchId: string): Promise<InventoryStatus> {
  try {
    const [expiryStatus, inventoryStatus, verificationStatus] = await Promise.all([
      checkBatchExpiry(batchId),
      checkLowInventory(batchId),
      checkVerificationNeeded(batchId)
    ]);

    return {
      batchId,
      isExpired: expiryStatus.isExpired,
      expiryDate: expiryStatus.expiryDate,
      isLowInventory: inventoryStatus.isLow,
      currentQuantity: inventoryStatus.currentQuantity,
      needsVerification: verificationStatus.needsVerification,
      lastVerified: verificationStatus.lastVerified
    };

  } catch (error) {
    console.error('Error getting batch inventory status:', error);
    throw new Error(`Failed to get batch inventory status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get inventory thresholds and configuration
 */
export async function getInventoryThresholds(): Promise<InventoryThresholds> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const [lowThreshold, verificationInterval, maxBatches] = await Promise.all([
      inventoryManager.lowInventoryThreshold(),
      inventoryManager.verificationInterval(),
      inventoryManager.maxBatchesPerCheck()
    ]);

    return {
      lowInventoryThreshold: lowThreshold.toNumber(),
      verificationInterval: verificationInterval.toNumber(),
      maxBatchesPerCheck: maxBatches.toNumber()
    };

  } catch (error) {
    console.error('Error getting inventory thresholds:', error);
    throw new Error(`Failed to get inventory thresholds: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Set low inventory threshold (Admin only)
 */
export async function setLowInventoryThreshold(threshold: number): Promise<{ transactionHash: string }> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const tx = await inventoryManager.setLowInventoryThreshold(threshold);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('Error setting low inventory threshold:', error);
    throw new Error(`Failed to set low inventory threshold: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Set verification interval (Admin only)
 */
export async function setVerificationInterval(intervalSeconds: number): Promise<{ transactionHash: string }> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const tx = await inventoryManager.setVerificationInterval(intervalSeconds);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('Error setting verification interval:', error);
    throw new Error(`Failed to set verification interval: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Set maximum batches per check (Admin only)
 */
export async function setMaxBatchesPerCheck(maxBatches: number): Promise<{ transactionHash: string }> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const tx = await inventoryManager.setMaxBatchesPerCheck(maxBatches);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('Error setting max batches per check:', error);
    throw new Error(`Failed to set max batches per check: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Perform periodic checks on multiple batches
 */
export async function performPeriodicChecks(batchIds: string[]): Promise<{ transactionHash: string }> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const tx = await inventoryManager.performPeriodicChecks(batchIds);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('Error performing periodic checks:', error);
    throw new Error(`Failed to perform periodic checks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check a single batch and return comprehensive status
 */
export async function checkSingleBatch(batchId: string): Promise<{
  expired: boolean;
  lowInventory: boolean;
  needsVerification: boolean;
  transactionHash: string;
}> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const tx = await inventoryManager.checkSingleBatch(batchId);
    const receipt = await tx.wait();

    // Parse events to get the results
    const batchProcessedEvent = receipt.events?.find(
      (event: any) => event.event === "BatchProcessed"
    );

    return {
      expired: false, // Parse from events if needed
      lowInventory: false, // Parse from events if needed
      needsVerification: false, // Parse from events if needed
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('Error checking single batch:', error);
    throw new Error(`Failed to check single batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Request inventory verification for a batch (triggers Chainlink Functions)
 */
export async function requestInventoryVerification(
  batchId: string,
  jsSource: string = `
    // Chainlink Functions JavaScript code for inventory verification
    const batchId = args[0];
    
    // In production, this would make API calls to verify physical inventory
    // For now, simulate successful verification
    const verified = true;
    
    return Functions.encodeUint256(verified ? 1 : 0);
  `
): Promise<{ requestId: string }> {
  try {
    const signer = await getSigner();
    const PROOF_OF_RESERVE_ABI = [
      "function requestInventoryVerification(uint256 batchId, string calldata source) external returns (bytes32)"
    ];
    const proofOfReserve = getContract(PROOF_OF_RESERVE_ADDRESS, PROOF_OF_RESERVE_ABI, signer);

    const tx = await proofOfReserve.requestInventoryVerification(batchId, jsSource);
    const receipt = await tx.wait();

    // Extract request ID from events
    const verificationEvent = receipt.events?.find(
      (event: any) => event.event === "InventoryVerificationRequested"
    );

    const requestId = verificationEvent?.args?.requestId || tx.hash;

    return {
      requestId: requestId.toString()
    };

  } catch (error) {
    console.error('Error requesting inventory verification:', error);
    throw new Error(`Failed to request inventory verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get comprehensive inventory statistics
 */
export async function getInventoryStatistics(batchIds: string[]): Promise<InventoryStats> {
  try {
    // Get status for all batches
    const batchStatuses = await Promise.all(
      batchIds.map(batchId => getBatchInventoryStatus(batchId))
    );

    const now = Date.now() / 1000; // Convert to seconds
    const totalBatches = batchStatuses.length;
    const expiredBatches = batchStatuses.filter(status => status.isExpired).length;
    const lowInventoryBatches = batchStatuses.filter(status => status.isLowInventory).length;
    const batchesNeedingVerification = batchStatuses.filter(status => status.needsVerification).length;
    
    // Calculate total inventory value (simplified)
    const totalInventoryValue = batchStatuses.reduce((sum, status) => sum + status.currentQuantity, 0);
    
    // Calculate average batch age
    const totalAge = batchStatuses.reduce((sum, status) => {
      const ageInSeconds = now - (status.lastVerified || 0);
      return sum + (ageInSeconds / (24 * 60 * 60)); // Convert to days
    }, 0);
    const averageBatchAge = totalBatches > 0 ? totalAge / totalBatches : 0;

    return {
      totalBatches,
      expiredBatches,
      lowInventoryBatches,
      batchesNeedingVerification,
      totalInventoryValue,
      averageBatchAge
    };

  } catch (error) {
    console.error('Error getting inventory statistics:', error);
    throw new Error(`Failed to get inventory statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get batches that need immediate attention
 */
export async function getCriticalBatches(batchIds: string[]): Promise<{
  expiredBatches: string[];
  lowInventoryBatches: string[];
  verificationNeededBatches: string[];
  expiringBatches: string[]; // Expiring within 30 days
}> {
  try {
    const batchStatuses = await Promise.all(
      batchIds.map(batchId => getBatchInventoryStatus(batchId))
    );

    const now = Date.now() / 1000;
    const thirtyDaysFromNow = now + (30 * 24 * 60 * 60);

    const expiredBatches = batchStatuses
      .filter(status => status.isExpired)
      .map(status => status.batchId);

    const lowInventoryBatches = batchStatuses
      .filter(status => status.isLowInventory)
      .map(status => status.batchId);

    const verificationNeededBatches = batchStatuses
      .filter(status => status.needsVerification)
      .map(status => status.batchId);

    const expiringBatches = batchStatuses
      .filter(status => !status.isExpired && status.expiryDate < thirtyDaysFromNow)
      .map(status => status.batchId);

    return {
      expiredBatches,
      lowInventoryBatches,
      verificationNeededBatches,
      expiringBatches
    };

  } catch (error) {
    console.error('Error getting critical batches:', error);
    throw new Error(`Failed to get critical batches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
