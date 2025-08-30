import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { wagaCoffeeBatches } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get all batches with their verification status
    const batches = await db.select().from(wagaCoffeeBatches);
    
    // Transform data to include inventory tracking information
    const inventoryBatches = batches.map(batch => {
      const now = Math.floor(Date.now() / 1000);
      const lastVerified = batch.lastVerifiedTimestamp || 0;
      const nextVerification = lastVerified + (7 * 24 * 60 * 60); // 7 days default
      
      // Determine status and alerts
      const alerts: string[] = [];
      let status: 'verified' | 'pending' | 'expired' | 'low_inventory' | 'long_storage' = 'verified';
      
      // Check if verification is pending
      if (now > nextVerification) {
        status = 'pending';
        alerts.push('Verification overdue');
      }
      
      // Check if batch is expired
      if (batch.expiryDate && now > batch.expiryDate) {
        status = 'expired';
        alerts.push('Batch expired');
      }
      
      // Check for low inventory
      const availableQuantity = batch.quantity - batch.mintedQuantity;
      if (availableQuantity <= 10 && availableQuantity > 0) {
        status = 'low_inventory';
        alerts.push('Low inventory warning');
      }
      
      // Check for long storage
      const daysInStorage = (now - batch.productionDate) / (24 * 60 * 60);
      if (daysInStorage >= 180) {
        status = 'long_storage';
        alerts.push('Long storage warning');
      }
      
      return {
        batchId: batch.batchId,
        name: batch.name || `Batch ${batch.batchId}`,
        quantity: batch.quantity,
        mintedQuantity: batch.mintedQuantity || 0,
        availableQuantity: availableQuantity,
        lastVerified: lastVerified,
        nextVerification: nextVerification,
        status: status,
        alerts: alerts
      };
    });
    
    return NextResponse.json({
      success: true,
      batches: inventoryBatches
    });
    
  } catch (error) {
    console.error('Error fetching inventory batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory batches' },
      { status: 500 }
    );
  }
}
