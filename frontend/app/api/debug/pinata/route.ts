import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic environment check without external dependencies
    const envCheck = {
      hasJWT: !!process.env.PINATA_JWT,
      jwtLength: process.env.PINATA_JWT ? process.env.PINATA_JWT.length : 0,
      gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
      nodeEnv: process.env.NODE_ENV,
      platform: process.env.NETLIFY ? 'netlify' : 'local',
      timestamp: new Date().toISOString(),
      netlifyContext: process.env.CONTEXT || 'unknown'
    };

    // Only test Pinata if we have the JWT
    let pinataTest = null;
    if (process.env.PINATA_JWT) {
      try {
        // Use native fetch instead of Pinata SDK
        const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.PINATA_JWT}`,
            'Content-Type': 'application/json'
          }
        });

        const responseText = await response.text();
        
        pinataTest = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          responseLength: responseText.length,
          authenticated: responseText.includes('Congratulations')
        };
      } catch (error: any) {
        pinataTest = {
          error: error.message,
          type: error.constructor.name
        };
      }
    }

    // Test gateway with a simple HEAD request
    let gatewayTest = null;
    if (process.env.NEXT_PUBLIC_GATEWAY_URL) {
      try {
        const testUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca`;
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        gatewayTest = {
          url: testUrl,
          status: response.status,
          ok: response.ok,
          headers: {
            'content-type': response.headers.get('content-type'),
            'content-length': response.headers.get('content-length')
          }
        };
      } catch (error: any) {
        gatewayTest = {
          error: error.message,
          type: error.constructor.name
        };
      }
    }

    return NextResponse.json({
      environment: envCheck,
      pinataAuth: pinataTest,
      gatewayAccess: gatewayTest,
      success: true,
      message: "Simplified debug API - no external SDK dependencies"
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      type: error.constructor.name,
      stack: error.stack?.substring(0, 500) + '...',
      success: false
    }, { status: 500 });
  }
}
