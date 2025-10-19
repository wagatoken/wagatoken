const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');

async function checkDatabaseStructure() {
  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    // Check the actual column names in waga_coffee_batches table
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'waga_coffee_batches' 
      ORDER BY ordinal_position;
    `;
    
    console.log('Actual columns in waga_coffee_batches table:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Error checking database structure:', error.message);
  }
}

checkDatabaseStructure();