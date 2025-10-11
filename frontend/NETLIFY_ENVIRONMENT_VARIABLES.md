# Netlify Environment Variables Configuration
# WAGA Coffee Tokenization System - Production Deployment

# ============================================================================
# EXISTING VARIABLES (Currently Configured)
# ============================================================================

# Core Contract Addresses (Base Sepolia)
NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS=
NEXT_PUBLIC_WAGA_COFFEE_VIEWS_ADDRESS=
NEXT_PUBLIC_WAGA_BATCH_MANAGER_ADDRESS=
NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS=
NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS=
NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS=
NEXT_PUBLIC_WAGA_TREASURY_ADDRESS=
NEXT_PUBLIC_WAGA_CDP_INTEGRATION_ADDRESS=
NEXT_PUBLIC_WAGA_ACCESS_CONTROL_ADDRESS=
NEXT_PUBLIC_WAGA_CONFIG_MANAGER_ADDRESS=

# ZK System Contracts
NEXT_PUBLIC_WAGA_ZK_MANAGER_ADDRESS=
NEXT_PUBLIC_PRIVACY_LAYER_ADDRESS=
NEXT_PUBLIC_CIRCOM_VERIFIER_ADDRESS=
NEXT_PUBLIC_PRICE_PRIVACY_VERIFIER_ADDRESS=
NEXT_PUBLIC_QUALITY_TIER_VERIFIER_ADDRESS=
NEXT_PUBLIC_SUPPLY_CHAIN_VERIFIER_ADDRESS=

# Chainlink Functions
NEXT_PUBLIC_CHAINLINK_DON_ID=
NEXT_PUBLIC_CHAINLINK_ROUTER_ADDRESS=
NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID=
NEXT_PUBLIC_CHAINLINK_GAS_LIMIT=300000

# Database (Neon PostgreSQL)
DATABASE_URL=
DIRECT_URL=

# IPFS Configuration
NEXT_PUBLIC_IPFS_GATEWAY=
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_API_KEY=

# ============================================================================
# NEW VARIABLES REQUIRED FOR INTEGRATION PLAN COMPLIANCE
# ============================================================================

# Ethiopian Compliance Contracts
NEXT_PUBLIC_WAGA_ETHIOPIAN_COMPLIANCE_CORE_ADDRESS=
NEXT_PUBLIC_WAGA_BANKING_CORE_ADDRESS=

# Ethiopian Government Integration
NEXT_PUBLIC_ETHIOPIAN_EXPORT_API_ENDPOINT=
NEXT_PUBLIC_ECX_API_ENDPOINT=
NEXT_PUBLIC_ETHIOPIAN_CUSTOMS_API=
NEXT_PUBLIC_ETHIOPIAN_MINISTRY_AGRICULTURE_API=

# Banking Integration APIs
NEXT_PUBLIC_CBE_BANK_API_ENDPOINT=              # Commercial Bank of Ethiopia
NEXT_PUBLIC_AWASH_BANK_API_ENDPOINT=            # Awash Bank
NEXT_PUBLIC_TELEBIRR_API_ENDPOINT=              # Mobile money - Telebirr
NEXT_PUBLIC_MPESA_ETHIOPIA_API_ENDPOINT=        # M-Pesa Ethiopia
NEXT_PUBLIC_HELLCASH_API_ENDPOINT=              # HelloCash

# Currency Exchange APIs
NEXT_PUBLIC_NBE_EXCHANGE_RATE_API=              # National Bank of Ethiopia
NEXT_PUBLIC_CURRENCY_LAYER_API_KEY=             # CurrencyLayer API
NEXT_PUBLIC_FIXER_IO_API_KEY=                   # Fixer.io for backup rates

# Document Storage & Verification
NEXT_PUBLIC_COMPLIANCE_IPFS_GATEWAY=
NEXT_PUBLIC_DOCUMENT_ENCRYPTION_KEY=
NEXT_PUBLIC_KYC_VERIFICATION_SERVICE=
NEXT_PUBLIC_IDENTITY_VERIFICATION_API=

# EUDR Compliance Services
NEXT_PUBLIC_EUDR_VERIFICATION_ENDPOINT=
NEXT_PUBLIC_FOREST_MONITORING_API=
NEXT_PUBLIC_SATELLITE_DATA_SERVICE=
NEXT_PUBLIC_DEFORESTATION_ASSESSMENT_API=

# Ethiopian Regional APIs
NEXT_PUBLIC_OROMIA_REGION_API=
NEXT_PUBLIC_AMHARA_REGION_API=
NEXT_PUBLIC_SNNP_REGION_API=
NEXT_PUBLIC_TIGRAY_REGION_API=

# Certification Bodies
NEXT_PUBLIC_ORGANIC_CERTIFICATION_API=
NEXT_PUBLIC_FAIRTRADE_VERIFICATION_API=
NEXT_PUBLIC_RAINFOREST_ALLIANCE_API=
NEXT_PUBLIC_UTZ_CERTIFICATION_API=

# Quality Assessment Services
NEXT_PUBLIC_ECX_QUALITY_GRADING_API=
NEXT_PUBLIC_SCA_CUPPING_SCORES_API=
NEXT_PUBLIC_COFFEE_QUALITY_INSTITUTE_API=

# Blockchain Network Configuration
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=
NEXT_PUBLIC_BASE_MAINNET_RPC_URL=               # For future mainnet deployment
NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL=
NEXT_PUBLIC_NETWORK_NAME=base-sepolia

# Smart Contract Interaction
NEXT_PUBLIC_GAS_LIMIT_DEFAULT=300000
NEXT_PUBLIC_GAS_PRICE_MULTIPLIER=1.2
NEXT_PUBLIC_TRANSACTION_TIMEOUT=300000          # 5 minutes

# Security & Authentication
NEXT_PUBLIC_JWT_SECRET=
NEXT_PUBLIC_SESSION_SECRET=
NEXT_PUBLIC_ENCRYPTION_ALGORITHM=AES-256-GCM
NEXT_PUBLIC_HASH_SALT_ROUNDS=12

# Email & Notifications
NEXT_PUBLIC_SENDGRID_API_KEY=
NEXT_PUBLIC_NOTIFICATION_EMAIL=
NEXT_PUBLIC_SUPPORT_EMAIL=info@wagacoffee.com

# SMS & Communication
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=

# Ethiopian Mobile Networks
NEXT_PUBLIC_ETHIO_TELECOM_SMS_API=
NEXT_PUBLIC_SAFARICOM_SMS_API=

# File Upload & Storage
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=
NEXT_PUBLIC_AWS_REGION=us-east-1

# Content Delivery
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=
NEXT_PUBLIC_CDN_URL=

# Analytics & Monitoring
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_MIXPANEL_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=

# API Rate Limiting
NEXT_PUBLIC_RATE_LIMIT_REQUESTS_PER_MINUTE=60
NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS=60000

# Caching Configuration
NEXT_PUBLIC_REDIS_URL=
NEXT_PUBLIC_CACHE_TTL_SECONDS=300

# Development & Testing
NODE_ENV=production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_API_BASE_URL=https://wagacoffee.com/api

# Backup & Recovery
NEXT_PUBLIC_BACKUP_STORAGE_URL=
NEXT_PUBLIC_DISASTER_RECOVERY_REGION=

# ============================================================================
# CRITICAL VARIABLES FOR IMMEDIATE DEPLOYMENT
# ============================================================================

# These variables must be set before the frontend can function properly:

# 1. Database Connection (REQUIRED)
DATABASE_URL=postgresql://username:password@host:5432/database_name
DIRECT_URL=postgresql://username:password@host:5432/database_name

# 2. New Contract Addresses (REQUIRED)
NEXT_PUBLIC_WAGA_ETHIOPIAN_COMPLIANCE_CORE_ADDRESS=0x...
NEXT_PUBLIC_WAGA_BANKING_CORE_ADDRESS=0x...

# 3. Basic Banking Integration (REQUIRED for USD/ETB)
NEXT_PUBLIC_NBE_EXCHANGE_RATE_API=https://nbe.gov.et/api/exchange-rate
NEXT_PUBLIC_CURRENCY_LAYER_API_KEY=your_api_key_here

# 4. Document Storage (REQUIRED for compliance docs)
NEXT_PUBLIC_COMPLIANCE_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_DOCUMENT_ENCRYPTION_KEY=your_encryption_key_here

# 5. Basic Security (REQUIRED)
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_SESSION_SECRET=your_session_secret_here

# ============================================================================
# DEPLOYMENT INSTRUCTIONS
# ============================================================================

# 1. Update Netlify Environment Variables:
#    - Go to Netlify Dashboard > Site Settings > Environment Variables
#    - Add all CRITICAL variables above first
#    - Add additional variables as APIs become available

# 2. Database Migration:
#    - Run the migration script in migrations/001-full-schema-migration.sql
#    - Verify all tables are created in Neon database

# 3. Smart Contract Deployment:
#    - Ensure WAGAConfigManager and EthiopianComplianceCore contracts are deployed
#    - Update contract addresses in environment variables

# 4. API Integrations:
#    - Set up Ethiopian government API access
#    - Configure banking API connections
#    - Test exchange rate API functionality

# 5. Testing:
#    - Test seller registration flow
#    - Verify Ethiopian compliance tracking
#    - Test banking integration
#    - Validate ZK proof generation

# ============================================================================
# ENVIRONMENT VARIABLE SECURITY NOTES
# ============================================================================

# PUBLIC vs PRIVATE Variables:
# - NEXT_PUBLIC_* variables are exposed to the browser
# - Non-NEXT_PUBLIC variables are server-side only
# - Sensitive data (API keys, secrets) should NOT use NEXT_PUBLIC_ prefix

# Security Best Practices:
# 1. Use environment-specific values (dev/staging/prod)
# 2. Rotate API keys regularly
# 3. Use strong encryption keys (32+ characters)
# 4. Monitor API usage and rate limits
# 5. Enable API key restrictions where possible

# ============================================================================
# VALIDATION SCRIPT
# ============================================================================

# Run this script to validate all environment variables are set:
# scripts/validate-env.js

module.exports = {
  requiredVariables: [
    'DATABASE_URL',
    'NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS',
    'NEXT_PUBLIC_WAGA_ETHIOPIAN_COMPLIANCE_CORE_ADDRESS',
    'NEXT_PUBLIC_WAGA_BANKING_CORE_ADDRESS',
    'NEXT_PUBLIC_NBE_EXCHANGE_RATE_API',
    'NEXT_PUBLIC_JWT_SECRET'
  ],
  validate: () => {
    const missing = [];
    for (const variable of requiredVariables) {
      if (!process.env[variable]) {
        missing.push(variable);
      }
    }
    if (missing.length > 0) {
      console.error('Missing required environment variables:', missing);
      process.exit(1);
    }
    console.log('All required environment variables are set ✅');
  }
};