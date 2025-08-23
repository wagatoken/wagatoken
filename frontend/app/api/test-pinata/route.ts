import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function GET() {
  try {
    console.log("Testing Pinata connection...");
    
    // Test authentication
    const authResult = await pinata.testAuthentication();
    console.log("✅ Pinata authentication successful:", authResult);
    
    // Test a simple upload
    const testData = {
      message: "Test connection",
      timestamp: new Date().toISOString()
    };
    
    const upload = await pinata.upload.json(testData, {
      metadata: {
        name: `pinata-test-${Date.now()}`,
        keyvalues: {
          type: 'connection-test'
        }
      }
    });
    
    console.log("✅ Test upload successful, CID:", upload.cid);
    
    return NextResponse.json({
      success: true,
      message: "Pinata connection working correctly",
      testCid: upload.cid,
      authResult
    });
    
  } catch (error) {
    console.error("❌ Pinata connection test failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: "Pinata connection failed",
      details: errorMessage
    }, { status: 500 });
  }
}
