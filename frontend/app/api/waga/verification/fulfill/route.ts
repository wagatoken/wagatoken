import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { verificationRequests, wagaCoffeeBatches } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * API route to handle Chainlink Functions fulfillment results
 * This should be called when verification is completed on-chain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      requestId,
      batchId,
      verified,
      verifiedQuantity,
      verifiedPrice,
      verifiedPackaging,
      verifiedMetadataHash,
      transactionHash,
      gasUsed,
      error
    } = body;

    // Validate required fields
    if (!requestId || !batchId) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, batchId' },
        { status: 400 }
      );
    }

    console.log(`Processing verification fulfillment for request ${requestId}`);

    // Find existing verification request
    const existingRequest = await db.select()
      .from(verificationRequests)
      .where(eq(verificationRequests.requestId, requestId))
      .limit(1);

    if (existingRequest.length === 0) {
      return NextResponse.json(
        { error: `Verification request ${requestId} not found` },
        { status: 404 }
      );
    }

    // Update verification request with results
    const updateData: any = {
      status: error ? 'failed' : (verified ? 'fulfilled' : 'completed'),
      completedAt: new Date(),
      verified: verified || false,
      transactionHash,
      gasUsed,
      error: error || null
    };

    // Add verified data if successful
    if (verified && !error) {
      updateData.verifiedQuantity = verifiedQuantity;
      updateData.verifiedPrice = verifiedPrice;
      updateData.verifiedPackaging = verifiedPackaging;
      updateData.verifiedMetadataHash = verifiedMetadataHash;
      updateData.responseData = {
        verifiedQuantity,
        verifiedPrice,
        verifiedPackaging,
        verifiedMetadataHash,
        timestamp: new Date().toISOString()
      };
    }

    // Update verification request
    await db.update(verificationRequests)
      .set(updateData)
      .where(eq(verificationRequests.requestId, requestId));

    // Update batch verification status if successful
    if (verified && !error) {
      await db.update(wagaCoffeeBatches)
        .set({
          isVerified: true,
          verificationStatus: 'verified',
          lastVerified: new Date(),
          // Update verified metadata if different from stored
          ...(verifiedMetadataHash && verifiedMetadataHash !== existingRequest[0].verifiedMetadataHash && {
            metadataHash: verifiedMetadataHash
          })
        })
        .where(eq(wagaCoffeeBatches.batchId, Number(batchId)));
      
      console.log(`✅ Batch ${batchId} marked as verified`);
    } else {
      await db.update(wagaCoffeeBatches)
        .set({
          verificationStatus: 'failed',
          lastVerified: new Date()
        })
        .where(eq(wagaCoffeeBatches.batchId, Number(batchId)));
      
      console.log(`❌ Batch ${batchId} verification failed`);
    }

    return NextResponse.json({
      success: true,
      message: `Verification fulfillment processed for request ${requestId}`,
      result: {
        requestId,
        batchId,
        verified: verified || false,
        status: updateData.status
      }
    });

  } catch (error) {
    console.error('Error processing verification fulfillment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process verification fulfillment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check verification request status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing requestId parameter' },
        { status: 400 }
      );
    }

    const verificationRequest = await db.select()
      .from(verificationRequests)
      .where(eq(verificationRequests.requestId, requestId))
      .limit(1);

    if (verificationRequest.length === 0) {
      return NextResponse.json(
        { error: `Verification request ${requestId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: verificationRequest[0]
    });

  } catch (error) {
    console.error('Error fetching verification request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification request' },
      { status: 500 }
    );
  }
}
