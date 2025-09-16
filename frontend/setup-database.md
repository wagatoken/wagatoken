# Database Setup Instructions

## Quick Development Setup

### Option 1: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL:**
   ```bash
   # macOS with Homebrew
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create database and user:**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE waga_mvp;
   CREATE USER waga_user WITH PASSWORD 'secure_password_123';
   GRANT ALL PRIVILEGES ON DATABASE waga_mvp TO waga_user;
   \q
   ```

3. **Update .env.local:**
   ```bash
   NETLIFY_DATABASE_URL=postgresql://waga_user:secure_password_123@localhost:5432/waga_mvp
   DATABASE_URL=postgresql://waga_user:secure_password_123@localhost:5432/waga_mvp
   ```

4. **Run migrations:**
   ```bash
   cd frontend
   npx drizzle-kit push
   ```

### Option 2: Neon (Cloud PostgreSQL)

1. **Create Neon account:** https://neon.tech
2. **Create new project:** "WAGA MVP"
3. **Copy connection string and update .env.local:**
   ```bash
   NETLIFY_DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   ```

### Option 3: Supabase (Alternative Cloud)

1. **Create Supabase account:** https://supabase.com
2. **Create new project:** "WAGA MVP"
3. **Get connection string from Settings > Database**
4. **Update .env.local with the connection string**

## Expected Database Schema

After migration, you should have **12 tables:**

### Core System Tables (7):
1. `waga_coffee_batches` - Main coffee batch data
2. `verification_requests` - Chainlink verification tracking
3. `redemption_requests` - Coffee redemption requests
4. `user_roles` - User permissions and roles
5. `inventory_audits` - Physical inventory tracking
6. `batch_token_balances` - Token balance tracking
7. `batch_requests` - Batch creation requests

### ZK Privacy System Tables (5):
8. `zk_proofs` - Zero-knowledge proof storage
9. `batch_privacy_configs` - Privacy settings per batch
10. `protected_batch_data` - Encrypted sensitive data
11. `zk_verification_history` - ZK verification audit trail
12. `zk_circuit_configs` - Circuit configuration data

## Verification

1. **Check database connection:**
   ```bash
   curl http://localhost:3000/api/test-db
   ```

2. **Expected response:**
   ```json
   {
     "success": true,
     "connected": true,
     "tablesCount": 7,
     "status": "Fully synced"
   }
   ```

## Troubleshooting

### "3/6 tables" Error
- Database URL not configured correctly
- Tables not created (run `npx drizzle-kit push`)
- Connection refused (check PostgreSQL is running)

### Common Issues
1. **Connection refused:** PostgreSQL not running
2. **Authentication failed:** Wrong username/password
3. **Database not found:** Create database first
4. **Permission denied:** Grant proper privileges to user

### Reset Database
```bash
# Drop and recreate database
psql postgres -c "DROP DATABASE IF EXISTS waga_mvp;"
psql postgres -c "CREATE DATABASE waga_mvp;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE waga_mvp TO waga_user;"

# Re-run migrations
cd frontend
npx drizzle-kit push
```
