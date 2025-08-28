import { NextResponse, type NextRequest } from "next/server";
import { RedemptionRequest } from "@/utils/types";

// Mock storage for demo - in production use a database
const mockRedemptions = new Map<number, RedemptionRequest>();
let nextRedemptionId = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    console.log(`Fetching redemptions for user: ${userAddress || 'all'}`);

    // Get all redemptions
    const allRedemptions = Array.from(mockRedemptions.values());
    
    // Filter by user if address provided
    const redemptions = userAddress 
      ? allRedemptions.filter(r => r.consumer.toLowerCase() === userAddress.toLowerCase())
      : allRedemptions;

    console.log(`Found ${redemptions.length} redemptions`);

    return NextResponse.json({ 
      redemptions: redemptions.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching redemptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch redemptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const redemptionData = await request.json();
    const { batchId, quantity, deliveryAddress, userAddress } = redemptionData;

    if (!batchId || !quantity || !deliveryAddress || !userAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify batch exists
    const batchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/batches/${batchId}`);
    if (!batchResponse.ok) {
      return NextResponse.json(
        { error: `Batch ${batchId} not found` },
        { status: 404 }
      );
    }

    const batchData = await batchResponse.json();

    // Create redemption request
    const redemptionId = nextRedemptionId++;
    const redemption: RedemptionRequest = {
      redemptionId,
      consumer: userAddress,
      batchId,
      quantity,
      deliveryAddress,
      requestDate: new Date().toISOString(),
      status: 'Requested',
      packagingInfo: batchData.packaging
    };

    mockRedemptions.set(redemptionId, redemption);

    console.log(`✅ Redemption ${redemptionId} created for batch ${batchId}`);

    return NextResponse.json({
      success: true,
      redemption,
      message: `Redemption request ${redemptionId} created successfully`
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating redemption:", error);
    return NextResponse.json(
      { error: "Failed to create redemption request" },
      { status: 500 }
    );
  }
}
