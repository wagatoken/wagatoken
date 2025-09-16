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
    
    // Check for expected WAGA tables (updated for full schema)
    const expectedTables = [
      // Core tables (7)
      'waga_coffee_batches', 
      'verification_requests', 
      'user_roles', 
      'batch_token_balances', 
      'inventory_audits', 
      'redemption_requests',
      'batch_requests',
      // ZK tables (5) - may not exist yet
      'zk_proofs',
      'batch_privacy_configs',
      'protected_batch_data',
      'zk_verification_history',
      'zk_circuit_configs'
    ];
    const wagaTables = tableNames.filter(name => expectedTables.includes(name));
    const coreTablesCount = tableNames.filter(name => [
      'waga_coffee_batches', 'verification_requests', 'user_roles', 
      'batch_token_balances', 'inventory_audits', 'redemption_requests', 'batch_requests'
    ].includes(name)).length;
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: 'Database connected successfully',
      tables: wagaTables,
      tablesCount: wagaTables.length,
      allTables: tableNames,
      status: coreTablesCount >= 6 ? 
        `${wagaTables.length}/12 tables available (${coreTablesCount}/7 core tables ready)` : 
        `${wagaTables.length}/12 tables available (${coreTablesCount}/7 core tables - migration needed)`,
      coreTablesReady: coreTablesCount >= 6,
      zkTablesReady: wagaTables.length >= 10,
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
