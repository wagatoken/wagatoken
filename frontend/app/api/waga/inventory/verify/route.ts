import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { wagaCoffeeBatches, verificationRequests } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.batchId || typeof body.batchId !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid batchId' },
        { status: 400 }
      );
    }
    
    console.log(`Triggering verification for batch ${body.batchId}`);
    
    // Check if batch exists in database
    const batch = await db.select()
      .from(wagaCoffeeBatches)
      .where(eq(wagaCoffeeBatches.batchId, body.batchId))
      .limit(1);
    
    if (batch.length === 0) {
      return NextResponse.json(
        { error: `Batch ${body.batchId} not found` },
        { status: 404 }
      );
    }
    
    const batchData = batch[0];
    
    // Create verification request in database
    const verificationRequest = await db.insert(verificationRequests).values({
      requestId: `verify_${body.batchId}_${Date.now()}`,
      batchId: body.batchId,
      verificationType: 'reserve',
      status: 'pending',
      submittedAt: new Date()
    }).returning();
    
    // Update batch verification status to pending
    await db.update(wagaCoffeeBatches)
      .set({ 
        verificationStatus: 'pending',
        lastVerified: new Date()
      })
      .where(eq(wagaCoffeeBatches.batchId, body.batchId));
    
    // In production, this would trigger Chainlink Functions
    // For now, simulate verification process
    const verificationResult = {
      batchId: body.batchId,
      requestId: verificationRequest[0].requestId,
      timestamp: Math.floor(Date.now() / 1000),
      result: 'success',
      details: `Verification initiated for batch ${body.batchId}`,
      verifiedQuantity: batchData.quantity,
      verifiedPrice: batchData.price,
      verifiedPackaging: batchData.packaging,
      verifiedMetadataHash: batchData.metadataHash,
      usingRealData: true
    };
    
    return NextResponse.json({
      success: true,
      message: `Verification triggered for batch ${body.batchId}`,
      verificationResult,
      note: 'Verification request stored in database'
    });
    
  } catch (error) {
    console.error('Error triggering verification:', error);
    return NextResponse.json(
      { error: 'Failed to trigger verification' },
      { status: 500 }
    );
  }
}
