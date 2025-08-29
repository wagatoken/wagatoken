import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import { CoffeeBatch, ChainlinkFunctionsResponse } from "@/utils/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const batchId = parseInt(params.batchId);
    
    // Search for the coffee batch in Pinata files
    const files = await pinata.files.list();
    const batchFile = files.files.find(file => 
      file.name === `coffee-batch-${batchId}`
    );

    if (!batchFile) {
      return NextResponse.json(
        { error: `Coffee batch ${batchId} not found` },
        { status: 404 }
      );
    }

    // Fetch the batch data using the gateway
    const data = await pinata.gateways.get(batchFile.cid);
    const batchData: CoffeeBatch = JSON.parse(data.data as string);

    // Return in the format expected by Chainlink Functions and smart contracts
    const response: ChainlinkFunctionsResponse = {
      quantity: batchData.quantity,
      price: batchData.price,
      packaging: batchData.packaging,
      metadataHash: batchData.metadataHash
    };

    console.log(`📦 Retrieved coffee batch ${batchId} for verification`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching coffee batch:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const batchId = parseInt(params.batchId);
    const updateData = await request.json();

    // Find existing batch
    const files = await pinata.files.list();
    const batchFile = files.files.find(file => 
      file.name === `coffee-batch-${batchId}`
    );

    if (!batchFile) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      );
    }

    // Get existing data
    const data = await pinata.gateways.get(batchFile.cid);
    const existingBatch: CoffeeBatch = JSON.parse(data.data as string);

    // Update data
    const updatedBatch: CoffeeBatch = {
      ...existingBatch,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Upload updated version using the correct SDK method
    const upload = await pinata.upload.json(updatedBatch, {
      metadata: {
        name: `coffee-batch-${batchId}`
      }
    });

    // Delete old version using the updated method
    await pinata.files.delete([batchFile.id]);

    return NextResponse.json({ 
      success: true, 
      cid: upload.cid,
      batch: updatedBatch 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json(
      { error: "Failed to update batch" },
      { status: 500 }
    );
  }
}

