import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if JWT is available
    const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    
    if (!pinataJWT) {
      return NextResponse.json({
        success: false,
        error: 'Pinata JWT not configured',
        available_vars: {
          NEXT_PUBLIC_PINATA_JWT: !!process.env.NEXT_PUBLIC_PINATA_JWT,
          PINATA_JWT: !!process.env.NEXT_PUBLIC_PINATA_JWT,
          NODE_ENV: process.env.NODE_ENV
        }
      });
    }

    // Test Pinata authentication
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`
      }
    });

    const responseData = await response.text();
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'IPFS (Pinata) connection successful',
        status: response.status,
        data: responseData
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Pinata authentication failed',
        status: response.status,
        response: responseData,
        jwt_length: pinataJWT?.length || 0
      });
    }
  } catch (error) {
    console.error('IPFS test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: 'network_error'
    });
  }
}
