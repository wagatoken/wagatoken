import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Get database URL from environment variables
const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

// During build time or when database is not configured, use a mock client
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NETLIFY;
const isDatabaseConfigured = databaseUrl &&
  !databaseUrl.includes('your_neon_database_url_here') &&
  !databaseUrl.includes('placeholder');

let dbClient;
if (isBuildTime || !isDatabaseConfigured) {
  // Create a mock neon client that logs warnings instead of throwing errors
  console.warn('Database not configured. Using mock data. Please set NETLIFY_DATABASE_URL or DATABASE_URL environment variable for production.');
  dbClient = neon('postgresql://mock:mock@mock/mock');
} else {
  dbClient = neon(databaseUrl);
}

export const db = drizzle(dbClient, {
    schema
});