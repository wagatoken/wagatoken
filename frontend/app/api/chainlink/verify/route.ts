import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { batchId, recipient, verificationType } = await request.json();

    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      );
    }

    // Get the source code from the existing endpoint
    const sourceCodeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/chainlink/source-code`);
    
    if (!sourceCodeResponse.ok) {
      throw new Error('Failed to fetch source code');
    }

    const { sourceCode } = await sourceCodeResponse.json();

    // Verify the batch exists by checking our API
    const batchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/batches/${batchId}`);
    
    if (!batchResponse.ok) {
      return NextResponse.json(
        { error: `Batch ${batchId} not found` },
        { status: 404 }
      );
    }

    // Generate a realistic request ID (in production, this comes from smart contract)
    const requestId = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;

    // Prepare verification request data
    const verificationData = {
      batchId,
      sourceCode,
      recipient: recipient || null,
      verificationType: verificationType || 'inventory',
      contractAddresses: {
        proofOfReserve: process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS,
        inventoryManager: process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS
      },
      chainlinkConfig: {
        subscriptionId: process.env.NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID,
        donId: process.env.NEXT_PUBLIC_CHAINLINK_DON_ID,
        routerAddress: process.env.NEXT_PUBLIC_CHAINLINK_FUNCTIONS_ROUTER
      }
    };

    // Store verification request (in production, use a database)
    console.log(`🔗 Chainlink Functions verification requested:`, {
      requestId,
      batchId,
      verificationType,
      timestamp: new Date().toISOString(),
      contractCall: `${verificationType === 'reserve' ? 'requestReserveVerification' : 'requestInventoryVerification'}(${batchId})`
    });

    // Simulate the smart contract interaction delay
    setTimeout(async () => {
      console.log(`⏱️  Simulating Chainlink Functions execution for request ${requestId}...`);
    }, 1000);

    return NextResponse.json({
      success: true,
      requestId,
      batchId,
      verificationType,
      status: 'pending',
      estimatedCompletionTime: new Date(Date.now() + 90000).toISOString(), // 1.5 minutes
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`, // Simulated tx hash
      message: `Chainlink Functions ${verificationType} verification initiated for batch ${batchId}`
    }, { status: 200 });

  } catch (error) {
    console.error("Error triggering Chainlink Functions verification:", error);
    return NextResponse.json(
      { 
        error: "Failed to trigger verification",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
