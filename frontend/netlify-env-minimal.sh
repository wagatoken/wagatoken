#!/bin/bash

# WAGA Coffee MVP - MINIMAL Netlify Environment Variables
# Only absolutely essential variables for Netlify deployment under 4KB

echo "🚀 WAGA Coffee MVP - Minimal Setup"

# Essential Database (for mock data fallback)
netlify env:set DATABASE_URL "postgresql://n:n@ep-p-aepcom49-pooler.c-2.us-east-2.aws.neon.tech/neondb" --force

# Core Contract (only the main one)
netlify env:set NEXT_PUBLIC_WAGA_TOKEN_ADDRESS "0x5f4bE57dA14a03387Db976CB4c16F619f6958544" --force

# Build Settings
netlify env:set NODE_VERSION "20.18.0" --force
netlify env:set NPM_CONFIG_PRODUCTION "false" --force
netlify env:set NEXT_PRIVATE_STANDALONE "true" --force

echo "✅ Minimal environment set (under 1KB)"