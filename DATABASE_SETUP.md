# Database Setup Guide

## Quick Setup for Development

### Option 1: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL locally:**
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Create database
   createdb waga_mvp
   ```

2. **Update environment variables:**
   ```bash
   # In frontend/.env.local
   NETLIFY_DATABASE_URL=postgresql://username:password@localhost:5432/waga_mvp
   ```

### Option 2: Neon (Recommended for Production)

1. **Create Neon account:** https://neon.tech
2. **Create new project:** "WAGA MVP"
3. **Copy connection string:**
   ```bash
   # In frontend/.env.local
   NETLIFY_DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   ```

## Database Migration

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Run migrations:**
   ```bash
   npx drizzle-kit push:pg
   ```

3. **Verify setup:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/admin
   # Check system status - Database should show "healthy"
   ```

## Troubleshooting

### Database Status Shows "Degraded"
- Verify `NETLIFY_DATABASE_URL` is set correctly
- Ensure database server is running
- Check network connectivity
- Run migration: `npx drizzle-kit push:pg`

### Common Issues
1. **Connection refused:** Database server not running
2. **Authentication failed:** Incorrect credentials
3. **Database not found:** Create database first
4. **SSL required:** Add `?sslmode=require` to connection string

## Current Schema

The system includes:
- **Core Tables:** 7 tables (batches, users, roles, etc.)
- **ZK Privacy System:** 5 additional tables for zero-knowledge proofs
- **Total:** 12 tables with comprehensive relationships

## Environment Variables Required

```bash
# Database
NETLIFY_DATABASE_URL=postgresql://...

# Pinata IPFS
PINATA_JWT=eyJ...
NEXT_PUBLIC_PINATA_JWT=eyJ...

# Blockchain (Base Sepolia)
NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS=0xE69bdd3E783212D11522E7f0057c9F52FC4D0A39
# ... other contract addresses
```
