import { NextRequest, NextResponse } from 'next/server';
import { MockDataService } from '../../../utils/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'Address parameter required'
      }, { status: 400 });
    }
    
    // For now, always use mock data
    // TODO: Replace with real database queries when database is configured
    const user = await MockDataService.getUser(address);
    
    return NextResponse.json({
      success: true,
      data: user,
      usingMockData: true,
      note: 'Using mock data. Configure database to use real data.'
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // For now, use mock data service to create/update user
    // TODO: Replace with real database operations when database is configured
    const { address, batchId, balance } = userData;
    
    if (balance !== undefined && batchId) {
      await MockDataService.updateUserBalance(address, batchId, balance);
    }
    
    return NextResponse.json({
      success: true,
      message: 'User data updated',
      usingMockData: true,
      note: 'Using mock data. Configure database to persist data.'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
