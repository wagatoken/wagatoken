import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';

export async function POST() {
  try {
    console.log('🚀 Starting database migration and schema setup...');
    
    // Test database connection first
    const connectionTest = await db.execute("SELECT 1 as test");
    console.log('✅ Database connection successful');

    // Check which tables already exist
    const existingTablesResult = await db.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    const existingTables = existingTablesResult.rows.map((row: any) => row.table_name);
    console.log('📋 Existing tables:', existingTables);

    // Expected tables from our schema
    const expectedTables = [
      'waga_coffee_batches',
      'verification_requests', 
      'redemption_requests',
      'user_roles',
      'inventory_audits',
      'batch_token_balances',
      'batch_requests'
    ];

    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    console.log('❌ Missing tables:', missingTables);

    let created = [];
    let errors = [];

    // Create batch_requests table if missing
    if (missingTables.includes('batch_requests')) {
      try {
        await db.execute(`
          CREATE TABLE IF NOT EXISTS "batch_requests" (
            "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            "batch_id" bigint NOT NULL,
            "requester" varchar(42) NOT NULL,
            "requestedQuantity" integer NOT NULL,
            "requestDetails" text,
            "request_timestamp" bigint NOT NULL,
            "isFulfilled" boolean DEFAULT false NOT NULL,
            "fulfilledQuantity" integer DEFAULT 0,
            "fulfilled_timestamp" bigint,
            "requestIndex" integer NOT NULL,
            "transactionHash" varchar(66),
            "block_number" bigint,
            "status" varchar(20) DEFAULT 'pending' NOT NULL,
            "processedBy" varchar(42),
            "processedAt" timestamp,
            "createdAt" timestamp DEFAULT now() NOT NULL,
            "updatedAt" timestamp DEFAULT now() NOT NULL
          )
        `);
        created.push('batch_requests');
        console.log('✅ Created batch_requests table');
      } catch (error) {
        console.error('❌ Failed to create batch_requests table:', error);
        errors.push(`batch_requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Add missing columns to existing tables if needed
    const columnsToAdd = [
      // For waga_coffee_batches
      {
        table: 'waga_coffee_batches',
        columns: [
          'productType varchar(20) DEFAULT \'RETAIL_BAGS\'',
          'unitWeight varchar(20)',
          'moistureContent numeric(5,2)',
          'density numeric(5,2)',
          'defectCount integer',
          'cooperativeId varchar(42)',
          'processorId varchar(42)'
        ]
      },
      // For user_roles
      {
        table: 'user_roles', 
        columns: [
          'companyName varchar(255)',
          'location varchar(255)',
          'certificationLevel varchar(50)',
          'specialization varchar(100)'
        ]
      }
    ];

    for (const tableInfo of columnsToAdd) {
      if (existingTables.includes(tableInfo.table)) {
        for (const column of tableInfo.columns) {
          try {
            await db.execute(`ALTER TABLE "${tableInfo.table}" ADD COLUMN IF NOT EXISTS ${column}`);
            console.log(`✅ Added column to ${tableInfo.table}: ${column.split(' ')[0]}`);
          } catch (error) {
            console.log(`ℹ️  Column likely exists in ${tableInfo.table}: ${column.split(' ')[0]}`);
          }
        }
      }
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_batch_requests_batch_id ON batch_requests(batch_id)',
      'CREATE INDEX IF NOT EXISTS idx_batch_requests_requester ON batch_requests(requester)',
      'CREATE INDEX IF NOT EXISTS idx_batch_requests_status ON batch_requests(status)',
      'CREATE INDEX IF NOT EXISTS idx_waga_batches_product_type ON waga_coffee_batches(productType)',
      'CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role)'
    ];

    for (const indexSql of indexes) {
      try {
        await db.execute(indexSql);
        console.log(`✅ Created index: ${indexSql.split(' ')[5]}`);
      } catch (error) {
        console.log(`ℹ️  Index likely exists: ${indexSql.split(' ')[5]}`);
      }
    }

    // Final verification - check all tables again
    const finalTablesResult = await db.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    const finalTables = finalTablesResult.rows.map((row: any) => row.table_name);
    const presentTables = expectedTables.filter(table => finalTables.includes(table));

    console.log('🎉 Database setup complete!');
    console.log('📊 Final table status:', presentTables);

    return NextResponse.json({
      success: true,
      message: 'Database migration and setup completed',
      created,
      errors,
      tables: {
        expected: expectedTables.length,
        present: presentTables.length,
        list: presentTables
      },
      status: presentTables.length === expectedTables.length ? 'All tables ready' : `${presentTables.length}/${expectedTables.length} tables ready`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Just check database status
    const tablesResult = await db.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    const tables = tablesResult.rows.map((row: any) => row.table_name);
    const expectedTables = [
      'waga_coffee_batches',
      'verification_requests', 
      'redemption_requests',
      'user_roles',
      'inventory_audits',
      'batch_token_balances',
      'batch_requests'
    ];

    const presentTables = expectedTables.filter(table => tables.includes(table));

    return NextResponse.json({
      success: true,
      connected: true,
      message: 'Database schema status',
      tables: {
        expected: expectedTables.length,
        present: presentTables.length,
        missing: expectedTables.filter(table => !tables.includes(table)),
        list: presentTables
      },
      status: presentTables.length === expectedTables.length ? 'Schema complete' : `${presentTables.length}/${expectedTables.length} tables ready`,
      readyForProduction: presentTables.length === expectedTables.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database check failed:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      note: 'Using mock data - database not accessible',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
