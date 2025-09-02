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
      if (batch.expiryDate) {
        const expiryTimestamp = batch.expiryDate instanceof Date
          ? Math.floor(batch.expiryDate.getTime() / 1000)
          : typeof batch.expiryDate === 'number'
          ? batch.expiryDate
          : now + 1; // Default to not expired if format unknown

        if (now > expiryTimestamp) {
          status = 'expired';
          alerts.push('Batch expired');
        }
      }
      
      // Check for low inventory using inventoryActual field
      const availableQuantity = batch.inventoryActual || batch.quantity;
      if (availableQuantity <= 10 && availableQuantity > 0) {
        status = 'low_inventory';
        alerts.push('Low inventory warning');
      }
      
      // Check for long storage
      if (batch.productionDate) {
        const productionTimestamp = batch.productionDate instanceof Date
          ? Math.floor(batch.productionDate.getTime() / 1000)
          : typeof batch.productionDate === 'number'
          ? batch.productionDate
          : now - (30 * 24 * 60 * 60); // Default to 30 days ago if format unknown

        const daysInStorage = (now - productionTimestamp) / (24 * 60 * 60);
        if (daysInStorage >= 180) {
          status = 'long_storage';
          alerts.push('Long storage warning');
        }
      }
      
      return {
        batchId: batch.batchId,
        name: batch.name || `Batch ${batch.batchId}`,
        quantity: batch.quantity,
        mintedQuantity: 0, // Database doesn't track minted quantity yet
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
