import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = {
      message: "Network debug info",
      contractAddresses: {
        coffeeToken: process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS,
        proofOfReserve: process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS,
        inventoryManager: process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS,
        redemptionContract: process.env.NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS
      },
      chainlinkConfig: {
        router: process.env.NEXT_PUBLIC_CHAINLINK_FUNCTIONS_ROUTER,
        donId: process.env.NEXT_PUBLIC_CHAINLINK_DON_ID,
        subscriptionId: process.env.NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID
      },
      expectedNetwork: "Base Sepolia",
      chainId: 84532
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Debug network error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get network debug info', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
