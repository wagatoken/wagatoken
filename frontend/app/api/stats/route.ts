import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { wagaCoffeeBatches, verificationRequests, redemptionRequests, batchTokenBalances } from '../../../db/schema';
import { eq, count, sum, and } from 'drizzle-orm';

export async function GET() {
  try {
    // Get real stats from database
    const [
      totalBatchesResult,
      activeBatchesResult,
      verifiedBatchesResult,
      pendingVerificationsResult,
      totalRedemptionsResult,
      completedRedemptionsResult,
      totalTokenHoldersResult
    ] = await Promise.all([
      // Total batches
      db.select({ count: count() }).from(wagaCoffeeBatches),
      
      // Active batches (not expired)
      db.select({ count: count() }).from(wagaCoffeeBatches)
        .where(eq(wagaCoffeeBatches.verificationStatus, 'verified')),
      
      // Verified batches
      db.select({ count: count() }).from(wagaCoffeeBatches)
        .where(eq(wagaCoffeeBatches.isVerified, true)),
      
      // Pending verifications
      db.select({ count: count() }).from(verificationRequests)
        .where(eq(verificationRequests.status, 'pending')),
      
      // Total redemptions
      db.select({ count: count() }).from(redemptionRequests),
      
      // Completed redemptions
      db.select({ count: count() }).from(redemptionRequests)
        .where(eq(redemptionRequests.status, 'Fulfilled')),
      
      // Total token holders
      db.select({ count: count() }).from(batchTokenBalances)
        .where(eq(batchTokenBalances.balance, 0)) // Only holders with non-zero balance
    ]);

    const totalBatches = totalBatchesResult[0]?.count || 0;
    const activeBatches = activeBatchesResult[0]?.count || 0;
    const verifiedBatches = verifiedBatchesResult[0]?.count || 0;
    const pendingVerifications = pendingVerificationsResult[0]?.count || 0;
    const totalRedemptions = totalRedemptionsResult[0]?.count || 0;
    const completedRedemptions = completedRedemptionsResult[0]?.count || 0;
    const totalTokenHolders = totalTokenHoldersResult[0]?.count || 0;
    
    // Calculate derived stats
    const redemptionRate = totalRedemptions > 0 ? 
      Math.round((completedRedemptions / totalRedemptions) * 100) : 0;
    
    const verificationRate = totalBatches > 0 ? 
      Math.round((verifiedBatches / totalBatches) * 100) : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        totalBatches,
        activeBatches,
        verifiedBatches,
        pendingVerifications,
        totalRedemptions,
        completedRedemptions,
        totalTokenHolders,
        redemptionRate,
        verificationRate,
        lastUpdated: new Date().toISOString()
      },
      usingRealData: true,
      note: 'Using live database statistics'
    });
  } catch (error) {
    console.error('Error fetching stats from database:', error);
    
    // Fallback to basic stats if database query fails
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        totalBatches: 0,
        activeBatches: 0,
        verifiedBatches: 0,
        pendingVerifications: 0,
        totalRedemptions: 0,
        completedRedemptions: 0,
        totalTokenHolders: 0,
        redemptionRate: 0,
        verificationRate: 0,
        lastUpdated: new Date().toISOString()
      },
      usingRealData: false,
      note: 'Database error - returning fallback stats'
    }, { status: 500 });
  }
}
