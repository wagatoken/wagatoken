import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import { CoffeeBatch } from "@/utils/types";

// In-memory storage for batch ID to IPFS hash mapping
// In production, use a proper database
const batchMapping = new Map<number, string>();

export async function GET() {
  try {
    // Get all pinned files from Pinata
    const files = await pinata.files.list();
    const batches: CoffeeBatch[] = [];

    for (const file of files.files) {
      if (file.name?.startsWith('coffee-batch-')) {
        try {
          const data = await pinata.gateways.get(file.cid);
          const batchData = JSON.parse(data.data as string);
          batches.push(batchData);
        } catch (error) {
          console.error(`Error fetching batch data for ${file.cid}:`, error);
        }
      }
    }

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
    
    // Add timestamps
    const completeBatch: CoffeeBatch = {
      ...batchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Upload to Pinata as JSON using simplified method
    const upload = await pinata.upload.json(completeBatch, {
      metadata: {
        name: `coffee-batch-${batchData.batchId}`
      }
    });

    // Store mapping
    batchMapping.set(batchData.batchId, upload.cid);

    return NextResponse.json({ 
      success: true, 
      cid: upload.cid,
      batch: completeBatch 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}

