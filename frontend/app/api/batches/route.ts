import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";
import { CoffeeBatch } from "@/utils/types";

// In-memory storage for batch ID to IPFS hash mapping
// In production, use a database
const batchMapping = new Map<number, string>();

export async function GET() {
  try {
    console.log("Fetching all pinned coffee batches from Pinata...");
    
    // Get all pinned files from Pinata
    const files = await pinata.files.list();
    const batches: CoffeeBatch[] = [];

    console.log(`Found ${files.files.length} total files in Pinata`);
    
    // Log all file details for debugging
    files.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        cid: file.cid,
        size: file.size,
        mimeType: file.mime_type,
        keyvalues: file.keyvalues
      });
    });

    for (const file of files.files) {
      // Look for coffee batch files by checking keyvalues type
      if (file.keyvalues?.type === 'coffee-batch-metadata') {
        try {
          console.log(`Processing coffee batch file: ${file.name || 'unnamed'} (CID: ${file.cid})`);
          const data = await pinata.gateways.get(file.cid);
          
          // Handle different data formats from Pinata
          let batchData;
          if (typeof data.data === 'string') {
            batchData = JSON.parse(data.data);
          } else if (typeof data.data === 'object') {
            batchData = data.data;
          } else {
            console.log(`Skipping ${file.cid}: not JSON data (${typeof data.data})`);
            continue;
          }
          
          console.log(`✅ Found coffee batch data in ${file.name || file.cid}:`, batchData);
          
          // Transform metadata format to CoffeeBatch format
          let transformedBatch;
          
          if (batchData.properties) {
            // This is metadata format - transform it to match the exact CoffeeBatch interface
            transformedBatch = {
              batchId: file.keyvalues?.batchId ? parseInt(file.keyvalues.batchId) : Math.floor(Math.random() * 1000),
              quantity: batchData.properties.batchSize || 100,
              price: parseFloat(batchData.properties.pricePerUnit) || 15,
              packaging: batchData.properties.packagingInfo || '250g',
              metadataHash: file.cid,
              ipfsUri: `ipfs://${file.cid}`,
              verification: {
                lastVerified: file.keyvalues?.uploadedAt || new Date().toISOString(),
                verificationStatus: 'verified' as const,
                inventoryActual: batchData.properties.batchSize || 100
              },
              batchDetails: {
                farmName: batchData.properties.farmer || batchData.name || 'Highland Farm',
                location: batchData.properties.origin || 'Ethiopia, Sidamo',
                productionDate: batchData.properties.roastDate || new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                processingMethod: batchData.properties.process || 'washed',
                qualityScore: Math.floor(Math.random() * 20) + 80
              },
              createdAt: file.keyvalues?.uploadedAt || new Date().toISOString(),
              updatedAt: file.keyvalues?.uploadedAt || new Date().toISOString()
            };
          } else if (batchData.batchId && batchData.batchDetails) {
            // This is already in the correct format, just ensure ipfsUri
            transformedBatch = {
              ...batchData,
              ipfsUri: `ipfs://${file.cid}`
            };
          } else {
            // Fallback: create a basic batch from whatever data we have
            transformedBatch = {
              batchId: file.keyvalues?.batchId ? parseInt(file.keyvalues.batchId) : Math.floor(Math.random() * 1000),
              quantity: 100,
              price: 15,
              packaging: '250g',
              metadataHash: file.cid,
              ipfsUri: `ipfs://${file.cid}`,
              verification: {
                lastVerified: new Date().toISOString(),
                verificationStatus: 'verified' as const,
                inventoryActual: 100
              },
              batchDetails: {
                farmName: batchData.name || file.name || 'Highland Farm',
                location: 'Ethiopia',
                productionDate: new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                processingMethod: 'washed',
                qualityScore: 85
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          
          batches.push(transformedBatch);
        } catch (error) {
          console.log(`Error processing ${file.cid}:`, error instanceof Error ? error.message : 'Unknown error');
        }
      } else {
        console.log(`Skipping file: ${file.name} (type: ${file.keyvalues?.type || 'unknown'})`);
      }
    }

    for (const file of files.files) {
      // Check if file has a name and log it for debugging
      console.log(`Examining file: ${file.name} (CID: ${file.cid}) - Type: ${file.mime_type}`);
      
      // Try to process ALL files to see what we have, regardless of naming
      try {
        console.log(`Attempting to fetch data for: ${file.name} (CID: ${file.cid})`);
        const data = await pinata.gateways.get(file.cid);
        
        console.log(`Raw data type: ${typeof data.data}, sample:`, 
          typeof data.data === 'string' ? data.data.substring(0, 200) : data.data);
        
        // Handle different data formats from Pinata
        let batchData;
        if (typeof data.data === 'string') {
          try {
            batchData = JSON.parse(data.data);
          } catch (parseError) {
            console.log(`Failed to parse JSON for ${file.name}:`, parseError);
            continue;
          }
        } else if (typeof data.data === 'object') {
          batchData = data.data;
        } else {
          console.log(`Skipping ${file.name} - unexpected data format:`, typeof data.data);
          continue;
        }
        
        console.log(`Parsed data for ${file.name}:`, batchData);
        
        // Check if this looks like a coffee batch by checking for required fields
        if (batchData && 
            typeof batchData === 'object' &&
            (batchData.batchId || batchData.id) && 
            (batchData.batchDetails || batchData.details || batchData.farmName)) {
          
          console.log(`✅ Found coffee batch data in ${file.name}!`);
          
          // Ensure the batch data includes IPFS URI
          batchData.ipfsUri = `ipfs://${file.cid}`;
          
          batches.push(batchData);
          console.log(`Successfully added batch ${batchData.batchId || batchData.id || 'unknown'} to results`);
        } else {
          console.log(`⏭️ Skipping ${file.name} - doesn't match coffee batch structure`);
        }
      } catch (error) {
        console.log(`Error processing ${file.name}:`, error instanceof Error ? error.message : String(error));
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
    const batchData: Omit<CoffeeBatch, 'createdAt' | 'updatedAt' | 'ipfsUri'> = await request.json();

    console.log(`Creating new coffee batch ${batchData.batchId}...`);

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
    console.log("Uploading and pinning coffee batch data to IPFS via Pinata...");
    let upload;
    
    try {
      upload = await pinata.upload.json(completeBatch, {
        metadata: {
          name: `coffee-batch-${batchData.batchId}`,
          keyvalues: {
            batchId: batchData.batchId.toString(),
            packaging: batchData.packaging,
            type: 'coffee-batch',
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

    console.log(`✅ Coffee batch ${batchData.batchId} successfully pinned to IPFS!`);
    console.log(`   CID: ${upload.cid}`);
    console.log(`   IPFS URI: ipfs://${upload.cid}`);
    console.log(`   Pinned file name: coffee-batch-${batchData.batchId}`);

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
      message: `Coffee batch ${batchData.batchId} ready for blockchain deployment`
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating and pinning coffee batch:", error);
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

