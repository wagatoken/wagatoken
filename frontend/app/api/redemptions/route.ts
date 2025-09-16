import { NextResponse, type NextRequest } from "next/server";
import { db } from "../../../db";
import { redemptionRequests, wagaCoffeeBatches } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { RedemptionRequest } from "@/utils/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    console.log(`Fetching redemptions for user: ${userAddress || 'all'}`);

    // Get redemptions from database
    let dbRedemptions;
    if (userAddress) {
      dbRedemptions = await db.select()
        .from(redemptionRequests)
        .where(eq(redemptionRequests.consumer, userAddress))
        .orderBy(desc(redemptionRequests.requestDate));
    } else {
      dbRedemptions = await db.select()
        .from(redemptionRequests)
        .orderBy(desc(redemptionRequests.requestDate));
    }

    // Transform database records to RedemptionRequest format
    const redemptions: RedemptionRequest[] = dbRedemptions.map(r => ({
      redemptionId: r.redemptionId || 0,
      consumer: r.consumer,
      batchId: r.batchId,
      quantity: r.quantity,
      deliveryAddress: r.deliveryAddress,
      requestDate: r.requestDate.toISOString(),
      status: (r.status === 'Processing' ? 'Processing' : 
               r.status === 'Fulfilled' ? 'Fulfilled' : 
               r.status === 'Cancelled' ? 'Cancelled' : 'Requested') as 'Requested' | 'Processing' | 'Fulfilled' | 'Cancelled',
      packagingInfo: r.packagingInfo || '250g',
      trackingNumber: r.trackingNumber || undefined
    }));

    console.log(`Found ${redemptions.length} redemptions`);

    return NextResponse.json({ 
      redemptions,
      usingRealData: true,
      note: 'Using live database data'
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching redemptions from database:", error);
    
    // Fallback to empty array if database fails
    return NextResponse.json({
      redemptions: [],
      usingRealData: false,
      note: 'Database error - returning empty list'
    }, { status: 200 });
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

    console.log(`Creating redemption request for batch ${batchId}, user ${userAddress}`);

    // Verify batch exists in database
    const batch = await db.select()
      .from(wagaCoffeeBatches)
      .where(eq(wagaCoffeeBatches.batchId, batchId))
      .limit(1);

    if (batch.length === 0) {
      return NextResponse.json(
        { error: `Batch ${batchId} not found in database` },
        { status: 404 }
      );
    }

    const batchData = batch[0];

    // Create redemption request in database
    const newRedemption = await db.insert(redemptionRequests).values({
      consumer: userAddress,
      batchId: batchId,
      quantity: quantity,
      deliveryAddress: deliveryAddress,
      requestDate: new Date(),
      status: 'Requested',
      packagingInfo: batchData.packaging
    }).returning();

    // Transform to RedemptionRequest format
    const redemption: RedemptionRequest = {
      redemptionId: newRedemption[0].redemptionId || 0,
      consumer: newRedemption[0].consumer,
      batchId: newRedemption[0].batchId,
      quantity: newRedemption[0].quantity,
      deliveryAddress: newRedemption[0].deliveryAddress,
      requestDate: newRedemption[0].requestDate.toISOString(),
      status: newRedemption[0].status as 'Requested',
      packagingInfo: newRedemption[0].packagingInfo || '250g'
    };

    console.log(`✅ Redemption ${redemption.redemptionId} created for batch ${batchId}`);

    return NextResponse.json({
      success: true,
      redemption,
      usingRealData: true,
      message: `Redemption request ${redemption.redemptionId} created successfully`
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating redemption:", error);
    return NextResponse.json(
      { error: "Failed to create redemption request" },
      { status: 500 }
    );
  }
}
