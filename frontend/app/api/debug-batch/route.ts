import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    // Import ethers for calculation
    const { ethers } = await import('ethers');
    
    // Test with smaller values that might be more acceptable to the contract
    const testParameters = {
      ipfsUri: "ipfs://bafkreidryzbjjmchk2zgkzquw22t4myjyidn2ellhgtlnxkeeflv7vzdai",
      productionDateTimestamp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      expiryDateTimestamp: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 days from now  
      quantity: 100, // Standard quantity
      priceInWei: "1000000000000000", // 0.001 ETH in wei (smaller price)
      packagingInfo: "250g",
      metadataHash: "bafkreidryzbjjmchk2zgkzquw22t4myjyidn2ellhgtlnxkeeflv7vzdai"
    };

    // Test different configurations
    const alternativeTests = {
      microPrice: "100000000000000", // 0.0001 ETH  
      nanoPrice: "10000000000000", // 0.00001 ETH
      smallQuantity: 10,
      mediumQuantity: 50,
      largeQuantity: 1000
    };

    // Validation checks
    const currentTime = Math.floor(Date.now() / 1000);
    const validationResults = {
      ipfsUriValid: testParameters.ipfsUri.startsWith('ipfs://'),
      productionDateFuture: testParameters.productionDateTimestamp > currentTime,
      expiryAfterProduction: testParameters.expiryDateTimestamp > testParameters.productionDateTimestamp,
      quantityPositive: testParameters.quantity > 0,
      pricePositive: BigInt(testParameters.priceInWei) > BigInt(0),
      metadataHashValid: testParameters.metadataHash.length > 0
    };

    const response = {
      success: true,
      message: "Debug parameters prepared for smart contract",
      parameters: testParameters,
      alternativeTests,
      validation: validationResults,
      timestamps: {
        current: new Date(currentTime * 1000).toISOString(),
        production: new Date(testParameters.productionDateTimestamp * 1000).toISOString(),
        expiry: new Date(testParameters.expiryDateTimestamp * 1000).toISOString()
      },
      notes: [
        "Custom error 0x75883caa suggests parameter validation failure",
        "Try smaller price values or different quantity",
        "Ensure user has ADMIN_ROLE on the contract",
        "Verify network is Base Sepolia (chainId: 84532)"
      ]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Debug batch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to debug batch parameters', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
