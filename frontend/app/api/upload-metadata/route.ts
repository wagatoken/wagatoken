import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(request: NextRequest) {
  try {
    const { metadata, filename, batchId } = await request.json();
    
    if (!metadata) {
      return NextResponse.json(
        { success: false, error: "Metadata is required" },
        { status: 400 }
      );
    }

    console.log("Uploading metadata to IPFS via Pinata...");
    if (batchId) {
      console.log(`Creating metadata for batch ID: ${batchId}`);
    }

    // Test Pinata connection first
    try {
      await pinata.testAuthentication();
      console.log("✅ Pinata authentication verified");
    } catch (authError) {
      console.error("❌ Pinata authentication failed:", authError);
      return NextResponse.json(
        { success: false, error: "IPFS service authentication failed" },
        { status: 503 }
      );
    }

    // Determine filename and metadata
    const pinataFilename = filename || `coffee-metadata-${Date.now()}`;
    const keyvalues: Record<string, string> = {
      type: 'coffee-batch-metadata',
      uploadedAt: new Date().toISOString()
    };

    if (batchId) {
      keyvalues.batchId = batchId.toString();
      keyvalues.blockchainBatchId = batchId.toString();
    }

    // Upload JSON metadata to Pinata
    const upload = await pinata.upload.json(metadata, {
      metadata: {
        name: pinataFilename,
        keyvalues
      }
    });

    if (!upload || !upload.cid) {
      throw new Error("Upload completed but no CID returned");
    }

    console.log("✅ Metadata uploaded to IPFS successfully");
    console.log("   CID:", upload.cid);
    console.log("   IPFS URI:", `ipfs://${upload.cid}`);
    console.log("   Filename:", pinataFilename);

    return NextResponse.json({
      success: true,
      cid: upload.cid,
      ipfsUri: `ipfs://${upload.cid}`,
      filename: pinataFilename,
      message: "Metadata uploaded successfully"
    });

  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to upload metadata to IPFS", 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
