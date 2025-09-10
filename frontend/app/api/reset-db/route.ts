import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';

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

    // Drop all tables in correct order (respecting foreign keys)
    await db.execute(`DROP TABLE IF EXISTS batch_token_balances CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS inventory_audits CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS redemption_requests CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS verification_requests CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS user_roles CASCADE`);
    await db.execute(`DROP TABLE IF EXISTS waga_coffee_batches CASCADE`);

    console.log('All tables dropped successfully');

    return NextResponse.json({
      success: true,
      message: 'Database reset completed - all tables dropped'
    });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
