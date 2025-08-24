import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log("🧪 Testing complete batch creation with realistic data...");

    // Create realistic coffee batch data
    const testBatchData = {
      name: "Premium Ethiopian Sidama Coffee",
      description: "Single-origin coffee from the Sidama region with floral notes and bright acidity",
      origin: "Sidama, Ethiopia", 
      farmer: "Abebe Bekele Cooperative",
      altitude: "1,800-2,100m",
      process: "Washed",
      roastProfile: "Medium",
      roastDate: new Date().toISOString().split('T')[0],
      certifications: ["Organic", "Fair Trade"],
      cupping_notes: ["Floral", "Citrus", "Bright acidity", "Stone fruit"],
      quantity: 50, // 50 bags
      packagingInfo: "250g" as "250g" | "500g",
      pricePerUnit: "28.50", // $28.50 per bag - realistic coffee price
      productionDate: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)), // 5 days ago
      expiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
    };

    console.log("📝 Test batch data prepared:", testBatchData);

    // Test metadata generation
    const { generateCoffeeMetadata } = await import("@/utils/ipfsMetadata");
    const metadata = generateCoffeeMetadata(testBatchData);
    
    console.log("✅ Generated metadata:", metadata);
    console.log("💰 Price conversion test:");
    console.log(`   Input: $${testBatchData.pricePerUnit}`);
    console.log(`   Stored as cents: ${metadata.properties.pricePerUnit}`);
    console.log(`   Should be: ${Math.round(parseFloat(testBatchData.pricePerUnit) * 100)}`);

    // Test IPFS upload
    const ipfsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/upload-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        metadata,
        filename: `premium-ethiopian-sidama-${Date.now()}`
      })
    });

    if (!ipfsResponse.ok) {
      throw new Error(`IPFS upload failed: ${ipfsResponse.statusText}`);
    }

    const ipfsResult = await ipfsResponse.json();
    console.log("📤 IPFS upload successful:", ipfsResult);

    // Prepare smart contract parameters
    const productionDateTimestamp = Math.floor(testBatchData.productionDate.getTime() / 1000);
    const expiryDateTimestamp = Math.floor(testBatchData.expiryDate.getTime() / 1000);
    const priceInCents = Math.round(parseFloat(testBatchData.pricePerUnit) * 100);

    const contractParams = {
      ipfsUri: ipfsResult.ipfsUri,
      productionDateTimestamp,
      expiryDateTimestamp,
      quantity: testBatchData.quantity,
      priceInCents, // Now in cents instead of wei
      packagingInfo: testBatchData.packagingInfo,
      metadataHash: ipfsResult.cid
    };

    console.log("🔗 Smart contract parameters:");
    console.log("   IPFS URI:", contractParams.ipfsUri);
    console.log("   Production Date:", new Date(productionDateTimestamp * 1000).toISOString());
    console.log("   Expiry Date:", new Date(expiryDateTimestamp * 1000).toISOString());
    console.log("   Quantity:", contractParams.quantity);
    console.log("   Price (cents):", contractParams.priceInCents, `($${(contractParams.priceInCents / 100).toFixed(2)})`);
    console.log("   Packaging:", contractParams.packagingInfo);
    console.log("   Metadata Hash:", contractParams.metadataHash);

    return NextResponse.json({
      success: true,
      message: "Batch creation test completed successfully - ready for blockchain deployment!",
      testBatchData,
      metadata,
      ipfsResult,
      contractParams,
      priceAnalysis: {
        inputUSD: `$${testBatchData.pricePerUnit}`,
        storedCents: contractParams.priceInCents,
        verificationUSD: `$${(contractParams.priceInCents / 100).toFixed(2)}`,
        previousIssue: "Was converting to 42 ETH (~$100,000)",
        currentFix: `Now stores ${contractParams.priceInCents} cents ($${(contractParams.priceInCents / 100).toFixed(2)})`
      }
    });

  } catch (error) {
    console.error("❌ Batch creation test failed:", error);
    return NextResponse.json({
      success: false,
      error: "Batch creation test failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
