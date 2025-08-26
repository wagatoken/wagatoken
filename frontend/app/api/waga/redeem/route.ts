import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { redemptionRequests, wagaCoffeeBatches, batchTokenBalances } from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      batchId,
      userAddress,
      requestedQuantity,
      requestNotes,
      shippingAddress
    } = body;

    // Validate required fields
    if (!batchId || !userAddress || !requestedQuantity) {
      return NextResponse.json(
        { error: 'Missing required fields (batchId, userAddress, requestedQuantity)' },
        { status: 400 }
      );
    }

    // Check if batch exists and is verified
    const [batch] = await db.select().from(wagaCoffeeBatches).where(eq(wagaCoffeeBatches.batchId, Number(batchId)));
    
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    if (!batch.isVerified) {
      return NextResponse.json(
        { error: 'Batch must be verified before redemption' },
        { status: 400 }
      );
    }

    // Check if user has sufficient token balance
    const [tokenBalance] = await db.select()
      .from(batchTokenBalances)
      .where(
        and(
          eq(batchTokenBalances.batchId, Number(batchId)),
          eq(batchTokenBalances.holderAddress, userAddress)
        )
      );

    if (!tokenBalance || tokenBalance.balance < Number(requestedQuantity)) {
      return NextResponse.json(
        { error: 'Insufficient token balance for redemption' },
        { status: 400 }
      );
    }

    // Create redemption request
    const [redemptionRequest] = await db.insert(redemptionRequests).values({
      batchId: Number(batchId),
      consumer: userAddress, // Changed from userAddress to consumer
      quantity: Number(requestedQuantity), // Changed to integer and field name
      status: 'Requested', // Changed to match schema default
      deliveryAddress: shippingAddress?.address || '', // Changed field name
      deliveryCity: shippingAddress?.city,
      deliveryState: shippingAddress?.state,
      deliveryZip: shippingAddress?.zip,
      deliveryCountry: shippingAddress?.country || 'USA',
      specialInstructions: requestNotes || null
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Redemption request created successfully',
      redemptionRequest
    });

  } catch (error) {
    console.error('Error creating redemption request:', error);
    return NextResponse.json(
      { error: 'Failed to create redemption request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const status = searchParams.get('status');
    
    // Build query with filters
    let requests;
    
    if (userAddress && status) {
      requests = await db.select().from(redemptionRequests)
        .where(and(
          eq(redemptionRequests.consumer, userAddress), // Changed from userAddress to consumer
          eq(redemptionRequests.status, status)
        ));
    } else if (userAddress) {
      requests = await db.select().from(redemptionRequests)
        .where(eq(redemptionRequests.consumer, userAddress)); // Changed from userAddress to consumer
    } else if (status) {
      requests = await db.select().from(redemptionRequests)
        .where(eq(redemptionRequests.status, status));
    } else {
      requests = await db.select().from(redemptionRequests);
    }
    
    return NextResponse.json({
      success: true,
      redemptionRequests: requests
    });

  } catch (error) {
    console.error('Error fetching redemption requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemption requests' },
      { status: 500 }
    );
  }
}
