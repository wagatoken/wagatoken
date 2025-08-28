import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { verificationRequests, wagaCoffeeBatches } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const verificationData = await request.json();
    
    const {
      requestId,
      batchId,
      status,
      transactionHash,
      verificationResults
    } = verificationData;

    // Validate required data
    if (!requestId || !batchId || !status) {
      return NextResponse.json(
        { error: 'Missing required verification data (requestId, batchId, status)' },
        { status: 400 }
      );
    }

    // Check if verification request already exists
    const [existingRequest] = await db.select()
      .from(verificationRequests)
      .where(eq(verificationRequests.requestId, requestId));

    if (existingRequest) {
      // Update existing verification request
      const [updatedRequest] = await db.update(verificationRequests)
        .set({
          status,
          completedAt: status === 'completed' ? new Date() : null,
          transactionHash,
          responseData: verificationResults || null
        })
        .where(eq(verificationRequests.requestId, requestId))
        .returning();

      // Update batch verification status if completed
      if (status === 'completed' && verificationResults?.verified) {
        await db.update(wagaCoffeeBatches)
          .set({
            isVerified: true,
            verificationStatus: 'verified',
            updatedAt: new Date()
          })
          .where(eq(wagaCoffeeBatches.batchId, Number(batchId)));
      }

      return NextResponse.json({
        success: true,
        message: 'Verification request updated',
        verificationRequest: updatedRequest
      });
    } else {
      // Create new verification request
      const [newRequest] = await db.insert(verificationRequests).values({
        requestId,
        batchId: Number(batchId),
        status,
        transactionHash,
        responseData: verificationResults || null,
        completedAt: status === 'completed' ? new Date() : null
      }).returning();

      // Update batch verification status if completed
      if (status === 'completed' && verificationResults?.verified) {
        await db.update(wagaCoffeeBatches)
          .set({
            isVerified: true,
            verificationStatus: 'verified',
            updatedAt: new Date()
          })
          .where(eq(wagaCoffeeBatches.batchId, Number(batchId)));
      }

      return NextResponse.json({
        success: true,
        message: 'Verification request tracked in database',
        verificationRequest: newRequest
      });
    }

  } catch (error) {
    console.error('Verification sync error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Verification sync failed'
    }, { status: 500 });
  }
}
