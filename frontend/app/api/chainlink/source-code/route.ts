import { NextResponse } from "next/server";

export async function GET() {
  // JavaScript source code for Chainlink Functions
  // This will be used in your WAGAInventoryManager's setDefaultSourceCode function
  const sourceCode = `
// Chainlink Functions source code for WAGA Coffee verification
const batchId = args[0];
const expectedQuantity = args[1];
const expectedPrice = args[2];
const expectedPackaging = args[3];
const expectedMetadataHash = args[4];

console.log('Verifying batch:', batchId);

try {
  // Make API call to your Next.js backend
  const response = await Functions.makeHttpRequest({
    url: \`http://localhost:3001/api/batches/\${batchId}\`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (response.error) {
    throw new Error(\`API Error: \${response.error}\`);
  }

  const batchData = response.data;
  
  console.log('Retrieved batch data:', batchData);

  // Validate that we got the expected data structure
  if (!batchData.quantity || !batchData.price || !batchData.packaging || !batchData.metadataHash) {
    throw new Error('Invalid batch data structure');
  }

  // Return the data in the format expected by your _parseResponse function
  // This matches the ABI encoding expected by your smart contracts
  return Functions.encodeUint256(batchData.quantity) + 
         Functions.encodeUint256(batchData.price) + 
         Functions.encodeString(batchData.packaging) + 
         Functions.encodeString(batchData.metadataHash);
         
} catch (error) {
  console.error('Chainlink Functions error:', error);
  throw new Error(\`Verification failed: \${error.message}\`);
}
  `.trim();

  return NextResponse.json({ sourceCode }, { status: 200 });
}
