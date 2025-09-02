import { ethers } from 'ethers';
import { 
  generateCoffeeMetadata,
  uploadMetadataToIPFS,
  generateBatchQRCode,
  generateSimpleVerificationQR,
  BatchCreationData, 
  fetchMetadataFromIPFS, 
  CoffeeBatchMetadata 
} from './ipfsMetadata';

// Contract addresses from environment
const COFFEE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS!;
const PROOF_OF_RESERVE_ADDRESS = process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS!;
const INVENTORY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS!;
const REDEMPTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS!;

// Chainlink Functions configuration
const CHAINLINK_DON_ID = process.env.NEXT_PUBLIC_CHAINLINK_DON_ID!;
const CHAINLINK_SUBSCRIPTION_ID = process.env.NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID!;

// Product type constants (matching smart contract enum)
export const PRODUCT_TYPES = {
  RETAIL_BAGS: 0,    // 250g/500g ready-to-consume coffee bags
  GREEN_BEANS: 1,    // 60kg green coffee beans
  ROASTED_BEANS: 2   // 60kg roasted coffee beans
} as const;

export type ProductType = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES];

// Extended batch creation data with product type support
export interface ExtendedBatchCreationData extends BatchCreationData {
  productType?: keyof typeof PRODUCT_TYPES;
  unitWeight?: string;
  moistureContent?: number;
  density?: number;
  defectCount?: number;
  cooperativeId?: string;
  processorId?: string;
}

// Updated ABIs for the actual deployed contracts with product type support
const COFFEE_TOKEN_ABI = [
  // Legacy function for backward compatibility
  "function createBatch(uint256 productionDate, uint256 expiryDate, uint256 quantity, uint256 pricePerUnit, string calldata origin, string calldata packagingInfo, string calldata metadataURI) external onlyRole(bytes32) returns (uint256)",

  // New function with product type support
  "function createBatchWithProductType(uint256 productionDate, uint256 expiryDate, uint256 quantity, uint256 pricePerUnit, string calldata origin, string calldata packagingInfo, string calldata unitWeight, uint8 productType, string calldata metadataURI) external returns (uint256)",

  // Product type functions
  "function getBatchProductType(uint256 batchId) external view returns (uint8)",
  "function getBatchUnitWeight(uint256 batchId) external view returns (string)",
  "function getBatchWithProductType(uint256 batchId) external view returns (uint256, uint256, uint256, uint256, string, string, address, uint256, uint8, string)",
  "function updateBatchIPFS(uint256 batchId, string calldata ipfsUri, string calldata metadataHash) external",
  "function getbatchInfo(uint256 batchId) external view returns (uint256 productionDate, uint256 expiryDate, bool isVerified, uint256 quantity, uint256 pricePerUnit, string memory packagingInfo, string memory metadataHash, bool isMetadataVerified, uint256 lastVerifiedTimestamp)",
  "function getActiveBatchIds() external view returns (uint256[])",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function mintBatch(address to, uint256 batchId, uint256 amount) external",
  "function burnForRedemption(address account, uint256 batchId, uint256 amount) external",
  "function ADMIN_ROLE() external view returns (bytes32)",
  "function VERIFIER_ROLE() external view returns (bytes32)",
  "function MINTER_ROLE() external view returns (bytes32)",
  "function REDEMPTION_ROLE() external view returns (bytes32)",
  "function FULFILLER_ROLE() external view returns (bytes32)",
  "event BatchCreated(uint256 indexed batchId, string ipfsUri)",
  "event BatchIPFSUpdated(uint256 indexed batchId, string newIpfsUri)",
  "event TokensMinted(address indexed to, uint256 indexed batchId, uint256 amount)",
  "function uri(uint256 tokenId) external view returns (string memory)"
];

const PROOF_OF_RESERVE_ABI = [
  "function requestReserveVerification(uint256 batchId, address recipient, string calldata source) external returns (bytes32)",
  "function requestInventoryVerification(uint256 batchId, string calldata source) external returns (bytes32)",
  "function verificationRequests(bytes32 requestId) external view returns (uint256 batchId, uint256 requestQuantity, uint256 verifiedQuantity, uint256 requestPrice, uint256 verifiedPrice, string memory expectedPackaging, string memory verifiedPackaging, string memory expectedMetadataHash, string memory verifiedMetadataHash, address recipient, bool completed, bool verified, uint256 lastVerifiedTimestamp, bool shouldMint)",
  "event ReserveVerificationRequested(bytes32 indexed requestId, uint256 indexed batchId, uint256 quantity)"
];

const REDEMPTION_CONTRACT_ABI = [
  "function requestRedemption(uint256 batchId, uint256 quantity, string calldata deliveryAddress) external",
  "function updateRedemptionStatus(uint256 redemptionId, uint8 status) external",
  "function getRedemptionDetails(uint256 redemptionId) external view returns (tuple(address consumer, uint256 batchId, uint256 quantity, string deliveryAddress, uint256 requestDate, uint8 status, uint256 fulfillmentDate))",
  "function getConsumerRedemptions(address consumer) external view returns (uint256[])",
  "function nextRedemptionId() external view returns (uint256)",
  "event RedemptionRequested(uint256 indexed redemptionId, address indexed consumer, uint256 batchId, uint256 quantity, string packagingInfo)",
  "event RedemptionFulfilled(uint256 indexed redemptionId, uint256 fulfillmentDate)",
  "event RedemptionStatusUpdated(uint256 indexed redemptionId, uint8 status)"
];

// Batch information interface
export interface BatchInfo {
  batchId: string;
  productionDate: number;
  expiryDate: number;
  isVerified: boolean;
  quantity: number;
  pricePerUnit: string;
  packagingInfo: string;
  metadataHash: string;
  isMetadataVerified: boolean;
  lastVerifiedTimestamp: number;
  ipfsUri?: string;
  metadata?: CoffeeBatchMetadata;
}

// Verification request interface
export interface VerificationRequest {
  requestId: string;
  batchId: string;
  requestQuantity: number;
  verifiedQuantity: number;
  requestPrice: string;
  verifiedPrice: string;
  recipient: string;
  completed: boolean;
  verified: boolean;
  shouldMint: boolean;
}

// Redemption request interface (matching actual contract structure)
export interface RedemptionRequest {
  redemptionId: string;
  consumer: string;
  batchId: string;
  quantity: number;
  deliveryAddress: string;
  requestDate: number;
  status: number; // 0: Pending, 1: Fulfilled, 2: Cancelled
  fulfillmentDate: number;
}

export interface ZKProof {
  proof: string;
  // Add other fields if needed, e.g., merkle root, nullifier, etc.
}

// Privacy levels enum
export enum PrivacyLevel {
  Public = 0,     // Show all data
  Selective = 1,  // Show ZK proof results only
  Private = 2     // Show minimal verified data
}

// Privacy configuration interface
export interface PrivacyConfig {
  pricingPrivate: boolean;
  qualityPrivate: boolean;
  supplyChainPrivate: boolean;
  pricingProofHash: string;
  qualityProofHash: string;
  supplyChainProofHash: string;
  level: PrivacyLevel;
}

// Enhanced batch creation data with privacy
export interface BatchCreationDataWithPrivacy extends BatchCreationData {
  privacyLevel: PrivacyLevel;
  zkProofs?: {
    pricing?: ZKProof;
    quality?: ZKProof;
    supplyChain?: ZKProof;
  };
}

/**
 * Get connected wallet signer
 */
export async function getSigner(): Promise<ethers.Signer> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

/**
 * Get contract instance
 */
export function getContract(
  address: string, 
  abi: string[], 
  signer: ethers.Signer
): ethers.Contract {
  return new ethers.Contract(address, abi, signer);
}

// ===========================
// ADMIN FUNCTIONS - BLOCKCHAIN-FIRST WORKFLOW
// ===========================

/**
 * Step 1: Create batch on blockchain first (no IPFS dependencies)
 */
export async function createBatchOnBlockchain(batchData: BatchCreationData): Promise<{
  batchId: string;
  transactionHash: string;
}> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    // Check if user has admin role
    const adminRole = await coffeeTokenContract.ADMIN_ROLE();
    const hasAdminRole = await coffeeTokenContract.hasRole(adminRole, await signer.getAddress());
    
    if (!hasAdminRole) {
      throw new Error('User does not have ADMIN_ROLE required to create batches');
    }

    // Prepare smart contract parameters
    const productionDateTimestamp = Math.floor(batchData.productionDate.getTime() / 1000);
    const expiryDateTimestamp = Math.floor(batchData.expiryDate.getTime() / 1000);
    // Store USD price in cents to avoid decimals (e.g., $42.50 becomes 4250)
    const priceInCents = Math.round(parseFloat(batchData.pricePerUnit) * 100);

    console.log('🔗 Creating batch on blockchain first...');
    console.log('   Production Date:', new Date(productionDateTimestamp * 1000).toISOString());
    console.log('   Expiry Date:', new Date(expiryDateTimestamp * 1000).toISOString());
    console.log('   Quantity:', batchData.quantity);
    console.log('   Price (USD cents):', priceInCents);
    console.log('   Packaging:', batchData.packagingInfo);

    // Call smart contract createBatch (blockchain-first) - backward compatibility
    const tx = await coffeeTokenContract.createBatch(
      productionDateTimestamp,
      expiryDateTimestamp,
      batchData.quantity,
      priceInCents,
      batchData.origin || 'Unknown', // Add origin for new ABI
      batchData.packagingInfo,
      'placeholder_metadata_uri' // Will be updated with IPFS later
    );

    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    
    // Find BatchCreated event to get the actual batchId
    const batchCreatedEvent = receipt.events?.find(
      (event: any) => event.event === "BatchCreated"
    );

    if (!batchCreatedEvent) {
      throw new Error("BatchCreated event not found in transaction receipt");
    }

    const blockchainBatchId = batchCreatedEvent.args.batchId.toString();

    console.log('✅ Batch created on blockchain successfully!');
    console.log('   Blockchain Batch ID:', blockchainBatchId);
    console.log('   Transaction Hash:', receipt.transactionHash);

    return {
      batchId: blockchainBatchId,
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('❌ Error creating batch on blockchain:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to create batch on blockchain: ${errorMessage}`);
  }
}

/**
 * Step 1 (Product Type): Create batch on blockchain with product type support
 */
export async function createBatchWithProductTypeOnBlockchain(
  batchData: ExtendedBatchCreationData
): Promise<{
  batchId: string;
  transactionHash: string;
  productType: ProductType;
}> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    // Determine required role based on product type
    const productType = batchData.productType ? PRODUCT_TYPES[batchData.productType] : PRODUCT_TYPES.RETAIL_BAGS;
    let requiredRole: string;

    switch (productType) {
      case PRODUCT_TYPES.RETAIL_BAGS:
        requiredRole = await coffeeTokenContract.ADMIN_ROLE();
        break;
      case PRODUCT_TYPES.GREEN_BEANS:
        requiredRole = await coffeeTokenContract.COOPERATIVE_ROLE();
        break;
      case PRODUCT_TYPES.ROASTED_BEANS:
        requiredRole = await coffeeTokenContract.ROASTER_ROLE();
        break;
      default:
        throw new Error('Invalid product type');
    }

    // Check if user has required role
    const hasRequiredRole = await coffeeTokenContract.hasRole(requiredRole, await signer.getAddress());
    if (!hasRequiredRole) {
      throw new Error(`User does not have required role for product type: ${batchData.productType}`);
    }

    // Prepare smart contract parameters
    const productionDateTimestamp = Math.floor(batchData.productionDate.getTime() / 1000);
    const expiryDateTimestamp = Math.floor(batchData.expiryDate.getTime() / 1000);
    const priceInCents = Math.round(parseFloat(batchData.pricePerUnit) * 100);

    console.log('🔗 Creating batch with product type on blockchain...');
    console.log('   Product Type:', batchData.productType);
    console.log('   Unit Weight:', batchData.unitWeight);
    console.log('   Required Role:', requiredRole);

    // Call smart contract createBatchWithProductType
    const tx = await coffeeTokenContract.createBatchWithProductType(
      productionDateTimestamp,
      expiryDateTimestamp,
      batchData.quantity,
      priceInCents,
      batchData.origin || 'Unknown',
      batchData.packagingInfo,
      batchData.unitWeight || batchData.packagingInfo,
      productType,
      'placeholder_metadata_uri' // Will be updated with IPFS later
    );

    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();

    // Find BatchCreated event to get the actual batchId
    const batchCreatedEvent = receipt.events?.find(
      (event: any) => event.event === "BatchCreated"
    );

    if (!batchCreatedEvent) {
      throw new Error('BatchCreated event not found in transaction receipt');
    }

    const batchId = batchCreatedEvent.args.batchId.toString();
    const transactionHash = receipt.transactionHash;

    console.log('✅ Batch created successfully!');
    console.log('   Batch ID:', batchId);
    console.log('   Transaction Hash:', transactionHash);
    console.log('   Product Type:', productType);

    return {
      batchId,
      transactionHash,
      productType
    };

  } catch (error) {
    console.error('❌ Error creating batch with product type on blockchain:', error);
    throw error;
  }
}

/**
 * Step 2: Update batch with IPFS metadata
 */
export async function updateBatchWithIPFS(
  batchId: string, 
  ipfsUri: string, 
  metadataHash: string
): Promise<{
  transactionHash: string;
}> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    console.log('🔄 Updating batch with IPFS data...');
    console.log('   Batch ID:', batchId);
    console.log('   IPFS URI:', ipfsUri);
    console.log('   Metadata Hash:', metadataHash);

    // Call smart contract updateBatchIPFS
    const tx = await coffeeTokenContract.updateBatchIPFS(
      batchId,
      ipfsUri,
      metadataHash
    );

    console.log('⏳ Waiting for IPFS update transaction confirmation...');
    const receipt = await tx.wait();

    console.log('✅ Batch IPFS data updated successfully!');
    console.log('   Transaction Hash:', receipt.transactionHash);

    return {
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('❌ Error updating batch with IPFS data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to update batch with IPFS data: ${errorMessage}`);
  }
}

/**
 * Complete blockchain-first workflow orchestrator with product type support
 */
export async function createBatchBlockchainFirst(batchData: BatchCreationData | ExtendedBatchCreationData): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
  qrCodeDataUrl: string;
  verificationQR: string;
}> {
  try {
    console.log('🚀 Starting blockchain-first batch creation workflow...');

    // Step 1: Create batch on blockchain first (with or without product type)
    let batchId: string;
    let createTxHash: string;
    let productType: ProductType | undefined;

    if ('productType' in batchData && batchData.productType) {
      // Use new product type function
      const result = await createBatchWithProductTypeOnBlockchain(batchData as ExtendedBatchCreationData);
      batchId = result.batchId;
      createTxHash = result.transactionHash;
      productType = result.productType;
    } else {
      // Use legacy function for backward compatibility
      const result = await createBatchOnBlockchain(batchData as BatchCreationData);
      batchId = result.batchId;
      createTxHash = result.transactionHash;
    }

    // Step 2: Generate standardized metadata with batchId
    console.log('📝 Generating metadata with batch ID...');
    const metadata = generateCoffeeMetadata(batchData);

    // Update metadata with the actual batch ID and product type info
    const updatedMetadata = {
      ...metadata,
      name: `${metadata.name} - Batch #${batchId}`,
      properties: {
        ...metadata.properties,
        batchId: batchId,
        blockchainId: batchId,
        ...(productType !== undefined && {
          productType: Object.keys(PRODUCT_TYPES)[productType],
          productTypeId: productType
        }),
        // Include extended fields if available
        ...('unitWeight' in batchData && batchData.unitWeight && {
          unitWeight: batchData.unitWeight
        }),
        ...('moistureContent' in batchData && batchData.moistureContent && {
          moistureContent: batchData.moistureContent
        }),
        ...('density' in batchData && batchData.density && {
          density: batchData.density
        }),
        ...('defectCount' in batchData && batchData.defectCount && {
          defectCount: batchData.defectCount
        }),
        ...('cooperativeId' in batchData && batchData.cooperativeId && {
          cooperativeId: batchData.cooperativeId
        }),
        ...('processorId' in batchData && batchData.processorId && {
          processorId: batchData.processorId
        })
      }
    };

    // Step 3: Upload metadata to IPFS with batch ID
    console.log('📤 Uploading metadata to IPFS...');
    const { uri: ipfsUri, metadataHash } = await uploadMetadataToIPFS(updatedMetadata);

    // Step 4: Update blockchain with IPFS data
    const { transactionHash: updateTxHash } = await updateBatchWithIPFS(batchId, ipfsUri, metadataHash);

    // Step 5: Generate QR codes
    console.log('🔍 Generating QR codes...');
    const qrCodeDataUrl = await generateBatchQRCode(batchId, updatedMetadata, ipfsUri);
    const verificationQR = await generateSimpleVerificationQR(batchId);

    // Step 6: Sync to database (non-blocking - preserves blockchain-first integrity)
    console.log('💾 Database sync status: initiating...');
    const { syncBatchToDatabase } = await import('./databaseSync');
    const syncResult = await syncBatchToDatabase({
      batchId,
      transactionHash: updateTxHash,
      ipfsUri,
      metadataHash,
      batchData
    });

    if (syncResult.success) {
      console.log('💾 Database sync status: ✅ completed');
    } else {
      console.log('💾 Database sync status: ❌ failed (non-blocking)');
    }

    console.log('🎉 Blockchain-first batch creation completed successfully!');

    return {
      batchId,
      ipfsUri,
      metadataHash,
      transactionHash: updateTxHash, // Return the final transaction hash
      qrCodeDataUrl,
      verificationQR
    };

  } catch (error) {
    console.error('❌ Error in blockchain-first batch creation workflow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Blockchain-first batch creation failed: ${errorMessage}`);
  }
}

/**
 * Legacy function - now delegates to blockchain-first workflow
 */
export async function createCoffeeBatch(batchData: BatchCreationData): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
  qrCodeDataUrl: string;
  verificationQR: string;
}> {
  // Delegate to the new blockchain-first workflow
  return createBatchBlockchainFirst(batchData);
}

/**
 * Get all active batch IDs (Admin view)
 */
export async function getActiveBatchIds(): Promise<string[]> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const batchIds = await coffeeTokenContract.getActiveBatchIds();
    return batchIds.map((id: ethers.BigNumberish) => id.toString());

  } catch (error) {
    console.error('Error fetching active batch IDs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch active batch IDs: ${errorMessage}`);
  }
}

/**
 * Get detailed batch information
 */
export async function getBatchInfo(batchId: string): Promise<BatchInfo> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const batchInfo = await coffeeTokenContract.getbatchInfo(batchId);
    
    const [
      productionDate,
      expiryDate,
      isVerified,
      quantity,
      pricePerUnit,
      packagingInfo,
      metadataHash,
      isMetadataVerified,
      lastVerifiedTimestamp
    ] = batchInfo;

    return {
      batchId,
      productionDate: productionDate.toNumber(),
      expiryDate: expiryDate.toNumber(),
      isVerified,
      quantity: quantity.toNumber(),
      pricePerUnit: pricePerUnit.toString(),
      packagingInfo,
      metadataHash,
      isMetadataVerified,
      lastVerifiedTimestamp: lastVerifiedTimestamp.toNumber()
    };

  } catch (error) {
    console.error('Error fetching batch info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch batch info: ${errorMessage}`);
  }
}

/**
 * Get batch info with IPFS metadata
 */
export async function getBatchInfoWithMetadata(batchId: string): Promise<BatchInfo> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);
    
    // Get basic batch info
    const batchInfo = await getBatchInfo(batchId);
    
    // Get IPFS URI from the contract
    let ipfsUri: string | undefined;
    try {
      ipfsUri = await coffeeTokenContract.uri(batchId);
    } catch (uriError) {
      console.warn('Could not fetch IPFS URI from contract:', uriError);
      // Try to construct from metadata hash if available
      if (batchInfo.metadataHash) {
        ipfsUri = `ipfs://${batchInfo.metadataHash}`;
      }
    }
    
    // Try to fetch metadata from IPFS if URI is available
    if (ipfsUri && ipfsUri !== "") {
      try {
        const metadata = await fetchMetadataFromIPFS(ipfsUri);
        return {
          ...batchInfo,
          ipfsUri,
          metadata
        };
      } catch (ipfsError) {
        console.warn('Could not fetch IPFS metadata:', ipfsError);
        return {
          ...batchInfo,
          ipfsUri
        };
      }
    }

    return batchInfo;

  } catch (error) {
    console.error('Error fetching batch info with metadata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch batch info with metadata: ${errorMessage}`);
  }
}

// ===========================
// DISTRIBUTOR FUNCTIONS
// ===========================

/**
 * Request batch verification and auto-minting (Distributor)
 */
export async function requestBatchVerification(
  batchId: string,
  jsSource: string = `
    // Chainlink Functions JavaScript code for batch verification
    const batchId = args[0];
    const quantity = args[1];
    const price = args[2];
    const packaging = args[3];
    const metadataHash = args[4];
    
    // Simulate API call to verify batch exists in database
    const verified = true; // In production, this would be an actual API call
    
    return Functions.encodeUint256(verified ? 1 : 0);
  `
): Promise<string> {
  try {
    const signer = await getSigner();
    const proofOfReserveContract = getContract(PROOF_OF_RESERVE_ADDRESS, PROOF_OF_RESERVE_ABI, signer);

    // Check if user has verifier role
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);
    const verifierRole = await coffeeTokenContract.VERIFIER_ROLE();
    const hasVerifierRole = await coffeeTokenContract.hasRole(verifierRole, await signer.getAddress());
    
    if (!hasVerifierRole) {
      throw new Error('User does not have VERIFIER_ROLE required to request verification');
    }

    const userAddress = await signer.getAddress();
    
    console.log(`Requesting verification for batch ${batchId}`);
    const tx = await proofOfReserveContract.requestReserveVerification(
      batchId,
      userAddress, // recipient address for minted tokens
      jsSource
    );

    const receipt = await tx.wait();
    
    // Find the verification request event
    const verificationEvent = receipt.events?.find(
      (event: any) => event.event === "ReserveVerificationRequested"
    );

    if (!verificationEvent) {
      throw new Error("ReserveVerificationRequested event not found");
    }

    const requestId = verificationEvent.args.requestId;
    console.log('Verification request submitted:', requestId);

    return requestId;

  } catch (error) {
    console.error('Error requesting batch verification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to request batch verification: ${errorMessage}`);
  }
}

/**
 * Request coffee redemption (Distributor)
 */
export async function requestCoffeeRedemption(
  batchId: string,
  quantity: number,
  deliveryAddress: string
): Promise<string> {
  try {
    const signer = await getSigner();
    const redemptionContract = getContract(REDEMPTION_CONTRACT_ADDRESS, REDEMPTION_CONTRACT_ABI, signer);

    console.log(`Requesting redemption for ${quantity} units of batch ${batchId}`);
    
    // Get the next redemption ID before making the request
    const nextRedemptionId = await redemptionContract.nextRedemptionId();
    
    const tx = await redemptionContract.requestRedemption(batchId, quantity, deliveryAddress);
    const receipt = await tx.wait();
    
    console.log('Redemption request submitted with ID:', nextRedemptionId.toString());
    return tx.hash; // Return transaction hash instead of redemption ID

  } catch (error) {
    console.error('Error requesting coffee redemption:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to request coffee redemption: ${errorMessage}`);
  }
}

/**
 * Get user's token balance for a specific batch
 */
export async function getUserBatchBalance(batchId: string, userAddress?: string): Promise<number> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const address = userAddress || await signer.getAddress();
    const balance = await coffeeTokenContract.balanceOf(address, batchId);

    return balance.toNumber();

  } catch (error) {
    console.error('Error fetching user batch balance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch user batch balance: ${errorMessage}`);
  }
}

/**
 * Check user roles
 */
export async function getUserRoles(userAddress?: string): Promise<{
  isAdmin: boolean;
  isVerifier: boolean;
  isMinter: boolean;
  isRedemption: boolean;
  isFulfiller: boolean;
}> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const address = userAddress || await signer.getAddress();
    
    const [adminRole, verifierRole, minterRole, redemptionRole, fulfillerRole] = await Promise.all([
      coffeeTokenContract.ADMIN_ROLE(),
      coffeeTokenContract.VERIFIER_ROLE(),
      coffeeTokenContract.MINTER_ROLE(),
      coffeeTokenContract.REDEMPTION_ROLE(),
      coffeeTokenContract.FULFILLER_ROLE()
    ]);

    const [isAdmin, isVerifier, isMinter, isRedemption, isFulfiller] = await Promise.all([
      coffeeTokenContract.hasRole(adminRole, address),
      coffeeTokenContract.hasRole(verifierRole, address),
      coffeeTokenContract.hasRole(minterRole, address),
      coffeeTokenContract.hasRole(redemptionRole, address),
      coffeeTokenContract.hasRole(fulfillerRole, address)
    ]);

    return { isAdmin, isVerifier, isMinter, isRedemption, isFulfiller };

  } catch (error) {
    console.error('Error checking user roles:', error);
    return { isAdmin: false, isVerifier: false, isMinter: false, isRedemption: false, isFulfiller: false };
  }
}

/**
 * Get verification request details
 */
export async function getVerificationRequest(requestId: string): Promise<VerificationRequest> {
  try {
    const signer = await getSigner();
    const proofOfReserveContract = getContract(PROOF_OF_RESERVE_ADDRESS, PROOF_OF_RESERVE_ABI, signer);

    const request = await proofOfReserveContract.verificationRequests(requestId);
    
    const [
      batchId,
      requestQuantity,
      verifiedQuantity,
      requestPrice,
      verifiedPrice,
      expectedPackaging,
      verifiedPackaging,
      expectedMetadataHash,
      verifiedMetadataHash,
      recipient,
      completed,
      verified,
      lastVerifiedTimestamp,
      shouldMint
    ] = request;

    return {
      requestId,
      batchId: batchId.toString(),
      requestQuantity: requestQuantity.toNumber(),
      verifiedQuantity: verifiedQuantity.toNumber(),
      requestPrice: requestPrice.toString(),
      verifiedPrice: verifiedPrice.toString(),
      recipient,
      completed,
      verified,
      shouldMint
    };

  } catch (error) {
    console.error('Error fetching verification request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch verification request: ${errorMessage}`);
  }
}

/**
 * Get redemption request details
 */
export async function getRedemptionRequest(redemptionId: string): Promise<RedemptionRequest> {
  try {
    const signer = await getSigner();
    const redemptionContract = getContract(REDEMPTION_CONTRACT_ADDRESS, REDEMPTION_CONTRACT_ABI, signer);

    const redemption = await redemptionContract.getRedemptionDetails(redemptionId);
    
    // The contract returns: (address consumer, uint256 batchId, uint256 quantity, string deliveryAddress, uint256 requestDate, uint8 status, uint256 fulfillmentDate)
    const {
      consumer,
      batchId,
      quantity,
      deliveryAddress,
      requestDate,
      status,
      fulfillmentDate
    } = redemption;

    return {
      redemptionId,
      consumer,
      batchId: batchId.toString(),
      quantity: quantity.toNumber(),
      deliveryAddress,
      requestDate: requestDate.toNumber(),
      status: status.toNumber(),
      fulfillmentDate: fulfillmentDate.toNumber()
    };

  } catch (error) {
    console.error('Error fetching redemption request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch redemption request: ${errorMessage}`);
  }
}
