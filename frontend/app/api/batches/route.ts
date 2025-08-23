import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import { CoffeeBatch } from "@/utils/types";

// In-memory storage for batch ID to IPFS hash mapping
// In production, use a database
const batchMapping = new Map<number, string>();

export async function GET() {
  try {
    console.log("Fetching all pinned Ethiopian coffee batches from Pinata...");
    
    // Get all pinned files from Pinata
    const files = await pinata.files.list();
    const batches: CoffeeBatch[] = [];

    console.log(`Found ${files.files.length} total files in Pinata`);

    for (const file of files.files) {
      if (file.name?.startsWith('ethiopian-coffee-batch-')) {
        try {
          console.log(`Processing pinned file: ${file.name} (CID: ${file.cid})`);
          const data = await pinata.gateways.get(file.cid);
          
          // Handle different data formats from Pinata
          let batchData;
          if (typeof data.data === 'string') {
            batchData = JSON.parse(data.data);
          } else if (typeof data.data === 'object') {
            batchData = data.data;
          } else {
            console.error(`Unexpected data format for ${file.cid}:`, typeof data.data);
            continue;
          }
          
          // Ensure the batch data includes IPFS URI
          batchData.ipfsUri = `ipfs://${file.cid}`;
          
          batches.push(batchData);
        } catch (error) {
          console.error(`Error fetching batch data for ${file.cid}:`, error);
        }
      }
    }

    console.log(`Successfully retrieved ${batches.length} Ethiopian coffee batches`);
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
    const batchData: Omit<CoffeeBatch, 'createdAt' | 'updatedAt' | 'ipfsUri'> = await request.json();
    
    console.log(`Creating new Ethiopian coffee batch ${batchData.batchId}...`);
    
    // Add timestamps
    const completeBatch: CoffeeBatch = {
      ...batchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Test Pinata connection first
    try {
      console.log("Testing Pinata connection...");
      const testResult = await pinata.testAuthentication();
      console.log("✅ Pinata authentication successful:", testResult);
    } catch (authError) {
      console.error("❌ Pinata authentication failed:", authError);
      return NextResponse.json(
        { error: "IPFS service authentication failed. Please check configuration." },
        { status: 503 }
      );
    }

    // Upload to Pinata as JSON - this automatically pins the content
    console.log("Uploading and pinning Ethiopian coffee batch data to IPFS via Pinata...");
    let upload;
    
    try {
      upload = await pinata.upload.json(completeBatch, {
        metadata: {
          name: `ethiopian-coffee-batch-${batchData.batchId}`,
          keyvalues: {
            batchId: batchData.batchId.toString(),
            packaging: batchData.packaging,
            type: 'ethiopian-coffee-batch',
            farmName: batchData.batchDetails.farmName,
            location: batchData.batchDetails.location,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      if (!upload || !upload.cid) {
        throw new Error("Upload completed but no CID returned");
      }
    } catch (uploadError) {
      console.error("❌ IPFS upload failed:", uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
      return NextResponse.json(
        { error: `Failed to upload to IPFS: ${errorMessage}` },
        { status: 502 }
      );
    }

    // Add IPFS URI to the batch data
    completeBatch.ipfsUri = `ipfs://${upload.cid}`;

    console.log(`✅ Ethiopian coffee batch ${batchData.batchId} successfully pinned to IPFS!`);
    console.log(`   CID: ${upload.cid}`);
    console.log(`   IPFS URI: ipfs://${upload.cid}`);
    console.log(`   Pinned file name: ethiopian-coffee-batch-${batchData.batchId}`);

    // Store mapping
    batchMapping.set(batchData.batchId, upload.cid);

    // Prepare smart contract creation data
    const smartContractData = {
      batchId: batchData.batchId,
      ipfsUri: `ipfs://${upload.cid}`,
      productionDate: Math.floor(new Date(batchData.batchDetails.productionDate).getTime() / 1000),
      expiryDate: Math.floor(new Date(batchData.batchDetails.expiryDate).getTime() / 1000),
      pricePerUnit: batchData.price, // Convert to wei in production
      packagingInfo: batchData.packaging,
      metadataHash: upload.cid
    };

    console.log(`📝 Smart contract creation data prepared:`, smartContractData);

    return NextResponse.json({ 
      success: true, 
      cid: upload.cid,
      batch: completeBatch,
      pinned: true,
      smartContractData, // Include for smart contract integration
      message: `Ethiopian coffee batch ${batchData.batchId} ready for blockchain deployment`
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating and pinning Ethiopian coffee batch:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: "Failed to create batch", 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

