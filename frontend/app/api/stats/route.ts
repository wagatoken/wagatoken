import { NextRequest, NextResponse } from 'next/server';
import { MockDataService } from '../../../utils/mockData';

export async function GET() {
  try {
    // For now, always use mock data
    // TODO: Replace with real database queries when database is configured
    const stats = await MockDataService.getStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      usingMockData: true,
      note: 'Using mock data. Configure database to use real data.'
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        totalBatches: 0,
        activeBatches: 0,
        totalSupply: 0,
        redemptionRate: 0,
        verifiedBatches: 0,
        pendingVerifications: 0
      }
    }, { status: 500 });
  }
}
