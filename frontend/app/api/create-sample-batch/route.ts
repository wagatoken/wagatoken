import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { wagaCoffeeBatches } from '../../../db/schema';

export async function POST() {
  try {
    // Insert sample coffee batch data
    const sampleBatch = await db.insert(wagaCoffeeBatches).values({
      batchId: 1001,
      quantity: 150, // Changed from string to integer
      price: "8.75",
      packaging: "250g",
      metadataHash: "QmTest123...", // Sample IPFS hash
      ipfsUri: "ipfs://QmTest123.../metadata.json", // Sample IPFS URI
      farmName: "Carlos Rodriguez", // Changed from farmerName
      location: "Huila, Colombia", // Changed from region
      productionDate: new Date('2024-12-15'), // Changed from harvestDate
      expiryDate: new Date('2025-12-15'),
      processingMethod: "Washed",
      qualityScore: 92,
      name: "Carlos's Premium Arabica",
      description: "High-quality single-origin coffee from Huila, Colombia",
      farmer: "Carlos Rodriguez",
      altitude: "1,500m",
      certifications: ["Organic", "Fair Trade", "Rain Forest Alliance"]
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Sample coffee batch created successfully',
      batch: sampleBatch[0]
    });
  } catch (error) {
    console.error('Sample data creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
