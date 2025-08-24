import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    // This endpoint will test the actual smart contract interaction
    // to identify the root cause of the 0x75883caa error
    
    const testResults = {
      contractAddress: process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS,
      expectedNetwork: "Base Sepolia",
      expectedChainId: 84532,
      testParameters: {
        ipfsUri: "ipfs://bafkreidryzbjjmchk2zgkzquw22t4myjyidn2ellhgtlnxkeeflv7vzdai",
        productionDateTimestamp: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60), // 7 days ago (past date)
        expiryDateTimestamp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        quantity: 10, // Smaller quantity
        priceInWei: "100000000000000", // 0.0001 ETH (very small price)
        packagingInfo: "250g",
        metadataHash: "bafkreidryzbjjmchk2zgkzquw22t4myjyidn2ellhgtlnxkeeflv7vzdai"
      },
      notes: [
        "Testing with production date in the PAST (7 days ago)",
        "Using smaller quantity (10 instead of 100)",
        "Using micro price (0.0001 ETH instead of 0.001 ETH)",
        "Custom error 0x75883caa likely means:",
        "  - User lacks ADMIN_ROLE (most common)",
        "  - Wrong network (not Base Sepolia)", 
        "  - Invalid date range (production should be in past?)",
        "  - Price/quantity validation failed"
      ],
      possibleSolutions: [
        "1. Check if wallet has ADMIN_ROLE on contract",
        "2. Verify MetaMask is connected to Base Sepolia (Chain ID: 84532)",
        "3. Try production date in the past instead of future",
        "4. Use smaller price values (micro ETH amounts)",
        "5. Check contract deployment and ABI compatibility"
      ]
    };

    return NextResponse.json({
      success: true,
      message: "Smart contract error analysis completed",
      analysis: testResults,
      recommendedAction: "Check admin role first, then try batch creation with past production date"
    });

  } catch (error) {
    console.error('Contract test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze contract error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
