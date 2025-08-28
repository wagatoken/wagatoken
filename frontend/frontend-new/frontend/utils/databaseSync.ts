import { BatchCreationData } from './ipfsMetadata';

/**
 * Sync batch data to database after blockchain confirmation
 * This preserves blockchain-first workflow integrity
 */
export interface BlockchainSyncData {
  batchId: string;
  transactionHash: string;
  ipfsUri: string;
  metadataHash: string;
  batchData: BatchCreationData;
}

/**
 * Sync batch to database after blockchain success
 * Non-blocking operation - blockchain success is not dependent on database
 */
export async function syncBatchToDatabase(syncData: BlockchainSyncData): Promise<{
  success: boolean;
  syncedAt?: string;
  error?: string;
}> {
  try {
    console.log('💾 Syncing batch to database...');
    console.log('   Batch ID:', syncData.batchId);
    console.log('   Transaction Hash:', syncData.transactionHash);

    const response = await fetch('/api/waga/sync-from-blockchain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Database sync failed');
    }

    const result = await response.json();
    
    console.log('✅ Database sync completed successfully!');
    console.log('   Sync Status: confirmed');
    console.log('   Synced At:', result.syncedAt);

    return {
      success: true,
      syncedAt: result.syncedAt
    };

  } catch (error) {
    // Log error but don't throw - blockchain operation should not fail due to database issues
    console.error('❌ Database sync failed (non-blocking):', error);
    console.log('💾 Database sync status: ❌ failed');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sync error'
    };
  }
}

/**
 * Sync verification request to database
 */
export async function syncVerificationToDatabase(verificationData: {
  requestId: string;
  batchId: string;
  status: string;
  transactionHash?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 Syncing verification to database...');
    console.log('   Request ID:', verificationData.requestId);

    const response = await fetch('/api/waga/sync-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Verification sync failed');
    }

    console.log('✅ Verification sync completed successfully!');
    console.log('💾 Verification sync status: ✅ confirmed');

    return { success: true };

  } catch (error) {
    console.error('❌ Verification sync failed (non-blocking):', error);
    console.log('💾 Verification sync status: ❌ failed');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown verification sync error'
    };
  }
}
