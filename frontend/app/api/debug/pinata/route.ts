import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasJWT: !!process.env.PINATA_JWT,
      jwtPrefix: process.env.PINATA_JWT ? process.env.PINATA_JWT.substring(0, 20) + '...' : 'NOT_SET',
      gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
      nodeEnv: process.env.NODE_ENV,
      platform: process.env.NETLIFY ? 'netlify' : 'local',
      timestamp: new Date().toISOString()
    };

    // Test direct Pinata API call
    let pinataTest = null;
    if (process.env.PINATA_JWT) {
      try {
        const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.PINATA_JWT}`
          }
        });

        pinataTest = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          authenticated: false
        };

        if (response.ok) {
          const data = await response.json();
          pinataTest.authenticated = data.message === 'Congratulations! You are communicating with the Pinata API!';
        }
      } catch (error: any) {
        pinataTest = {
          error: error.message,
          type: error.constructor.name
        };
      }
    }

    // Test gateway access
    let gatewayTest = null;
    if (process.env.NEXT_PUBLIC_GATEWAY_URL) {
      try {
        const testUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca`;
        const response = await fetch(testUrl, { method: 'HEAD' });
        
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
      success: true
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      type: error.constructor.name,
      success: false
    }, { status: 500 });
  }
}
