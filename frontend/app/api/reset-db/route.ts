import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';

export async function POST() {
  try {
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
