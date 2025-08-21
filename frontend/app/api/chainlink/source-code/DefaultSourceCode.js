// Default Source Code for WAGA Coffee Inventory Verification
// This runs in the Chainlink Functions decentralized oracle network
// Handles both: Initial Reserve Verification (before minting) and Periodic Inventory Verification

// Validate that args are provided
if (!args || args.length < 5) {
  throw Error("Missing required arguments. Expected: [batchId, expectedQuantity, expectedPrice, expectedPackaging, expectedMetadataHash]");
}

// The `args` parameter contains: [batchId, expectedQuantity, expectedPrice, expectedPackaging, expectedMetadataHash]
const batchId = args[0];
const expectedQuantity = parseInt(args[1]);
const expectedPrice = parseInt(args[2]);
const expectedPackaging = args[3];
const expectedMetadataHash = args[4];

// Validate parsed arguments
if (!batchId || isNaN(expectedQuantity) || isNaN(expectedPrice)) {
  throw Error(`Invalid arguments: batchId=${batchId}, quantity=${expectedQuantity}, price=${expectedPrice}`);
}

// API endpoint for WAGA coffee inventory system
const inventoryApiUrl = `https://api.wagacoffee.com/inventory/batch/${batchId}`;

try {
  // Make HTTP request to verify inventory data
  const inventoryRequest = Functions.makeHttpRequest({
    url: inventoryApiUrl,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${secrets.WAGA_API_KEY}`,
      "Content-Type": "application/json"
    },
    timeout: 10000
  });

  // Execute the request
  const inventoryResponse = await inventoryRequest;

  if (inventoryResponse.error) {
    throw Error(`HTTP Error: ${inventoryResponse.error}`);
  }

  const inventoryData = inventoryResponse.data;

  // Verify the batch exists and data matches
  if (!inventoryData || !inventoryData.batch) {
    throw Error(`Batch ${batchId} not found in inventory system`);
  }

  // Extract verified data from API response
  const verifiedQuantity = inventoryData.batch.currentQuantity || 0;
  const verifiedPrice = inventoryData.batch.pricePerUnit || 0;
  const verifiedPackaging = inventoryData.batch.packaging || "";
  const verifiedMetadataHash = inventoryData.batch.metadataHash || "";

  // Validate required fields
  if (!verifiedPackaging || !verifiedMetadataHash) {
    throw Error(`Incomplete batch data for ${batchId}: missing packaging or metadata hash`);
  }

  // Additional verification: Check if physical inventory matches expected
  if (verifiedQuantity < expectedQuantity) {
    console.log(`Warning: Physical inventory (${verifiedQuantity}) less than expected (${expectedQuantity})`);
  }

  // Verify metadata integrity
  const metadataApiUrl = `https://api.wagacoffee.com/metadata/verify/${batchId}`;
  const metadataRequest = Functions.makeHttpRequest({
    url: metadataApiUrl,
    method: "POST",
    headers: {
      "Authorization": `Bearer ${secrets.WAGA_API_KEY}`,
      "Content-Type": "application/json"
    },
    data: {
      batchId: batchId,
      expectedHash: expectedMetadataHash
    },
    timeout: 5000
  });

  const metadataResponse = await metadataRequest;
  
  // If metadata verification fails, we still return the data but log the issue
  if (metadataResponse.error || !metadataResponse.data?.isValid) {
    console.log(`Warning: Metadata verification failed for batch ${batchId}`);
  }

  // Return the verified data as ABI-encoded bytes
  // Format: (uint256 quantity, uint256 price, string packaging, string metadataHash)
  return Functions.encodeUint256(verifiedQuantity) +
         Functions.encodeUint256(verifiedPrice) +
         Functions.encodeString(verifiedPackaging) +
         Functions.encodeString(verifiedMetadataHash);

} catch (error) {
  // Return error information that the smart contract can handle
  console.log(`Error verifying batch ${batchId}: ${error.message}`);
  
  // Return zeros/empty strings to indicate verification failure
  return Functions.encodeUint256(0) +
         Functions.encodeUint256(0) +
         Functions.encodeString("") +
         Functions.encodeString("");
}