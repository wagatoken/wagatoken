import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { wagaCoffeeBatches } from '../../../../db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      batchId,
      farmerName,
      coffeeType,
      region,
      harvestDate,
      processingMethod,
      quantity,
      qualityScore,
      certifications,
      pricePerKg
    } = body;

    // Validate required fields
    if (!batchId || !farmerName || !coffeeType || !region || !harvestDate || 
        !processingMethod || !quantity || !qualityScore || !pricePerKg) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert batch into database
    const [newBatch] = await db.insert(wagaCoffeeBatches).values({
      batchId: Number(batchId),
      farmName: farmerName, // Changed from farmerName to farmName
      location: region, // Changed from region to location  
      productionDate: new Date(harvestDate), // Changed from harvestDate to productionDate
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Add 1 year expiry
      processingMethod,
      quantity: Number(quantity), // Changed from string to number
      qualityScore: Number(qualityScore),
      price: pricePerKg.toString(), // Convert to string for decimal field
      packaging: "250g", // Added required packaging field with default
      metadataHash: "pending", // Placeholder - will be updated when IPFS upload completes
      ipfsUri: "pending", // Placeholder - will be updated when IPFS upload completes
      name: `${farmerName}'s ${coffeeType}`, // Added required name field
      description: `Premium ${coffeeType} from ${region}`, // Added description
      certifications: certifications || [] // Convert to array if needed
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Batch created successfully',
      batch: newBatch
    });

  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch all batches
    const batches = await db.select().from(wagaCoffeeBatches);
    
    return NextResponse.json({
      success: true,
      batches
    });

  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}
