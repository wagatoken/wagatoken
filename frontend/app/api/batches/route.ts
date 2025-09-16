import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { wagaCoffeeBatches } from '../../../db/schema';

export async function GET(request: NextRequest) {
  try {
    const batches = await db.select().from(wagaCoffeeBatches);
    
    return NextResponse.json({
      success: true,
      batches: batches || []
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch batches'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const batchData = await request.json();
    
    const [newBatch] = await db.insert(wagaCoffeeBatches).values(batchData).returning();
    
    return NextResponse.json({
      success: true,
      batch: newBatch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create batch'
    }, { status: 500 });
  }
}