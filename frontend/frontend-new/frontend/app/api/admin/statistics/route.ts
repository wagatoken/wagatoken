import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { wagaCoffeeBatches, verificationRequests, redemptionRequests } from '../../../../db/schema';
import { count, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get batch statistics
    const [totalBatches] = await db.select({ count: count() }).from(wagaCoffeeBatches);
    const [verifiedBatches] = await db.select({ count: count() })
      .from(wagaCoffeeBatches)
      .where(eq(wagaCoffeeBatches.isVerified, true));
    const [pendingVerification] = await db.select({ count: count() })
      .from(wagaCoffeeBatches)
      .where(eq(wagaCoffeeBatches.isVerified, false));

    // Get verification request statistics
    const [totalVerificationRequests] = await db.select({ count: count() }).from(verificationRequests);
    const [pendingVerificationRequests] = await db.select({ count: count() })
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'pending'));

    // Get redemption statistics
    const [totalRedemptions] = await db.select({ count: count() }).from(redemptionRequests);
    const [pendingRedemptions] = await db.select({ count: count() })
      .from(redemptionRequests)
      .where(eq(redemptionRequests.status, 'Requested'));

    // Get recent batches (last 5)
    const recentBatches = await db.select({
      id: wagaCoffeeBatches.id,
      batchId: wagaCoffeeBatches.batchId,
      farmName: wagaCoffeeBatches.farmName,
      location: wagaCoffeeBatches.location,
      quantity: wagaCoffeeBatches.quantity,
      isVerified: wagaCoffeeBatches.isVerified,
      createdAt: wagaCoffeeBatches.createdAt
    })
    .from(wagaCoffeeBatches)
    .orderBy(wagaCoffeeBatches.createdAt)
    .limit(5);

    return NextResponse.json({
      success: true,
      statistics: {
        batches: {
          total: totalBatches.count,
          verified: verifiedBatches.count,
          pendingVerification: pendingVerification.count
        },
        verificationRequests: {
          total: totalVerificationRequests.count,
          pending: pendingVerificationRequests.count
        },
        redemptions: {
          total: totalRedemptions.count,
          pending: pendingRedemptions.count
        }
      },
      recentBatches,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database statistics error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics'
    }, { status: 500 });
  }
}
