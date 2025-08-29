import { NextResponse, type NextRequest } from "next/server";

// Import the same mock storage (in production this would be your database)
const mockRedemptions = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: { redemptionId: string } }
) {
  try {
    const redemptionId = parseInt(params.redemptionId);

    if (isNaN(redemptionId)) {
      return NextResponse.json(
        { error: "Invalid redemption ID" },
        { status: 400 }
      );
    }

    const redemption = mockRedemptions.get(redemptionId);

    if (!redemption) {
      return NextResponse.json(
        { error: "Redemption not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ redemption }, { status: 200 });

  } catch (error) {
    console.error("Error fetching redemption:", error);
    return NextResponse.json(
      { error: "Failed to fetch redemption" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { redemptionId: string } }
) {
  try {
    const redemptionId = parseInt(params.redemptionId);
    const { status } = await request.json();

    if (isNaN(redemptionId)) {
      return NextResponse.json(
        { error: "Invalid redemption ID" },
        { status: 400 }
      );
    }

    if (!['Requested', 'Processing', 'Fulfilled', 'Cancelled'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const redemption = mockRedemptions.get(redemptionId);

    if (!redemption) {
      return NextResponse.json(
        { error: "Redemption not found" },
        { status: 404 }
      );
    }

    redemption.status = status;
    if (status === 'Fulfilled') {
      redemption.fulfillmentDate = new Date().toISOString();
    }

    mockRedemptions.set(redemptionId, redemption);

    console.log(`📦 Redemption ${redemptionId} status updated to: ${status}`);

    return NextResponse.json({
      success: true,
      redemption,
      message: `Redemption status updated to ${status}`
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating redemption:", error);
    return NextResponse.json(
      { error: "Failed to update redemption" },
      { status: 500 }
    );
  }
}
