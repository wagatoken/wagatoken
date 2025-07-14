import { NextResponse, type NextRequest } from "next/server";
import { UserTokenBalance } from "@/utils/types";
import { pinata } from "@/utils/config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address required" },
        { status: 400 }
      );
    }

    // Fetch actual Ethiopian coffee batches from IPFS
    const batchesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/batches`);
    
    if (!batchesResponse.ok) {
      throw new Error('Failed to fetch batches');
    }

    const { batches } = await batchesResponse.json();
    
    // In production, this would query the smart contract for actual token balances
    // For now, simulate based on existing verified Ethiopian coffee batches
    const userBalances: UserTokenBalance[] = batches
      .filter((batch: any) => batch.verification.verificationStatus === 'verified')
      .slice(0, 3) // Limit for demo
      .map((batch: any) => ({
        batchId: batch.batchId,
        balance: Math.floor(Math.random() * 20) + 5, // Simulate owned tokens
        batchDetails: {
          farmName: batch.batchDetails.farmName,
          location: batch.batchDetails.location,
          packaging: batch.packaging,
          pricePerUnit: batch.price
        }
      }));

    console.log(`Fetched ${userBalances.length} Ethiopian coffee token balances for ${userAddress}`);

    return NextResponse.json({ 
      balances: userBalances,
      totalBatches: userBalances.length,
      totalTokens: userBalances.reduce((sum, b) => sum + b.balance, 0),
      note: "Token balances will be fetched from smart contract in production"
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user token balances:", error);
    return NextResponse.json(
      { error: "Failed to fetch token balances" },
      { status: 500 }
    );
  }
}
    