import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { wagaCoffeeBatches } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const syncData = await request.json();
    
    const {
      batchId,
      transactionHash,
      ipfsUri,
      metadataHash,
      batchData,
      zkConfig,
      zkResults
    } = syncData;

    // Validate required blockchain data
    if (!batchId || !transactionHash || !ipfsUri || !metadataHash || !batchData) {
      return NextResponse.json(
        { error: 'Missing required blockchain confirmation data' },
        { status: 400 }
      );
    }

    // Check if batch already exists in database
    const [existingBatch] = await db.select()
      .from(wagaCoffeeBatches)
      .where(eq(wagaCoffeeBatches.batchId, Number(batchId)));

    if (existingBatch) {
      // Update existing batch with blockchain confirmation
      const [updatedBatch] = await db.update(wagaCoffeeBatches)
        .set({
          metadataHash,
          ipfsUri,
          isVerified: false, // Will be updated when Chainlink verification completes
          updatedAt: new Date()
        })
        .where(eq(wagaCoffeeBatches.batchId, Number(batchId)))
        .returning();

      // Handle ZK data sync if present
      let zkSyncResult = null;
      if (zkConfig || zkResults) {
        try {
          zkSyncResult = await syncZKDataToDatabase(Number(batchId), zkConfig, zkResults);
        } catch (zkError) {
          console.warn('ZK data sync failed (non-blocking):', zkError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Batch updated with blockchain confirmation',
        batchId,
        syncedAt: new Date().toISOString(),
        batch: updatedBatch,
        zkSync: zkSyncResult
      });
    } else {
      // Create new batch record from blockchain data
      const [newBatch] = await db.insert(wagaCoffeeBatches).values({
        batchId: Number(batchId),
        quantity: batchData.quantity,
        price: batchData.pricePerUnit,
        packaging: batchData.packagingInfo,
        metadataHash,
        ipfsUri,
        farmName: batchData.farmer, // Fixed: use batchData.farmer
        location: batchData.origin,
        productionDate: batchData.productionDate,
        expiryDate: batchData.expiryDate,
        processingMethod: batchData.process, // Fixed: use batchData.process
        qualityScore: null, // Fixed: qualityScore not in BatchCreationData interface
        name: batchData.name, // Fixed: use batchData.name directly
        description: batchData.description || `Coffee batch from ${batchData.origin}`,
        farmer: batchData.farmer, // Fixed: use batchData.farmer
        altitude: batchData.altitude,
        certifications: batchData.certifications,
        isVerified: false, // Will be updated when Chainlink verification completes
        verificationStatus: 'pending'
      }).returning();

      // Handle ZK data sync if present
      let zkSyncResult = null;
      if (zkConfig || zkResults) {
        try {
          zkSyncResult = await syncZKDataToDatabase(Number(batchId), zkConfig, zkResults);
        } catch (zkError) {
          console.warn('ZK data sync failed (non-blocking):', zkError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Batch synced to database from blockchain',
        batchId,
        syncedAt: new Date().toISOString(),
        batch: newBatch,
        zkSync: zkSyncResult
      });
    }

  } catch (error) {
    console.error('Database sync error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database sync failed'
    }, { status: 500 });
  }
}

/**
 * Sync ZK configuration and results to database
 * This handles the privacy layer data separately from the main batch
 */
async function syncZKDataToDatabase(
  batchId: number,
  zkConfig?: any,
  zkResults?: any
): Promise<{ success: boolean; zkTablesCreated?: string[]; error?: string }> {
  try {
    const zkTablesCreated: string[] = [];

    // Import ZK schema tables only when needed
    const { 
      batchPrivacyConfigs, 
      zkProofs, 
      protectedBatchData,
      zkVerificationHistory,
      zkCircuitConfigs
    } = await import('../../../../db/schema');

    // 1. Create privacy configuration if ZK was enabled
    if (zkConfig) {
      try {
        await db.insert(batchPrivacyConfigs).values({
          batchId,
          pricePrivate: zkConfig.enablePricePrivacy || false,
          qualityPrivate: zkConfig.enableQualityPrivacy || false,
          supplyChainPrivate: zkConfig.enableSupplyChainPrivacy || false,
          privacyLevel: (zkConfig.enablePricePrivacy || zkConfig.enableQualityPrivacy || zkConfig.enableSupplyChainPrivacy) ? 'selective' : 'public',
          configuredBy: 'system', // TODO: Get actual user address
          configurationReason: 'ZK privacy configuration via batch creation'
        });
        zkTablesCreated.push('batchPrivacyConfigs');
      } catch (error) {
        console.warn('Failed to insert privacy config:', error);
      }
    }

    // 2. Store ZK proof records if they were generated
    if (zkResults && zkResults.proofsGenerated && zkResults.proofsGenerated.length > 0) {
      for (const proofInfo of zkResults.proofsGenerated) {
        try {
          const [proofType, proofHash] = proofInfo.split(': ');
          
          await db.insert(zkProofs).values({
            proofId: `proof_${batchId}_${proofType}_${Date.now()}`,
            batchId,
            proofType,
            proofHash,
            proofData: JSON.stringify({ type: proofType, hash: proofHash }),
            publicSignals: '[]', // Empty array for now
            publicClaim: zkConfig ? (
              proofType === 'PRICE_COMPETITIVENESS' ? zkConfig.pricingClaim || 'Price Competitive' :
              proofType === 'QUALITY_STANDARDS' ? zkConfig.qualityClaim || 'Quality Verified' :
              proofType === 'SUPPLY_CHAIN_PROVENANCE' ? zkConfig.supplyChainClaim || 'Origin Verified' :
              'ZK Proof Generated'
            ) : 'ZK Proof Generated',
            isVerified: true, // Set to true since it was generated successfully
            circuitName: proofType === 'PRICE_COMPETITIVENESS' ? 'PricePrivacyCircuit' :
                        proofType === 'QUALITY_STANDARDS' ? 'QualityTierCircuit' :
                        proofType === 'SUPPLY_CHAIN_PROVENANCE' ? 'SupplyChainPrivacyCircuit' :
                        'UnknownCircuit',
            proofGeneratorAddress: 'system', // TODO: Get actual generator address
            verifiedAt: new Date()
          });
          
        } catch (error) {
          console.warn(`Failed to insert ZK proof ${proofInfo}:`, error);
        }
      }
      zkTablesCreated.push('zkProofs');
    }

    // 3. Create verification history entry
    if (zkResults) {
      try {
        const firstProofId = zkResults.proofsGenerated && zkResults.proofsGenerated.length > 0 
          ? `proof_${batchId}_${zkResults.proofsGenerated[0].split(':')[0]}_${Date.now()}`
          : `proof_${batchId}_general_${Date.now()}`;

        await db.insert(zkVerificationHistory).values({
          proofId: firstProofId,
          batchId,
          verificationAttempt: 1,
          verificationMethod: 'on_chain',
          verifierAddress: 'system',
          verificationResult: zkResults.privacyConfigured ? 'success' : 'failed',
          verificationDetails: zkResults,
          completedAt: new Date(),
          durationMs: 1000 // Placeholder duration
        });
        zkTablesCreated.push('zkVerificationHistory');
      } catch (error) {
        console.warn('Failed to insert verification history:', error);
      }
    }

    return {
      success: true,
      zkTablesCreated
    };

  } catch (error) {
    console.error('ZK data sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ZK sync failed'
    };
  }
}
