export const runtime = 'nodejs';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import { CoffeeBatch, ChainlinkFunctionsResponse } from "@/utils/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const batchId = parseInt(params.batchId);
    
    // Search for the Ethiopian coffee batch in Pinata files
    const files = await pinata.files.list();
    const batchFile = files.files.find(file => 
      file.name === `ethiopian-coffee-batch-${batchId}`
    );

    if (!batchFile) {
      return NextResponse.json(
        { error: `Ethiopian coffee batch ${batchId} not found` },
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

    console.log(`📦 Retrieved Ethiopian coffee batch ${batchId} for verification`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errMsg = (error as any)?.response?.data ?? 'Failed to fetch batch';
    console.error("Error fetching Ethiopian coffee batch:", errMsg);
    return NextResponse.json({ error: errMsg },
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
      file.name === `ethiopian-coffee-batch-${batchId}`
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
        name: `ethiopian-coffee-batch-${batchId}`
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
    const errMsg = (error as any)?.response?.data ?? 'Failed to update batch';
    console.error("Error updating batch:", errMsg);
    return NextResponse.json({ error: errMsg },
      { status: 500 }
    );
  }
}

