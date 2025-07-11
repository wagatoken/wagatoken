// Chainlink Functions source code for WAGA Coffee verification
// This code will be called by your WAGAProofOfReserve and WAGAInventoryManager contracts

const batchId = args[0];
const expectedQuantity = args[1];
const expectedPrice = args[2];
const expectedPackaging = args[3];
const expectedMetadataHash = args[4];

console.log('Verifying batch:', batchId);
console.log('Expected data:', { expectedQuantity, expectedPrice, expectedPackaging, expectedMetadataHash });

try {
  // Make API call to your Next.js backend (updated port)
  const response = await Functions.makeHttpRequest({
    url: `http://localhost:3001/api/batches/${batchId}`, // Updated to port 3001
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (response.error) {
    throw new Error(`API Error: ${response.error}`);
  }

  const batchData = response.data;
  
  console.log('Retrieved batch data:', batchData);

  // Validate that we got the expected data structure
  if (!batchData.quantity || !batchData.price || !batchData.packaging || !batchData.metadataHash) {
    throw new Error('Invalid batch data structure');
  }

  // Return the data in the format expected by your _parseResponse function
  // This matches the (uint256, uint256, string, string) tuple your contracts expect
  return Functions.encodeUint256(batchData.quantity) + 
         Functions.encodeUint256(batchData.price) + 
         Functions.encodeString(batchData.packaging) + 
         Functions.encodeString(batchData.metadataHash);
         
} catch (error) {
  console.error('Chainlink Functions error:', error);
  throw new Error(`Verification failed: ${error.message}`);
}
