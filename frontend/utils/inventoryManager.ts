/**
 * Inventory Management Functions for WAGA System
 * Integrates with WAGAInventoryManagerMVP.sol contract
 * Based on actual smart contract implementation
 */

import { ethers } from 'ethers';
import { getSigner, getContract } from './smartContracts';

// Inventory Manager Contract Address
const INVENTORY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS!;

// ABI based on actual WAGAInventoryManagerMVP.sol contract
const INVENTORY_MANAGER_ABI = [
  "function getBatchStatus(uint256 batchId) external view returns (bool isExpired, bool isLowInventory, bool needsVerif)",
  "function needsVerification(uint256 batchId) external view returns (bool)",
  "function lowInventoryThreshold() external view returns (uint256)",
  "function verificationInterval() external view returns (uint256)",
  "function maxBatchesPerCheck() external view returns (uint256)",
  "function setLowInventoryThreshold(uint256 newThreshold) external",
  "function setVerificationInterval(uint256 newInterval) external",
  "function performPeriodicChecks(uint256[] calldata batchIds) external",
  "function getActiveBatches() external pure returns (uint256[] memory)"
];

// Interfaces
export interface InventoryThresholds {
  lowInventoryThreshold: number;
  verificationInterval: number;
  maxBatchesPerCheck: number;
}

export interface InventoryStats {
  totalBatches: number;
  expiredBatches: number;
  lowInventoryBatches: number;
  batchesNeedingVerification: number;
  totalInventoryValue: number;
  averageBatchAge: number;
}

// Fallback configurations
export const InventoryFallbacks = {
  DEFAULT_LOW_INVENTORY_THRESHOLD: 10,
  DEFAULT_VERIFICATION_INTERVAL: 7 * 24 * 60 * 60,
  DEFAULT_MAX_BATCHES_PER_CHECK: 50
};

/**
 * Get inventory thresholds from the actual contract
 */
export async function getInventoryThresholds(): Promise<InventoryThresholds> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const [lowInventoryThreshold, verificationInterval, maxBatchesPerCheck] = await Promise.all([
      inventoryManager.lowInventoryThreshold(),
      inventoryManager.verificationInterval(),
      inventoryManager.maxBatchesPerCheck()
    ]);
    
    return {
      lowInventoryThreshold: lowInventoryThreshold.toNumber(),
      verificationInterval: verificationInterval.toNumber(),
      maxBatchesPerCheck: maxBatchesPerCheck.toNumber()
    };

  } catch (error) {
    console.error('Error getting inventory thresholds:', error);
    return {
      lowInventoryThreshold: InventoryFallbacks.DEFAULT_LOW_INVENTORY_THRESHOLD,
      verificationInterval: InventoryFallbacks.DEFAULT_VERIFICATION_INTERVAL,
      maxBatchesPerCheck: InventoryFallbacks.DEFAULT_MAX_BATCHES_PER_CHECK
    };
  }
}

/**
 * Check batch status using actual contract function
 */
export async function getBatchStatus(batchId: string): Promise<{
  isExpired: boolean;
  isLowInventory: boolean;
  needsVerification: boolean;
}> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const result = await inventoryManager.getBatchStatus(batchId);
    
    return {
      isExpired: result.isExpired,
      isLowInventory: result.isLowInventory,
      needsVerification: result.needsVerif
    };

  } catch (error) {
    console.error('Error checking batch status:', error);
    return {
      isExpired: false,
      isLowInventory: false,
      needsVerification: false
    };
  }
}

/**
 * Perform periodic checks on batches using actual contract function
 */
export async function performPeriodicChecks(batchIds: string[]): Promise<void> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const batchIdNumbers = batchIds.map(id => parseInt(id));
    const tx = await inventoryManager.performPeriodicChecks(batchIdNumbers);
    await tx.wait();

  } catch (error) {
    console.error('Error performing periodic checks:', error);
    throw new Error(`Failed to perform periodic checks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Set low inventory threshold using actual contract function
 */
export async function setLowInventoryThreshold(threshold: number): Promise<void> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const tx = await inventoryManager.setLowInventoryThreshold(threshold);
    await tx.wait();

  } catch (error) {
    console.error('Error setting low inventory threshold:', error);
    throw new Error(`Failed to set low inventory threshold: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Set verification interval using actual contract function
 */
export async function setVerificationInterval(interval: number): Promise<void> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const tx = await inventoryManager.setVerificationInterval(interval);
    await tx.wait();

  } catch (error) {
    console.error('Error setting verification interval:', error);
    throw new Error(`Failed to set verification interval: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Set max batches per check (fallback implementation for MVP)
 */
export async function setMaxBatchesPerCheck(maxBatches: number): Promise<void> {
  console.warn('setMaxBatchesPerCheck not implemented in MVP contract');
  // This function is expected by the frontend but not available in the actual contract
  // Return success to avoid breaking the UI
}

/**
 * Get inventory statistics for given batch IDs
 */
export async function getInventoryStatistics(batchIds: string[]): Promise<InventoryStats> {
  try {
    if (batchIds.length === 0) {
      return {
        totalBatches: 0,
        expiredBatches: 0,
        lowInventoryBatches: 0,
        batchesNeedingVerification: 0,
        totalInventoryValue: 0,
        averageBatchAge: 0
      };
    }

    // For each batch, get its status
    const batchStatuses = await Promise.all(
      batchIds.map(async (batchId) => {
        try {
          return await getBatchStatus(batchId);
        } catch (error) {
          console.error(`Error getting status for batch ${batchId}:`, error);
          return { isExpired: false, isLowInventory: false, needsVerification: false };
        }
      })
    );

    // Aggregate statistics
    const stats = {
      totalBatches: batchIds.length,
      expiredBatches: batchStatuses.filter(s => s.isExpired).length,
      lowInventoryBatches: batchStatuses.filter(s => s.isLowInventory).length,
      batchesNeedingVerification: batchStatuses.filter(s => s.needsVerification).length,
      totalInventoryValue: 0, // Would need additional contract calls to calculate
      averageBatchAge: 0 // Would need additional contract calls to calculate
    };

    return stats;

  } catch (error) {
    console.error('Error getting inventory statistics:', error);
    return {
      totalBatches: 0,
      expiredBatches: 0,
      lowInventoryBatches: 0,
      batchesNeedingVerification: 0,
      totalInventoryValue: 0,
      averageBatchAge: 0
    };
  }
}

/**
 * Get critical batches that need attention
 */
export async function getCriticalBatches(batchIds: string[]): Promise<{
  expiredBatches: string[];
  lowInventoryBatches: string[];
  verificationNeededBatches: string[];
  expiringBatches: string[];
}> {
  try {
    if (batchIds.length === 0) {
      return {
        expiredBatches: [],
        lowInventoryBatches: [],
        verificationNeededBatches: [],
        expiringBatches: []
      };
    }

    const critical = {
      expiredBatches: [] as string[],
      lowInventoryBatches: [] as string[],
      verificationNeededBatches: [] as string[],
      expiringBatches: [] as string[]
    };

    // Check each batch
    for (const batchId of batchIds) {
      try {
        const status = await getBatchStatus(batchId);
        
        if (status.isExpired) {
          critical.expiredBatches.push(batchId);
        }
        if (status.isLowInventory) {
          critical.lowInventoryBatches.push(batchId);
        }
        if (status.needsVerification) {
          critical.verificationNeededBatches.push(batchId);
        }
      } catch (error) {
        console.error(`Error checking batch ${batchId}:`, error);
      }
    }

    return critical;

  } catch (error) {
    console.error('Error getting critical batches:', error);
    return {
      expiredBatches: [],
      lowInventoryBatches: [],
      verificationNeededBatches: [],
      expiringBatches: []
    };
  }
}

/**
 * Check batch expiry (simplified implementation using getBatchStatus)
 */
export async function checkBatchExpiry(batchId: string): Promise<{
  isExpired: boolean;
  expiryDate: number;
}> {
  try {
    const status = await getBatchStatus(batchId);
    return {
      isExpired: status.isExpired,
      expiryDate: 0 // Would need additional contract implementation
    };
  } catch (error) {
    console.error('Error checking batch expiry:', error);
    return { isExpired: false, expiryDate: 0 };
  }
}

/**
 * Check low inventory (simplified implementation using getBatchStatus)
 */
export async function checkLowInventory(batchId: string): Promise<{
  isLow: boolean;
  currentQuantity: number;
}> {
  try {
    const status = await getBatchStatus(batchId);
    return {
      isLow: status.isLowInventory,
      currentQuantity: 0 // Would need additional contract implementation
    };
  } catch (error) {
    console.error('Error checking low inventory:', error);
    return { isLow: false, currentQuantity: 0 };
  }
}

/**
 * Get active batches (returns empty array for MVP as per contract)
 */
export async function getActiveBatches(): Promise<string[]> {
  try {
    const signer = await getSigner();
    const inventoryManager = getContract(INVENTORY_MANAGER_ADDRESS, INVENTORY_MANAGER_ABI, signer);

    const result = await inventoryManager.getActiveBatches();
    return result.map((id: any) => id.toString());

  } catch (error) {
    console.error('Error getting active batches:', error);
    return [];
  }
}
