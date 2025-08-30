import { NextRequest, NextResponse } from 'next/server';

// Mock configuration data - in production, this would come from the smart contract
const mockConfig = {
  batchAuditInterval: 7 * 24 * 60 * 60, // 7 days in seconds
  expiryWarningThreshold: 60 * 24 * 60 * 60, // 60 days in seconds
  lowInventoryThreshold: 10,
  longStorageThreshold: 180 * 24 * 60 * 60, // 180 days in seconds
  maxBatchesPerUpkeep: 50,
  intervalSeconds: 24 * 60 * 60 // 24 hours in seconds
};

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch from the smart contract
    return NextResponse.json({
      success: true,
      config: mockConfig
    });
    
  } catch (error) {
    console.error('Error fetching verification config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'batchAuditInterval',
      'expiryWarningThreshold', 
      'lowInventoryThreshold',
      'longStorageThreshold',
      'maxBatchesPerUpkeep',
      'intervalSeconds'
    ];
    
    for (const field of requiredFields) {
      if (typeof body[field] !== 'number') {
        return NextResponse.json(
          { error: `Missing or invalid field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // In production, this would update the smart contract
    console.log('Updating verification configuration:', body);
    
    // Simulate successful update
    return NextResponse.json({
      success: true,
      message: 'Verification configuration updated successfully',
      config: body
    });
    
  } catch (error) {
    console.error('Error updating verification config:', error);
    return NextResponse.json(
      { error: 'Failed to update verification configuration' },
      { status: 500 }
    );
  }
}
