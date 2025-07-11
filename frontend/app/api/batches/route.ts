import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import { CoffeeBatch } from "@/utils/types";

// In-memory storage for batch ID to IPFS hash mapping
// In production, use a proper database
const batchMapping = new Map<number, string>();

export async function GET() {
  try {
    console.log("Fetching all pinned coffee batches from Pinata...");
    
    // Get all pinned files from Pinata
    const files = await pinata.files.list();
    const batches: CoffeeBatch[] = [];

    console.log(`Found ${files.files.length} total files in Pinata`);

    for (const file of files.files) {
      if (file.name?.startsWith('coffee-batch-')) {
        try {
          console.log(`Processing pinned file: ${file.name} (CID: ${file.cid})`);
          const data = await pinata.gateways.get(file.cid);
          const batchData = JSON.parse(data.data as string);
          batches.push(batchData);
        } catch (error) {
          console.error(`Error fetching batch data for ${file.cid}:`, error);
        }
      }
    }

    console.log(`Successfully retrieved ${batches.length} coffee batches`);
    return NextResponse.json({ batches }, { status: 200 });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const batchData: Omit<CoffeeBatch, 'createdAt' | 'updatedAt'> = await request.json();
    
    console.log(`Creating new coffee batch ${batchData.batchId}...`);
    
    // Add timestamps
    const completeBatch: CoffeeBatch = {
      ...batchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Upload to Pinata as JSON - this automatically pins the content
    console.log("Uploading and pinning batch data to IPFS via Pinata...");
    const upload = await pinata.upload.json(completeBatch, {
      metadata: {
        name: `coffee-batch-${batchData.batchId}`,
        // Add additional metadata to help with organization
        keyvalues: {
          batchId: batchData.batchId.toString(),
          packaging: batchData.packaging,
          type: 'coffee-batch'
        }
      }
    });

    console.log(`✅ Batch ${batchData.batchId} successfully pinned to IPFS!`);
    console.log(`   CID: ${upload.cid}`);
    console.log(`   Pinned file name: coffee-batch-${batchData.batchId}`);

    // Store mapping
    batchMapping.set(batchData.batchId, upload.cid);

    return NextResponse.json({ 
      success: true, 
      cid: upload.cid,
      batch: completeBatch,
      pinned: true // Confirm that the file is pinned
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating and pinning batch:", error);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}

