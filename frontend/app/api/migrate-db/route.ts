import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '0000_confused_ezekiel_stane.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Split into individual statements
    const statements = migrationSQL.split('--> statement-breakpoint').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(statement.trim());
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      tablesCreated: [
        'waga_coffee_batches',
        'verification_requests', 
        'redemption_requests',
        'user_roles',
        'inventory_audits',
        'batch_token_balances'
      ]
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
