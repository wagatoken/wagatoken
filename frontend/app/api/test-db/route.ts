import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';

export async function GET() {
  try {
    // Simple test query to verify database connection
    const result = await db.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      tables: result.rows
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
