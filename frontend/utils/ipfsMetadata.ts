import { pinata } from "./config";
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
    roastProfile: string;
    roastDate: string;
    certifications: string[];
    cupping_notes: string[];
    batchSize: number; // Number of bags (matches quantity in smart contract)
    packagingInfo: string; // Must be "250g" or "500g" to match smart contract validation
    pricePerUnit: string; // Price in wei as string
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
  roastProfile: string;
  roastDate: string;
  certifications: string[];
  cupping_notes: string[];
  quantity: number; // Number of bags
  packagingInfo: "250g" | "500g";
  pricePerUnit: string; // Price in ETH, will be converted to wei
  productionDate: Date;
  expiryDate: Date;
  image?: string; // Optional image IPFS hash
}

/**
 * Generate standardized coffee batch metadata
 */
export function generateCoffeeMetadata(batchData: BatchCreationData): CoffeeBatchMetadata {
  // Convert price from ETH to wei
  const priceInWei = (parseFloat(batchData.pricePerUnit) * 1e18).toString();

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
      pricePerUnit: priceInWei
    }
  };
}

/**
 * Upload metadata to IPFS using Pinata and return URI and hash
 */
export async function uploadMetadataToIPFS(metadata: CoffeeBatchMetadata): Promise<{
  uri: string;
  metadataHash: string;
}> {
  try {
    console.log("Uploading metadata to IPFS via Pinata...");

    // Upload JSON metadata to Pinata
    const upload = await pinata.upload.json(metadata);
    const ipfsHash = upload.cid; // Use 'cid' property for content identifier

    // IPFS URI format: ipfs://{hash}
    const ipfsUri = `ipfs://${ipfsHash}`;

    console.log("Metadata uploaded to IPFS");
    console.log("IPFS URI:", ipfsUri);
    console.log("Metadata Hash:", ipfsHash);

    return {
      uri: ipfsUri,
      metadataHash: ipfsHash
    };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to upload metadata to IPFS: ${errorMessage}`);
  }
}

/**
 * Complete batch creation workflow with IPFS + smart contract integration
 */
export async function createBatchWithIPFS(
  batchData: BatchCreationData,
  createBatchFunction: (ipfsUri: string, productionDate: number, expiryDate: number, quantity: number, pricePerUnit: string, packagingInfo: string, metadataHash: string) => Promise<any>
): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
}> {
  try {
    console.log("Starting batch creation workflow...");

    // Step 1: Generate standardized metadata
    const metadata = generateCoffeeMetadata(batchData);
    console.log("Generated metadata:", metadata);

    // Step 2: Upload metadata to IPFS
    const { uri: ipfsUri, metadataHash } = await uploadMetadataToIPFS(metadata);

    // Step 3: Prepare smart contract parameters
    const productionDateTimestamp = Math.floor(batchData.productionDate.getTime() / 1000);
    const expiryDateTimestamp = Math.floor(batchData.expiryDate.getTime() / 1000);
    const priceInWei = (parseFloat(batchData.pricePerUnit) * 1e18).toString();

    console.log("Calling smart contract createBatch...");

    // Step 4: Call smart contract createBatch
    const tx = await createBatchFunction(
      ipfsUri,
      productionDateTimestamp,
      expiryDateTimestamp,
      batchData.quantity,
      priceInWei,
      batchData.packagingInfo,
      metadataHash
    );

    // Step 5: Wait for transaction and extract batchId
    const receipt = await tx.wait();
    
    // Find BatchCreated event to get the actual batchId
    const batchCreatedEvent = receipt.events?.find(
      (event: any) => event.event === "BatchCreated"
    );

    if (!batchCreatedEvent) {
      throw new Error("BatchCreated event not found in transaction receipt");
    }

    const batchId = batchCreatedEvent.args.batchId.toString();

    console.log("Batch created successfully!");
    console.log("Batch ID:", batchId);
    console.log("Transaction Hash:", receipt.transactionHash);

    return {
      batchId,
      ipfsUri,
      metadataHash,
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error("Error in batch creation workflow:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Batch creation failed: ${errorMessage}`);
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

/**
 * Complete batch creation with QR code generation
 */
export async function createBatchWithQRCode(
  batchData: BatchCreationData,
  createBatchFunction: (ipfsUri: string, productionDate: number, expiryDate: number, quantity: number, pricePerUnit: string, packagingInfo: string, metadataHash: string) => Promise<any>
): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
  qrCodeDataUrl: string;
  verificationQR: string;
}> {
  try {
    console.log("Starting batch creation with QR code generation...");

    // Step 1: Create batch with IPFS
    const batchResult = await createBatchWithIPFS(batchData, createBatchFunction);

    // Step 2: Fetch the metadata for QR generation
    const metadata = generateCoffeeMetadata(batchData);

    // Step 3: Generate comprehensive QR code
    const qrCodeDataUrl = await generateBatchQRCode(
      batchResult.batchId,
      metadata,
      batchResult.ipfsUri
    );

    // Step 4: Generate simple verification QR code
    const verificationQR = await generateSimpleVerificationQR(batchResult.batchId);

    console.log("Batch created successfully with QR codes!");
    console.log("Batch ID:", batchResult.batchId);
    console.log("QR codes generated");

    return {
      ...batchResult,
      qrCodeDataUrl,
      verificationQR
    };

  } catch (error) {
    console.error("Error in batch creation with QR code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Batch creation with QR code failed: ${errorMessage}`);
  }
}
