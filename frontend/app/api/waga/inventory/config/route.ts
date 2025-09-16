import { NextRequest, NextResponse } from 'next/server';

// Production configuration data - these would normally come from the smart contract
// For MVP, we use sensible defaults that would be deployed to the contract
const productionConfig = {
  batchAuditInterval: 7 * 24 * 60 * 60, // 7 days in seconds
  expiryWarningThreshold: 60 * 24 * 60 * 60, // 60 days in seconds
  lowInventoryThreshold: 10,
  longStorageThreshold: 180 * 24 * 60 * 60, // 180 days in seconds
  maxBatchesPerUpkeep: 50,
  intervalSeconds: 24 * 60 * 60 // 24 hours in seconds
};

export async function GET(request: NextRequest) {
  try {
    // In production deployment, this would fetch from the deployed smart contract
    // For MVP, we return production-ready configuration values
    return NextResponse.json({
      success: true,
      config: productionConfig,
      note: 'Using production configuration values (would be stored in smart contract)'
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
