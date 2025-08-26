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
      batchData
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

      return NextResponse.json({
        success: true,
        message: 'Batch updated with blockchain confirmation',
        batchId,
        syncedAt: new Date().toISOString(),
        batch: updatedBatch
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
        farmName: batchData.farmerName,
        location: batchData.origin,
        productionDate: batchData.productionDate,
        expiryDate: batchData.expiryDate,
        processingMethod: batchData.processingMethod,
        qualityScore: batchData.qualityScore,
        name: `${batchData.farmerName}'s ${batchData.coffeeType}`,
        description: batchData.description || `Premium ${batchData.coffeeType} from ${batchData.origin}`,
        farmer: batchData.farmerName,
        altitude: batchData.altitude,
        certifications: batchData.certifications,
        isVerified: false, // Will be updated when Chainlink verification completes
        verificationStatus: 'pending'
      }).returning();

      return NextResponse.json({
        success: true,
        message: 'Batch synced to database from blockchain',
        batchId,
        syncedAt: new Date().toISOString(),
        batch: newBatch
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
