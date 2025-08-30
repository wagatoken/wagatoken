import { NextRequest, NextResponse } from 'next/server';

// Mock verification history data - in production, this would come from events/logs
const mockHistory = [
  {
    batchId: 1,
    verificationType: 'inventory_check',
    timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    result: 'success' as const,
    details: 'Inventory verified successfully - 1000 units available'
  },
  {
    batchId: 2,
    verificationType: 'expiry_check',
    timestamp: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
    result: 'success' as const,
    details: 'Batch expiry check passed - 45 days remaining'
  },
  {
    batchId: 1,
    verificationType: 'low_inventory_check',
    timestamp: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
    result: 'failed' as const,
    details: 'Low inventory detected - only 5 units remaining'
  },
  {
    batchId: 3,
    verificationType: 'long_storage_check',
    timestamp: Math.floor(Date.now() / 1000) - 345600, // 4 days ago
    result: 'success' as const,
    details: 'Storage duration check passed - 120 days in storage'
  },
  {
    batchId: 2,
    verificationType: 'manual_verification',
    timestamp: Math.floor(Date.now() / 1000) - 432000, // 5 days ago
    result: 'success' as const,
    details: 'Manual verification triggered by admin'
  }
];

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch from blockchain events or database
    return NextResponse.json({
      success: true,
      history: mockHistory
    });
    
  } catch (error) {
    console.error('Error fetching verification history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification history' },
      { status: 500 }
    );
  }
}
