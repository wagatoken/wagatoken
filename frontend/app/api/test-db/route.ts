import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { MockDataService } from '../../../utils/mockData';

export async function GET() {
  try {
    // Simple test query to verify database connection
    const result = await db.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    // Extract table names
    const tableNames = result.rows.map((row: any) => row.table_name);
    
    // Check for expected WAGA tables
    const expectedTables = [
      'waga_coffee_batches', 
      'verification_requests', 
      'user_roles', 
      'batch_token_balances', 
      'inventory_audits', 
      'redemption_requests',
      'batch_requests'
    ];
    const wagaTables = tableNames.filter(name => expectedTables.includes(name));
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: 'Database connected successfully',
      tables: wagaTables,
      tablesCount: wagaTables.length,
      allTables: tableNames,
      status: wagaTables.length >= 6 ? 'Fully synced' : `${wagaTables.length}/7 WAGA tables available`,
      timestamp: new Date().toISOString(),
      usingMockData: false
    });
  } catch (error) {
    console.warn('Database connection failed, using mock data:', error);
    
    // Return mock data information instead of error
    const mockStats = await MockDataService.getStats();
    
    return NextResponse.json({
      success: true,
      connected: false,
      message: 'Using mock data (database not configured)',
      tables: ['mock_batches', 'mock_users', 'mock_stats'],
      tablesCount: 3,
      allTables: ['mock_batches', 'mock_users', 'mock_stats'],
      status: 'Mock data available',
      mockStats,
      timestamp: new Date().toISOString(),
      usingMockData: true,
      note: 'Set NETLIFY_DATABASE_URL or DATABASE_URL environment variable to use real database'
    });
  }
}
