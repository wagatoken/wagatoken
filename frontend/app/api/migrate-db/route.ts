import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Check if database is properly configured
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl || databaseUrl.includes('your_neon_database_url_here') || databaseUrl.includes('placeholder')) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured. Please set NETLIFY_DATABASE_URL or DATABASE_URL environment variable.'
      }, { status: 400 });
    }

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
