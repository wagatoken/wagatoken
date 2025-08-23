import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🧪 Testing blockchain-first batch creation logic...");

    // Create mock batch data for testing
    const testBatchData = {
      name: "Test Blockchain-First Coffee",
      description: "Testing the new blockchain-first batch creation flow",
      origin: "Ethiopia",
      farmer: "Test Farmer",
      altitude: "1800m",
      process: "Washed",
      roastProfile: "Medium",
      roastDate: "2025-08-23",
      certifications: ["Organic"],
      cupping_notes: ["Floral", "Citrus"],
      quantity: 100,
      packagingInfo: "250g" as "250g" | "500g",
      pricePerUnit: "0.025",
      productionDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    console.log("✅ Test batch data created:", testBatchData);

    // Test metadata generation
    const { generateCoffeeMetadata } = await import("@/utils/ipfsMetadata");
    const metadata = generateCoffeeMetadata(testBatchData);
    console.log("✅ Metadata generated:", metadata);

    // Test IPFS upload
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/upload-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        metadata,
        filename: "test-blockchain-batch",
        batchId: "TEST-001"
      })
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const uploadResult = await response.json();
    console.log("✅ IPFS upload successful:", uploadResult);

    return NextResponse.json({
      success: true,
      message: "Blockchain-first logic test completed successfully",
      testResults: {
        batchData: testBatchData,
        metadata: metadata,
        ipfsResult: uploadResult
      }
    });

  } catch (error) {
    console.error("❌ Test failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: "Test failed",
      details: errorMessage
    }, { status: 500 });
  }
}
