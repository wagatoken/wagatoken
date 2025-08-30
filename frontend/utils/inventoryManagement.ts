import { ethers } from 'ethers';
import { getSigner } from './smartContracts';

// Contract ABIs for inventory management
const INVENTORY_MANAGER_ABI = [
  "function s_batchAuditInterval() external view returns (uint256)",
  "function s_expiryWarningThreshold() external view returns (uint256)",
  "function s_lowInventoryThreshold() external view returns (uint256)",
  "function s_longStorageThreshold() external view returns (uint256)",
  "function s_maxBatchesPerUpkeep() external view returns (uint256)",
  "function s_intervalSeconds() external view returns (uint256)",
  "function updateBatchAuditInterval(uint256 _batchAuditInterval) external",
  "function updateExpiryWarningThreshold(uint256 _expiryWarningThreshold) external",
  "function updateLowInventoryThreshold(uint256 _lowInventoryThreshold) external",
  "function updateLongStorageThreshold(uint256 _longStorageThreshold) external",
  "function updateMaxBatchesPerUpkeep(uint256 _maxBatchesPerUpkeep) external",
  "function setBatchAuditInterval(uint256 intervalSeconds) external",
  "function getSourceCodeForBatch(uint256 batchId) external view returns (string memory)",
  "function setDefaultSourceCode(string calldata sourceCode) external",
  "function setBatchSourceCode(uint256 batchId, string calldata sourceCode) external"
];

const PROOF_OF_RESERVE_ABI = [
  "function requestInventoryVerification(uint256 batchId, string calldata source) external returns (bytes32)",
  "function verificationRequests(bytes32 requestId) external view returns (uint256 batchId, uint256 requestQuantity, uint256 verifiedQuantity, uint256 requestPrice, uint256 verifiedPrice, string memory expectedPackaging, string memory verifiedPackaging, string memory expectedMetadataHash, string memory verifiedMetadataHash, address recipient, bool completed, bool verified, uint256 lastVerifiedTimestamp, bool shouldMint)",
  "event ReserveVerificationRequested(bytes32 indexed requestId, uint256 indexed batchId, uint256 quantity)"
];

// Contract addresses (should be from environment variables)
const INVENTORY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_INVENTORY_MANAGER_ADDRESS || '';
const PROOF_OF_RESERVE_ADDRESS = process.env.NEXT_PUBLIC_PROOF_OF_RESERVE_ADDRESS || '';

/**
 * Get verification configuration from smart contract
 */
export async function getVerificationConfig() {
  try {
    const signer = await getSigner();
    const inventoryManager = new ethers.Contract(
      INVENTORY_MANAGER_ADDRESS,
      INVENTORY_MANAGER_ABI,
      signer
    );

    const [
      batchAuditInterval,
      expiryWarningThreshold,
      lowInventoryThreshold,
      longStorageThreshold,
      maxBatchesPerUpkeep,
      intervalSeconds
    ] = await Promise.all([
      inventoryManager.s_batchAuditInterval(),
      inventoryManager.s_expiryWarningThreshold(),
      inventoryManager.s_lowInventoryThreshold(),
      inventoryManager.s_longStorageThreshold(),
      inventoryManager.s_maxBatchesPerUpkeep(),
      inventoryManager.s_intervalSeconds()
    ]);

    return {
      batchAuditInterval: Number(batchAuditInterval),
      expiryWarningThreshold: Number(expiryWarningThreshold),
      lowInventoryThreshold: Number(lowInventoryThreshold),
      longStorageThreshold: Number(longStorageThreshold),
      maxBatchesPerUpkeep: Number(maxBatchesPerUpkeep),
      intervalSeconds: Number(intervalSeconds)
    };
  } catch (error) {
    console.error('Error fetching verification config:', error);
    throw new Error('Failed to fetch verification configuration');
  }
}

/**
 * Update verification configuration in smart contract
 */
export async function updateVerificationConfig(config: {
  batchAuditInterval?: number;
  expiryWarningThreshold?: number;
  lowInventoryThreshold?: number;
  longStorageThreshold?: number;
  maxBatchesPerUpkeep?: number;
  intervalSeconds?: number;
}) {
  try {
    const signer = await getSigner();
    const inventoryManager = new ethers.Contract(
      INVENTORY_MANAGER_ADDRESS,
      INVENTORY_MANAGER_ABI,
      signer
    );

    const txPromises = [];

    if (config.batchAuditInterval !== undefined) {
      txPromises.push(
        inventoryManager.updateBatchAuditInterval(config.batchAuditInterval)
      );
    }

    if (config.expiryWarningThreshold !== undefined) {
      txPromises.push(
        inventoryManager.updateExpiryWarningThreshold(config.expiryWarningThreshold)
      );
    }

    if (config.lowInventoryThreshold !== undefined) {
      txPromises.push(
        inventoryManager.updateLowInventoryThreshold(config.lowInventoryThreshold)
      );
    }

    if (config.longStorageThreshold !== undefined) {
      txPromises.push(
        inventoryManager.updateLongStorageThreshold(config.longStorageThreshold)
      );
    }

    if (config.maxBatchesPerUpkeep !== undefined) {
      txPromises.push(
        inventoryManager.updateMaxBatchesPerUpkeep(config.maxBatchesPerUpkeep)
      );
    }

    if (config.intervalSeconds !== undefined) {
      txPromises.push(
        inventoryManager.setBatchAuditInterval(config.intervalSeconds)
      );
    }

    // Execute all transactions
    const txs = await Promise.all(txPromises);
    await Promise.all(txs.map(tx => tx.wait()));

    return { success: true, message: 'Configuration updated successfully' };
  } catch (error) {
    console.error('Error updating verification config:', error);
    throw new Error('Failed to update verification configuration');
  }
}

/**
 * Trigger manual inventory verification for a specific batch
 */
export async function triggerManualVerification(batchId: number) {
  try {
    const signer = await getSigner();
    const proofOfReserve = new ethers.Contract(
      PROOF_OF_RESERVE_ADDRESS,
      PROOF_OF_RESERVE_ABI,
      signer
    );

    // Default source code for inventory verification
    const sourceCode = `
      // Chainlink Functions source code for inventory verification
      const batchId = args[0];
      const quantity = args[1];
      const price = args[2];
      const packaging = args[3];
      const metadataHash = args[4];
      
      // Simulate API call to verify inventory
      const verified = true; // In production, this would be an actual API call
      
      if (verified) {
        return Functions.encodeString(JSON.stringify({
          quantity: quantity,
          price: price,
          packaging: packaging,
          metadataHash: metadataHash
        }));
      } else {
        throw new Error('Inventory verification failed');
      }
    `;

    const tx = await proofOfReserve.requestInventoryVerification(batchId, sourceCode);
    const receipt = await tx.wait();

    // Extract request ID from event
    const event = receipt.logs.find((log: any) => 
      log.eventName === 'ReserveVerificationRequested'
    );

    if (event) {
      return {
        success: true,
        requestId: event.args.requestId,
        message: `Manual verification triggered for batch ${batchId}`
      };
    } else {
      throw new Error('Failed to get verification request ID');
    }
  } catch (error) {
    console.error('Error triggering manual verification:', error);
    throw new Error('Failed to trigger manual verification');
  }
}

/**
 * Get verification request details
 */
export async function getVerificationRequest(requestId: string) {
  try {
    const signer = await getSigner();
    const proofOfReserve = new ethers.Contract(
      PROOF_OF_RESERVE_ADDRESS,
      PROOF_OF_RESERVE_ABI,
      signer
    );

    const request = await proofOfReserve.verificationRequests(requestId);
    
    return {
      batchId: Number(request.batchId),
      requestQuantity: Number(request.requestQuantity),
      verifiedQuantity: Number(request.verifiedQuantity),
      requestPrice: Number(request.requestPrice),
      verifiedPrice: Number(request.verifiedPrice),
      expectedPackaging: request.expectedPackaging,
      verifiedPackaging: request.verifiedPackaging,
      expectedMetadataHash: request.expectedMetadataHash,
      verifiedMetadataHash: request.verifiedMetadataHash,
      recipient: request.recipient,
      completed: request.completed,
      verified: request.verified,
      lastVerifiedTimestamp: Number(request.lastVerifiedTimestamp),
      shouldMint: request.shouldMint
    };
  } catch (error) {
    console.error('Error fetching verification request:', error);
    throw new Error('Failed to fetch verification request details');
  }
}

/**
 * Set source code for batch-specific verification
 */
export async function setBatchSourceCode(batchId: number, sourceCode: string) {
  try {
    const signer = await getSigner();
    const inventoryManager = new ethers.Contract(
      INVENTORY_MANAGER_ADDRESS,
      INVENTORY_MANAGER_ABI,
      signer
    );

    const tx = await inventoryManager.setBatchSourceCode(batchId, sourceCode);
    await tx.wait();

    return { success: true, message: 'Batch source code updated successfully' };
  } catch (error) {
    console.error('Error setting batch source code:', error);
    throw new Error('Failed to set batch source code');
  }
}

/**
 * Set default source code for verification
 */
export async function setDefaultSourceCode(sourceCode: string) {
  try {
    const signer = await getSigner();
    const inventoryManager = new ethers.Contract(
      INVENTORY_MANAGER_ADDRESS,
      INVENTORY_MANAGER_ABI,
      signer
    );

    const tx = await inventoryManager.setDefaultSourceCode(sourceCode);
    await tx.wait();

    return { success: true, message: 'Default source code updated successfully' };
  } catch (error) {
    console.error('Error setting default source code:', error);
    throw new Error('Failed to set default source code');
  }
}

/**
 * Get source code for a specific batch
 */
export async function getBatchSourceCode(batchId: number) {
  try {
    const signer = await getSigner();
    const inventoryManager = new ethers.Contract(
      INVENTORY_MANAGER_ADDRESS,
      INVENTORY_MANAGER_ABI,
      signer
    );

    const sourceCode = await inventoryManager.getSourceCodeForBatch(batchId);
    return sourceCode;
  } catch (error) {
    console.error('Error fetching batch source code:', error);
    throw new Error('Failed to fetch batch source code');
  }
}
