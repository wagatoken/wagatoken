import { NextResponse, type NextRequest } from "next/server";

// Simulate a simple in-memory store for demo purposes
// In production, this would query your smart contract or database
const mockRequestStore = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Extract timestamp from request ID to simulate realistic timing
    const timestamp = parseInt(requestId.slice(2, 10), 16);
    const elapsedSeconds = (Date.now() - timestamp) / 1000;

    // Simulate different states based on elapsed time
    let status: string;
    let result = null;
    let error = null;

    if (elapsedSeconds < 30) {
      status = 'pending';
    } else if (elapsedSeconds < 90) {
      // Simulate some failures for realism
      const shouldFail = Math.random() < 0.15; // 15% failure rate
      
      if (shouldFail) {
        status = 'failed';
        error = 'Batch verification failed: Network timeout';
      } else {
        status = 'fulfilled';
        result = {
          verifiedQuantity: 100 + Math.floor(Math.random() * 50),
          verifiedPrice: 25 + Math.floor(Math.random() * 10),
          verifiedPackaging: Math.random() > 0.5 ? "250g" : "500g",
          verifiedMetadataHash: `Qm${Math.random().toString(36).substring(2, 44)}`,
          verified: true
        };
      }
    } else {
      // After 90 seconds, assume it completed
      status = 'fulfilled';
      result = {
        verifiedQuantity: 100,
        verifiedPrice: 25,
        verifiedPackaging: "250g",
        verifiedMetadataHash: `QmX${Math.random().toString(36).substring(2, 43)}`,
        verified: true
      };
    }

    const mockResponse = {
      requestId,
      status,
      batchId: 2025000001,
      verificationType: 'inventory',
      submittedAt: new Date(timestamp).toISOString(),
      completedAt: status === 'fulfilled' ? new Date().toISOString() : null,
      result,
      error,
      transactionHash: status === 'fulfilled' ? `0x${Math.random().toString(16).substring(2, 66)}` : null,
      chainlinkResponse: status === 'fulfilled' ? {
        gasUsed: 150000 + Math.floor(Math.random() * 50000),
        executionTime: `${(Math.random() * 2 + 1).toFixed(1)}s`,
        nodesResponded: Math.floor(Math.random() * 3) + 7 // 7-9 nodes
      } : null
    };

    console.log(`📊 Status check for ${requestId}: ${status}`);

    return NextResponse.json(mockResponse, { status: 200 });

  } catch (error) {
    console.error("Error fetching verification status:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}
