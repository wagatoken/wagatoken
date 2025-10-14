const { sql } = require('drizzle-orm');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function testDbConnection() {
  try {
    const connectionString = process.env.NETLIFY_DATABASE_URL;
    if (!connectionString) {
      console.log('❌ No NETLIFY_DATABASE_URL found');
      return;
    }

    console.log('🔗 Connecting to database...');
    const client = postgres(connectionString);
    const db = drizzle(client);

    // Test basic connection
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log('✅ Database connected successfully!');
    console.log('Current time:', result[0].current_time);

    // Check if tables exist and have data
    const tables = [
      'waga_coffee_batches',
      'redemption_requests', 
      'verification_requests',
      'batch_requests',
      'zk_proofs',
      'batch_privacy_configs'
    ];

    for (const table of tables) {
      try {
        const count = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
        console.log(`📊 ${table}: ${count[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }

    await client.end();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

testDbConnection();