#!/usr/bin/env node

/**
 * WAGA Chainlink Functions Deployment Script
 * Deploys the functions source code and configures your subscription
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SUBSCRIPTION_ID = process.env.CHAINLINK_SUBSCRIPTION_ID;
const ROUTER_ADDRESS = "0xf9B8fc078197181C841c296C876945aaa425B278"; // Base Sepolia
const DON_ID = "fun-base-sepolia-1";
const GAS_LIMIT = 300000;

// WAGA Contract addresses
const WAGA_CONTRACTS = {
    batchManager: "0x0604bD16E816323BCe84481612f5b4517a2654a8",
    zkManager: "0xd8F264B4e7FBCE17dd0D3491D1684Ec5F630c023",
    privacyLayer: "0xA7d5D48eD8549E48001F82F7c477D0D22893d453"
};

async function main() {
    console.log("🚀 WAGA Chainlink Functions Deployment");
    console.log("=====================================");
    
    if (!SUBSCRIPTION_ID) {
        console.error("❌ Please set CHAINLINK_SUBSCRIPTION_ID in your .env file");
        process.exit(1);
    }
    
    console.log(`📋 Subscription ID: ${SUBSCRIPTION_ID}`);
    console.log(`🌐 Router Address: ${ROUTER_ADDRESS}`);
    console.log(`🔗 DON ID: ${DON_ID}`);
    console.log(`⛽ Gas Limit: ${GAS_LIMIT}`);
    
    // Read source code
    const sourcePath = path.join(__dirname, '../chainlink/functions-source.js');
    const sourceCode = fs.readFileSync(sourcePath, 'utf8');
    
    console.log("\n📄 Functions Source Code:");
    console.log(`Source file: ${sourcePath}`);
    console.log(`Source length: ${sourceCode.length} characters`);
    
    // Generate source hash
    const crypto = require('crypto');
    const sourceHash = crypto.createHash('sha256').update(sourceCode).digest('hex');
    console.log(`Source hash: ${sourceHash}`);
    
    console.log("\n🔧 Next Steps:");
    console.log("1. Add your subscription ID to .env file:");
    console.log(`   CHAINLINK_SUBSCRIPTION_ID=${SUBSCRIPTION_ID}`);
    console.log(`   CHAINLINK_SOURCE_HASH=${sourceHash}`);
    
    console.log("\n2. Add these contracts as consumers:");
    Object.entries(WAGA_CONTRACTS).forEach(([name, address]) => {
        console.log(`   ${name}: ${address}`);
    });
    
    console.log("\n3. Upload source code to Chainlink Functions:");
    console.log("   - Go to https://functions.chain.link/");
    console.log("   - Connect wallet and select Base Sepolia");
    console.log("   - Find your subscription");
    console.log("   - Upload the functions-source.js file");
    
    console.log("\n4. Test the integration:");
    console.log("   npm run test:chainlink");
    
    console.log("\n✅ Configuration ready!");
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { WAGA_CONTRACTS, ROUTER_ADDRESS, DON_ID, GAS_LIMIT };
