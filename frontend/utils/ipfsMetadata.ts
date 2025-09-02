import QRCode from 'qrcode';

// Coffee Batch Metadata Interface
export interface CoffeeBatchMetadata {
  name: string;
  description: string;
  image?: string; // IPFS hash of batch image
  properties: {
    origin: string;
    farmer: string;
    altitude: string;
    process: string;
    roastProfile?: string; // Optional for green beans
    roastDate?: string; // Optional for green beans
    certifications: string[];
    cupping_notes: string[];
    batchSize: number; // Number of bags (matches quantity in smart contract)
    packagingInfo: string; // Must be "250g" or "500g" to match smart contract validation
    pricePerUnit: string; // Price in USD cents as string

    // Extended properties for green and roasted beans
    moisture_content?: number;
    density?: number;
    defect_count?: number;
    cooperative_id?: string;
    processor_id?: string;
  };
}

// Batch Creation Form Data Interface
export interface BatchCreationData {
  name: string;
  description: string;
  origin: string;
  farmer: string;
  altitude: string;
  process: string;
  roastProfile?: string; // Optional for green beans
  roastDate?: string; // Optional for green beans
  certifications: string[];
  cupping_notes: string[];
  quantity: number; // Number of bags
  packagingInfo: "250g" | "500g" | "60kg";
  pricePerUnit: string; // Price in USD, will be converted to cents
  productionDate: Date;
  expiryDate: Date;
  image?: string; // Optional image IPFS hash

  // Extended fields for product type support
  productType?: "RETAIL_BAGS" | "GREEN_BEANS" | "ROASTED_BEANS";
  unitWeight?: string;
  moistureContent?: number;
  density?: number;
  defectCount?: number;
  cooperativeId?: string;
  processorId?: string;
}

/**
 * Generate standardized coffee batch metadata
 */
export function generateCoffeeMetadata(batchData: BatchCreationData): CoffeeBatchMetadata {
  // Store USD price in cents to avoid decimals (e.g., $42.50 becomes 4250)
  const priceInCents = Math.round(parseFloat(batchData.pricePerUnit) * 100).toString();

  return {
    name: batchData.name,
    description: batchData.description,
    image: batchData.image || "", // Optional image
    properties: {
      origin: batchData.origin,
      farmer: batchData.farmer,
      altitude: batchData.altitude,
      process: batchData.process,
      roastProfile: batchData.roastProfile,
      roastDate: batchData.roastDate,
      certifications: batchData.certifications,
      cupping_notes: batchData.cupping_notes,
      batchSize: batchData.quantity,
      packagingInfo: batchData.packagingInfo,
      pricePerUnit: priceInCents
    }
  };
}

/**
 * Upload metadata to IPFS via API route (client-safe)
 */
export async function uploadMetadataToIPFS(metadata: CoffeeBatchMetadata): Promise<{
  uri: string;
  metadataHash: string;
}> {
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Uploading metadata to IPFS via API (attempt ${attempt}/${maxRetries})...`);

      // Use the API route instead of direct Pinata SDK access
      const response = await fetch('/api/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(`API Error ${response.status}: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.cid) {
        throw new Error("Upload succeeded but no CID returned from API");
      }

      // IPFS URI format: ipfs://{hash}
      const ipfsUri = `ipfs://${result.cid}`;

      console.log("✅ Metadata uploaded to IPFS successfully");
      console.log("   IPFS URI:", ipfsUri);
      console.log("   Metadata Hash:", result.cid);

      return {
        uri: ipfsUri,
        metadataHash: result.cid
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Upload attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error("All IPFS upload attempts failed");
  throw new Error(`Failed to upload metadata to IPFS: ${lastError!.message}`);
}

/**
 * Update IPFS metadata with the actual batch ID from blockchain
 */
export async function updateIPFSMetadataWithBatchId(
  originalCid: string, 
  batchId: string, 
  metadata: CoffeeBatchMetadata
): Promise<{
  newCid: string;
  newUri: string;
}> {
  try {
    console.log(`Updating IPFS metadata with batch ID ${batchId}...`);

    // Update metadata with the actual batch ID
    const updatedMetadata = {
      ...metadata,
      name: `${metadata.name} - Batch #${batchId}`,
      properties: {
        ...metadata.properties,
        batchId: batchId,
        blockchainId: batchId
      }
    };

    // Upload updated metadata with proper filename
    const response = await fetch('/api/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        metadata: updatedMetadata,
        filename: `coffee-batch-${batchId}`,
        batchId: batchId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
      throw new Error(`Failed to update IPFS metadata: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.cid) {
      throw new Error("Update succeeded but no CID returned from API");
    }

    return {
      newCid: result.cid,
      newUri: `ipfs://${result.cid}`
    };

  } catch (error) {
    console.error("Error updating IPFS metadata with batch ID:", error);
    throw error;
  }
}

/**
 * Fetch metadata from IPFS using Pinata gateway
 */
export async function fetchMetadataFromIPFS(ipfsUri: string): Promise<CoffeeBatchMetadata> {
  try {
    // Extract hash from ipfs:// URI
    const hash = ipfsUri.replace("ipfs://", "");
    
    // Use Pinata gateway to fetch the data
    const gatewayUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`;
    
    const response = await fetch(gatewayUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    
    const metadata = await response.json();
    return metadata as CoffeeBatchMetadata;
  } catch (error) {
    console.error("Error fetching metadata from IPFS:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch metadata from IPFS: ${errorMessage}`);
  }
}

/**
 * Helper function to validate batch creation data
 */
export function validateBatchData(batchData: Partial<BatchCreationData>): string[] {
  const errors: string[] = [];

  if (!batchData.name?.trim()) errors.push("Batch name is required");
  if (!batchData.description?.trim()) errors.push("Description is required");
  if (!batchData.origin?.trim()) errors.push("Origin is required");
  if (!batchData.farmer?.trim()) errors.push("Farmer name is required");
  if (!batchData.packagingInfo || !["250g", "500g"].includes(batchData.packagingInfo)) {
    errors.push("Packaging info must be either '250g' or '500g'");
  }
  if (!batchData.quantity || batchData.quantity <= 0) {
    errors.push("Quantity must be greater than 0");
  }
  if (!batchData.pricePerUnit || parseFloat(batchData.pricePerUnit) <= 0) {
    errors.push("Price per unit must be greater than 0");
  }
  if (batchData.pricePerUnit && parseFloat(batchData.pricePerUnit) > 100) {
    errors.push("Price per unit cannot exceed $100 (seems too high for coffee)");
  }
  if (batchData.pricePerUnit && parseFloat(batchData.pricePerUnit) < 0.01) {
    errors.push("Price per unit must be at least $0.01");
  }
  if (!batchData.productionDate) errors.push("Production date is required");
  if (!batchData.expiryDate) errors.push("Expiry date is required");
  if (batchData.productionDate && batchData.expiryDate && batchData.expiryDate <= batchData.productionDate) {
    errors.push("Expiry date must be after production date");
  }

  return errors;
}

// ===========================
// QR CODE FUNCTIONALITY
// ===========================

/**
 * QR Code data interface for coffee batches
 */
export interface BatchQRData {
  batchId: string;
  name: string;
  origin: string;
  farmer: string;
  verificationUrl: string;
  redemptionUrl: string;
  ipfsUri: string;
  timestamp: number;
}

/**
 * Generate QR code data for a coffee batch
 */
export function generateBatchQRData(
  batchId: string,
  metadata: CoffeeBatchMetadata,
  ipfsUri: string,
  baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
): BatchQRData {
  return {
    batchId,
    name: metadata.name,
    origin: metadata.properties.origin,
    farmer: metadata.properties.farmer,
    verificationUrl: `${baseUrl}/verify/${batchId}`,
    redemptionUrl: `${baseUrl}/redeem/${batchId}`,
    ipfsUri,
    timestamp: Date.now()
  };
}

/**
 * Generate QR code as base64 data URL for a coffee batch
 */
export async function generateBatchQRCode(
  batchId: string,
  metadata: CoffeeBatchMetadata,
  ipfsUri: string,
  options: {
    size?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  } = {}
): Promise<string> {
  try {
    const qrData = generateBatchQRData(batchId, metadata, ipfsUri);
    
    // Convert QR data to JSON string
    const qrDataString = JSON.stringify(qrData, null, 2);
    
    // QR code generation options
    const qrOptions = {
      errorCorrectionLevel: 'M' as const,
      type: 'image/png' as const,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
      width: options.size || 256,
    };

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrDataString, qrOptions);
    
    console.log(`Generated QR code for batch ${batchId}`);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to generate QR code: ${errorMessage}`);
  }
}

/**
 * Generate simple verification QR code (just the verification URL)
 */
export async function generateSimpleVerificationQR(
  batchId: string,
  baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  size: number = 200
): Promise<string> {
  try {
    const verificationUrl = `${baseUrl}/verify/${batchId}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: size,
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating simple verification QR code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to generate verification QR code: ${errorMessage}`);
  }
}

/**
 * Parse QR code data back to BatchQRData object
 */
export function parseBatchQRData(qrDataString: string): BatchQRData {
  try {
    const qrData = JSON.parse(qrDataString) as BatchQRData;
    
    // Validate required fields
    if (!qrData.batchId || !qrData.verificationUrl || !qrData.ipfsUri) {
      throw new Error('Invalid QR code data: missing required fields');
    }
    
    return qrData;
  } catch (error) {
    console.error("Error parsing QR code data:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to parse QR code data: ${errorMessage}`);
  }
}
