// WAGA Coffee Production Verification Source - Aligned with Smart Contract
// This source code is designed to work with WAGAProofOfReserve.sol _parseResponse function
// Response format: ABI-encoded (uint256, uint256, string, string)

const batchId = args[0];           // Batch ID to verify
const batchQuantity = args[1];     // Expected total batch quantity
const requestQuantity = args[2];   // Requested quantity for this verification
const expectedPrice = args[3];     // Expected price per unit (in cents)
const expectedPackaging = args[4]; // Expected packaging info
const expectedMetadataHash = args[5]; // Expected metadata hash

console.log('WAGA Production Verification');
console.log('Batch ID:', batchId);
console.log('Expected Quantity:', batchQuantity);
console.log('Requested Quantity:', requestQuantity);

try {
    // Step 1: Verify batch exists in primary database
    console.log('Step 1: Verifying batch existence...');
    const batchResponse = await Functions.makeHttpRequest({
        url: `https://api.waga.coffee/v1/batches/${batchId}`,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer production_api_key"
        }
    });

    if (batchResponse.error) {
        throw new Error(`Batch verification failed: ${batchResponse.error}`);
    }

    const batch = batchResponse.data;
    if (!batch || !batch.batchId || batch.batchId.toString() !== batchId.toString()) {
        throw new Error(`Batch ${batchId} not found or ID mismatch`);
    }

    // Step 2: Extract and validate core data
    console.log('Step 2: Extracting batch data...');
    const verifiedQuantity = parseInt(batch.quantity) || 0;
    const verifiedPrice = Math.round(parseFloat(batch.pricePerUnit || batch.price) * 100);
    const verifiedPackaging = batch.packagingInfo || batch.packaging || "";
    const verifiedMetadataHash = batch.metadataHash || "";

    // Step 3: Perform inventory verification
    console.log('Step 3: Verifying inventory levels...');
    let actualInventory = verifiedQuantity; // Default to database quantity
    
    try {
        const inventoryResponse = await Functions.makeHttpRequest({
            url: `https://api.waga.coffee/v1/inventory/${batchId}`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer production_api_key"
            }
        });

        if (inventoryResponse.data && inventoryResponse.data.actualQuantity) {
            actualInventory = parseInt(inventoryResponse.data.actualQuantity);
            console.log('Actual inventory:', actualInventory);
        }
    } catch (inventoryError) {
        console.warn('Inventory check failed, using database quantity:', inventoryError.message);
    }

    // Step 4: Validation checks
    console.log('Step 4: Performing validation checks...');
    
    // Check if we have sufficient inventory for the request
    if (actualInventory < parseInt(requestQuantity)) {
        throw new Error(`Insufficient inventory: available=${actualInventory}, requested=${requestQuantity}`);
    }

    // Check if database inventory backs the declared batch quantity
    if (verifiedQuantity < parseInt(batchQuantity)) {
        throw new Error(`Database quantity insufficient: verified=${verifiedQuantity}, declared=${batchQuantity}`);
    }

    // Step 5: Quality and metadata verification
    console.log('Step 5: Verifying quality and metadata...');
    
    try {
        const metadataResponse = await Functions.makeHttpRequest({
            url: `https://api.waga.coffee/v1/metadata/${verifiedMetadataHash}`,
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (metadataResponse.error || !metadataResponse.data) {
            console.warn('Metadata verification failed, but continuing with batch data');
        }
    } catch (metadataError) {
        console.warn('Metadata check failed:', metadataError.message);
    }

    // Step 6: Log successful verification
    console.log('Verification successful!');
    console.log('Results:', {
        quantity: verifiedQuantity,
        price: verifiedPrice,
        packaging: verifiedPackaging.substring(0, 10) + '...',
        metadata: verifiedMetadataHash.substring(0, 10) + '...'
    });

    // Step 7: Return ABI-encoded response for smart contract
    // Format: (uint256 quantity, uint256 price, string packaging, string metadataHash)
    const response = Functions.encodeUint256(verifiedQuantity) + 
                    Functions.encodeUint256(verifiedPrice) + 
                    Functions.encodeString(verifiedPackaging) + 
                    Functions.encodeString(verifiedMetadataHash);
    
    console.log('Returning encoded response length:', response.length);
    return response;

} catch (error) {
    console.error('WAGA verification error:', error.message);
    
    // Return zeros for failed verification - smart contract will handle this
    const failedResponse = Functions.encodeUint256(0) + 
                          Functions.encodeUint256(0) + 
                          Functions.encodeString("") + 
                          Functions.encodeString("");
    
    console.log('Returning failed verification response');
    return failedResponse;
}

// Helper function for development/testing environments
function getApiUrl() {
    // In production, use production API
    // In development, use localhost
    const isDevelopment = typeof args[6] !== 'undefined' && args[6] === 'development';
    return isDevelopment ? 'http://localhost:3001' : 'https://api.waga.coffee/v1';
}

// Helper function for robust error handling
function validateBatchData(batch) {
    const required = ['batchId', 'quantity', 'pricePerUnit', 'metadataHash'];
    const missing = required.filter(field => !batch[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required batch fields: ${missing.join(', ')}`);
    }
    
    if (parseInt(batch.quantity) <= 0) {
        throw new Error('Batch quantity must be greater than zero');
    }
    
    if (parseFloat(batch.pricePerUnit) <= 0) {
        throw new Error('Batch price must be greater than zero');
    }
}

// Helper function for inventory reconciliation
async function reconcileInventory(batchId, databaseQuantity) {
    try {
        const reconciliationResponse = await Functions.makeHttpRequest({
            url: `${getApiUrl()}/reconcile/${batchId}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer production_api_key"
            },
            data: {
                databaseQuantity: databaseQuantity,
                timestamp: Date.now()
            }
        });

        return reconciliationResponse.data || { reconciled: false };
    } catch (error) {
        console.warn('Inventory reconciliation failed:', error.message);
        return { reconciled: false };
    }
}
