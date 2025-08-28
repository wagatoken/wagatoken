import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';

export async function GET() {
  try {
    // Simple test query to verify database connection
    const result = await db.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    // Extract table names
    const tableNames = result.rows.map((row: any) => row.table_name);
    
    // Check for expected WAGA tables
    const expectedTables = ['batch_table', 'verification_table', 'user_table', 'token_table', 'inventory_table', 'redemption_table'];
    const wagaTables = tableNames.filter(name => expectedTables.includes(name));
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: 'Database connected successfully',
      tables: wagaTables,
      tablesCount: wagaTables.length,
      allTables: tableNames,
      status: wagaTables.length >= 6 ? 'Fully synced' : `${wagaTables.length}/6 WAGA tables available`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      tables: [],
      tablesCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
