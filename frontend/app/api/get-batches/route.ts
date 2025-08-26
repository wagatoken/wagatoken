import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { wagaCoffeeBatches } from '../../../db/schema';

export async function GET() {
  try {
    // Retrieve all coffee batches
    const batches = await db.select().from(wagaCoffeeBatches);

    return NextResponse.json({
      success: true,
      message: `Found ${batches.length} coffee batches`,
      batches: batches
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
