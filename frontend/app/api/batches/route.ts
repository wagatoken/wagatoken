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
import { getPinnedFiles } from "@/utils/pinataCache";
import { getSigner, getCoffeeTokenContract } from "@/utils/ethersClient";
import { CoffeeBatch } from "@/utils/types";

// In-memory storage for batch ID to IPFS hash mapping
// In production, use a database
const batchMapping = new Map<number, string>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const pageLimit = parseInt(searchParams.get('limit') ?? '50');

    console.log(`Fetching Ethiopian coffee batches (page ${page}, limit ${pageLimit}) ...`);
    
    // Use cached list to minimise Pinata traffic
    const files = await getPinnedFiles();
    const batches: CoffeeBatch[] = [];

    console.log(`Found ${files.files.length} total files in Pinata`);

    // filter then slice for pagination
    const filtered = files.files.filter(file => file.name?.startsWith('ethiopian-coffee-batch-'));
    const paginated = filtered.slice((page-1)*pageLimit, page*pageLimit);

    for (const file of paginated) {
      if (file.name?.startsWith('ethiopian-coffee-batch-')) {
        try {
          console.log(`Processing pinned file: ${file.name} (CID: ${file.cid})`);
          const data = await pinata.gateways.get(file.cid);
          const batchData: CoffeeBatch = typeof data.data === 'string' ? JSON.parse(data.data) : (data.data as any);
          
          // Ensure the batch data includes IPFS URI
          batchData.ipfsUri = `ipfs://${file.cid}`;
          
          batches.push(batchData);
        } catch (error) {
          console.error(`Error fetching batch data for ${file.cid}:`, error);
        }
      }
    }

    const total = filtered.length;
    console.log(`Successfully retrieved ${batches.length} Ethiopian coffee batches (total ${total})`);
    return NextResponse.json({ batches, page, pageLimit, total }, { status: 200 });
  } catch (error) {
    const errMsg = (error as any)?.response?.data ?? 'Failed to fetch batches';
    console.error("Error fetching batches:", errMsg);
    return NextResponse.json({ error: errMsg },
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

    // Upload to Pinata as JSON - this automatically pins the content
    console.log("Uploading and pinning Ethiopian coffee batch data to IPFS via Pinata...");
    const upload = await pinata.upload.json(completeBatch, {
      metadata: {
        name: `ethiopian-coffee-batch-${batchData.batchId}`,
        keyvalues: {
          batchId: batchData.batchId.toString(),
          packaging: batchData.packaging,
          type: 'ethiopian-coffee-batch',
          farmName: batchData.batchDetails.farmName,
          location: batchData.batchDetails.location
        }
      }
    });

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
      metadataHash: batchData.metadataHash
    };

    console.log(`📝 Smart contract creation data prepared:`, smartContractData);

    // ---- On-chain integration ----
    try {
      const signer = getSigner();
      const coffeeToken = getCoffeeTokenContract(signer);
      console.log("Sending createBatch transaction to WAGACoffeeToken...");
      const tx = await coffeeToken.createBatch(
        smartContractData.ipfsUri,
        smartContractData.productionDate,
        smartContractData.expiryDate,
        smartContractData.pricePerUnit,
        smartContractData.packagingInfo,
        smartContractData.metadataHash
      );
      console.log("⏳ Tx submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Tx confirmed in block", receipt.blockNumber);
    } catch (chainErr) {
      console.error("⚠️  Failed to create batch on-chain", chainErr);
      // We don't fail the whole request; front-end can retry.
    }

    return NextResponse.json({ 
      success: true, 
      cid: upload.cid,
      batch: completeBatch,
      pinned: true,
      smartContractData, // Include for smart contract integration
      message: `Ethiopian coffee batch ${batchData.batchId} ready for blockchain deployment`
    }, { status: 201 });
  } catch (error) {
    const errMsg = (error as any)?.response?.data ?? 'Failed to create batch';
    console.error("Error creating and pinning Ethiopian coffee batch:", errMsg);
    return NextResponse.json({ error: errMsg },
      { status: 500 }
    );
  }
}

