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

// Contract addresses from environment - Base Sepolia Deployment
const COFFEE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS!;
const COFFEE_VIEWS_ADDRESS = process.env.NEXT_PUBLIC_WAGA_COFFEE_VIEWS_ADDRESS!;
const BATCH_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_BATCH_MANAGER_ADDRESS!;
const PROOF_OF_RESERVE_ADDRESS = process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS!;
const INVENTORY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS!;
const REDEMPTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS!;
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_WAGA_TREASURY_ADDRESS!;
const CDP_INTEGRATION_ADDRESS = process.env.NEXT_PUBLIC_WAGA_CDP_INTEGRATION_ADDRESS!;
const ACCESS_CONTROL_ADDRESS = process.env.NEXT_PUBLIC_WAGA_ACCESS_CONTROL_ADDRESS!;
const CONFIG_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_CONFIG_MANAGER_ADDRESS!;

// ZK Contract addresses
const ZK_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_ZK_MANAGER_ADDRESS!;
const PRIVACY_LAYER_ADDRESS = process.env.NEXT_PUBLIC_PRIVACY_LAYER_ADDRESS!;
const CIRCOM_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_CIRCOM_VERIFIER_ADDRESS!;
const PRICE_PRIVACY_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_PRICE_PRIVACY_VERIFIER_ADDRESS!;
const QUALITY_TIER_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_QUALITY_TIER_VERIFIER_ADDRESS!;
const SUPPLY_CHAIN_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_SUPPLY_CHAIN_VERIFIER_ADDRESS!;

// Chainlink Functions configuration - Base Sepolia
const CHAINLINK_DON_ID = process.env.NEXT_PUBLIC_CHAINLINK_DON_ID!;
const CHAINLINK_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_CHAINLINK_ROUTER_ADDRESS!;
const CHAINLINK_SUBSCRIPTION_ID = process.env.NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID!;
const CHAINLINK_GAS_LIMIT = parseInt(process.env.NEXT_PUBLIC_CHAINLINK_GAS_LIMIT || '300000');

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
export const COFFEE_TOKEN_ABI = [
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
  "function PROCESSOR_ROLE() external view returns (bytes32)",
  "function COOPERATIVE_ROLE() external view returns (bytes32)",
  "function DISTRIBUTOR_ROLE() external view returns (bytes32)",
  "function grantRole(bytes32 role, address account) external",
  "function revokeRole(bytes32 role, address account) external",
  "function getUserAccessLevel(address account) external view returns (string)",
  "function canCreateBatches(address account) external view returns (bool)",
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

// ZK Manager ABI
const ZK_MANAGER_ABI = [
  "function verifyPriceProof(uint256 batchId, uint256[8] memory proof, uint256[3] memory inputs) external view returns (bool)",
  "function verifyQualityProof(uint256 batchId, uint256[8] memory proof, uint256[3] memory inputs) external view returns (bool)",
  "function verifySupplyChainProof(uint256 batchId, uint256[8] memory proof, uint256[3] memory inputs) external view returns (bool)",
  "function setPrivacyLevel(uint256 batchId, uint8 level) external",
  "function getPrivacyLevel(uint256 batchId) external view returns (uint8)",
  "function batchPrivacyLevels(uint256) external view returns (uint8)"
];

// Privacy Layer ABI
const PRIVACY_LAYER_ABI = [
  "function setBatchPrivacy(uint256 batchId, uint8 pricingLevel, uint8 qualityLevel, uint8 supplyChainLevel) external",
  "function getPublicClaims(uint256 batchId, address viewer) external view returns (string memory pricingDisplay, string memory qualityDisplay, string memory supplyChainDisplay)",
  "function batchPrivacyConfig(uint256) external view returns (uint8 pricingLevel, uint8 qualityLevel, uint8 supplyChainLevel, address creator)",
  "function createPrivacyConfig(uint256 batchId, address creator) external"
];

// Circom Verifier ABI
const CIRCOM_VERIFIER_ABI = [
  "function verifyProof(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[3] memory input) external view returns (bool)"
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
  isProcessor: boolean;
  isCooperative: boolean;
  isDistributor: boolean;
  isZkVerifier: boolean;
  ADMIN_ROLE?: boolean;
  VERIFIER_ROLE?: boolean;
  MINTER_ROLE?: boolean;
  REDEMPTION_ROLE?: boolean;
  FULFILLER_ROLE?: boolean;
  PROCESSOR_ROLE?: boolean;
  COOPERATIVE_ROLE?: boolean;
  DISTRIBUTOR_ROLE?: boolean;
  ZK_VERIFIER_ROLE?: boolean;
}> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const address = userAddress || await signer.getAddress();
    
    // Get all role hashes
    const [
      adminRole, 
      verifierRole, 
      minterRole, 
      redemptionRole, 
      fulfillerRole,
      processorRole,
      cooperativeRole,
      distributorRole
    ] = await Promise.all([
      coffeeTokenContract.ADMIN_ROLE(),
      coffeeTokenContract.VERIFIER_ROLE(),
      coffeeTokenContract.MINTER_ROLE(),
      coffeeTokenContract.REDEMPTION_ROLE(),
      coffeeTokenContract.FULFILLER_ROLE(),
      coffeeTokenContract.PROCESSOR_ROLE(),
      coffeeTokenContract.COOPERATIVE_ROLE(),
      coffeeTokenContract.DISTRIBUTOR_ROLE()
    ]);

    // Check all roles
    const [
      isAdmin, 
      isVerifier, 
      isMinter, 
      isRedemption, 
      isFulfiller,
      isProcessor,
      isCooperative,
      isDistributor
    ] = await Promise.all([
      coffeeTokenContract.hasRole(adminRole, address),
      coffeeTokenContract.hasRole(verifierRole, address),
      coffeeTokenContract.hasRole(minterRole, address),
      coffeeTokenContract.hasRole(redemptionRole, address),
      coffeeTokenContract.hasRole(fulfillerRole, address),
      coffeeTokenContract.hasRole(processorRole, address),
      coffeeTokenContract.hasRole(cooperativeRole, address),
      coffeeTokenContract.hasRole(distributorRole, address)
    ]);

    return { 
      isAdmin, 
      isVerifier, 
      isMinter, 
      isRedemption, 
      isFulfiller,
      isProcessor,
      isCooperative,
      isDistributor,
      isZkVerifier: false, // ZK verifier role may not be available in all contracts
      // Also provide role keys for easier access
      ADMIN_ROLE: isAdmin,
      VERIFIER_ROLE: isVerifier,
      MINTER_ROLE: isMinter,
      REDEMPTION_ROLE: isRedemption,
      FULFILLER_ROLE: isFulfiller,
      PROCESSOR_ROLE: isProcessor,
      COOPERATIVE_ROLE: isCooperative,
      DISTRIBUTOR_ROLE: isDistributor,
      ZK_VERIFIER_ROLE: false
    };

  } catch (error) {
    console.error('Error checking user roles:', error);
    return { 
      isAdmin: false, 
      isVerifier: false, 
      isMinter: false, 
      isRedemption: false, 
      isFulfiller: false,
      isProcessor: false,
      isCooperative: false,
      isDistributor: false,
      isZkVerifier: false,
      ADMIN_ROLE: false,
      VERIFIER_ROLE: false,
      MINTER_ROLE: false,
      REDEMPTION_ROLE: false,
      FULFILLER_ROLE: false,
      PROCESSOR_ROLE: false,
      COOPERATIVE_ROLE: false,
      DISTRIBUTOR_ROLE: false,
      ZK_VERIFIER_ROLE: false
    };
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

/**
 * ============================================================================
 * ZK (ZERO KNOWLEDGE) FUNCTIONS
 * ============================================================================
 */

/**
 * Set privacy level for a batch
 */
export async function setBatchPrivacyLevel(batchId: string, privacyLevel: number): Promise<{ transactionHash: string }> {
  try {
    const signer = await getSigner();
    const zkManagerContract = getContract(ZK_MANAGER_ADDRESS, ZK_MANAGER_ABI, signer);

    const tx = await zkManagerContract.setPrivacyLevel(batchId, privacyLevel);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('Error setting batch privacy level:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to set batch privacy level: ${errorMessage}`);
  }
}

/**
 * Get privacy level for a batch
 */
export async function getBatchPrivacyLevel(batchId: string): Promise<number> {
  try {
    const signer = await getSigner();
    const zkManagerContract = getContract(ZK_MANAGER_ADDRESS, ZK_MANAGER_ABI, signer);

    const privacyLevel = await zkManagerContract.getPrivacyLevel(batchId);
    return privacyLevel.toNumber();

  } catch (error) {
    console.error('Error getting batch privacy level:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to get batch privacy level: ${errorMessage}`);
  }
}

/**
 * Set batch privacy configuration
 */
export async function setBatchPrivacy(
  batchId: string,
  pricingLevel: number,
  qualityLevel: number,
  supplyChainLevel: number
): Promise<{ transactionHash: string }> {
  try {
    const signer = await getSigner();
    const privacyLayerContract = getContract(PRIVACY_LAYER_ADDRESS, PRIVACY_LAYER_ABI, signer);

    const tx = await privacyLayerContract.setBatchPrivacy(batchId, pricingLevel, qualityLevel, supplyChainLevel);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('Error setting batch privacy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to set batch privacy: ${errorMessage}`);
  }
}

/**
 * Get public claims for a batch
 */
export async function getBatchPublicClaims(batchId: string, viewerAddress?: string): Promise<{
  pricingDisplay: string;
  qualityDisplay: string;
  supplyChainDisplay: string;
}> {
  try {
    const signer = await getSigner();
    const privacyLayerContract = getContract(PRIVACY_LAYER_ADDRESS, PRIVACY_LAYER_ABI, signer);

    const viewer = viewerAddress || await signer.getAddress();
    const claims = await privacyLayerContract.getPublicClaims(batchId, viewer);

    return {
      pricingDisplay: claims.pricingDisplay,
      qualityDisplay: claims.qualityDisplay,
      supplyChainDisplay: claims.supplyChainDisplay
    };

  } catch (error) {
    console.error('Error getting batch public claims:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to get batch public claims: ${errorMessage}`);
  }
}

/**
 * Verify ZK proof using Circom verifier
 */
export async function verifyZKProof(
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  },
  inputs: [string, string, string]
): Promise<boolean> {
  try {
    const signer = await getSigner();
    const circomVerifierContract = getContract(CIRCOM_VERIFIER_ADDRESS, CIRCOM_VERIFIER_ABI, signer);

    const result = await circomVerifierContract.verifyProof(proof.a, proof.b, proof.c, inputs);
    return result;

  } catch (error) {
    console.error('Error verifying ZK proof:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to verify ZK proof: ${errorMessage}`);
  }
}

/**
 * Get batch privacy configuration
 */
export async function getBatchPrivacyConfig(batchId: string): Promise<{
  pricingLevel: number;
  qualityLevel: number;
  supplyChainLevel: number;
  creator: string;
}> {
  try {
    const signer = await getSigner();
    const privacyLayerContract = getContract(PRIVACY_LAYER_ADDRESS, PRIVACY_LAYER_ABI, signer);

    const config = await privacyLayerContract.batchPrivacyConfig(batchId);

    return {
      pricingLevel: config.pricingLevel.toNumber(),
      qualityLevel: config.qualityLevel.toNumber(),
      supplyChainLevel: config.supplyChainLevel.toNumber(),
      creator: config.creator
    };

  } catch (error) {
    console.error('Error getting batch privacy config:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to get batch privacy config: ${errorMessage}`);
  }
}

/**
 * Get batch product type
 */
export async function getBatchProductType(batchId: string): Promise<number> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const productType = await coffeeTokenContract.getBatchProductType(batchId);
    return productType.toNumber();

  } catch (error) {
    console.error('Error getting batch product type:', error);
    // Default to RETAIL_BAGS (0) if error
    return 0;
  }
}

/**
 * Get batch unit weight
 */
export async function getBatchUnitWeight(batchId: string): Promise<string> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const unitWeight = await coffeeTokenContract.getBatchUnitWeight(batchId);
    return unitWeight;

  } catch (error) {
    console.error('Error getting batch unit weight:', error);
    // Return empty string if error
    return '';
  }
}

/**
 * Generate ZK proof hash (placeholder implementation)
 * In production, this would integrate with actual ZK circuit compilation
 */
async function generateZKProofHash(
  proofType: 'pricing' | 'quality' | 'supplyChain',
  batchData: any,
  sensitiveData: any
): Promise<string> {
  try {
    // Placeholder implementation - generates deterministic hash based on data
    const proofInput = JSON.stringify({
      type: proofType,
      batchData: batchData,
      sensitiveData: sensitiveData,
      timestamp: Date.now()
    });
    
    // In production, this would:
    // 1. Compile the appropriate circom circuit (PricePrivacyCircuit.circom, etc.)
    // 2. Generate witness with the sensitive data
    // 3. Generate actual ZK proof
    // 4. Return the proof hash
    
    // For now, create a deterministic hash
    const encoder = new TextEncoder();
    const data = encoder.encode(proofInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `zk_proof_${proofType}_${hashHex.substring(0, 16)}`;
  } catch (error) {
    console.error(`Error generating ZK proof hash for ${proofType}:`, error);
    throw new Error(`Failed to generate ZK proof hash: ${error}`);
  }
}

/**
 * Generate encrypted data hash for sensitive information
 */
async function generateEncryptedDataHash(sensitiveData: any): Promise<string> {
  try {
    // In production, this would:
    // 1. Encrypt the sensitive data using AES or similar
    // 2. Store encrypted data securely (IPFS private, secure storage)
    // 3. Return hash of encrypted data
    
    const dataToEncrypt = JSON.stringify(sensitiveData);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToEncrypt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `encrypted_${hashHex.substring(0, 16)}`;
  } catch (error) {
    console.error('Error generating encrypted data hash:', error);
    throw new Error(`Failed to generate encrypted data hash: ${error}`);
  }
}

/**
 * Complete privacy-enhanced batch creation workflow
 * Integrates standard blockchain-first workflow with privacy features
 */
export async function createPrivacyEnhancedBatch(
  batchData: ExtendedBatchCreationData,
  privacyConfig: {
    pricingPrivate: boolean;
    qualityPrivate: boolean;
    supplyChainPrivate: boolean;
    sensitiveData: {
      pricing?: any;
      quality?: any;
      supplyChain?: any;
    };
  }
): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
  qrCodeDataUrl: string;
  verificationQR: string;
  privacyHashes: {
    pricingProofHash?: string;
    qualityProofHash?: string;
    supplyChainProofHash?: string;
    encryptedDataHash: string;
  };
}> {
  try {
    console.log('🔐 Starting privacy-enhanced batch creation workflow...');

    // Step 1: Create standard batch using blockchain-first workflow
    console.log('📦 Creating standard batch with blockchain-first workflow...');
    const standardResult = await createBatchBlockchainFirst(batchData);

    // Step 2: Generate ZK proof hashes for enabled privacy features
    console.log('🔒 Generating ZK proof hashes...');
    const privacyHashes: {
      pricingProofHash?: string;
      qualityProofHash?: string;
      supplyChainProofHash?: string;
      encryptedDataHash: string;
    } = {
      encryptedDataHash: await generateEncryptedDataHash(privacyConfig.sensitiveData)
    };

    if (privacyConfig.pricingPrivate && privacyConfig.sensitiveData.pricing) {
      privacyHashes.pricingProofHash = await generateZKProofHash(
        'pricing',
        batchData,
        privacyConfig.sensitiveData.pricing
      );
    }

    if (privacyConfig.qualityPrivate && privacyConfig.sensitiveData.quality) {
      privacyHashes.qualityProofHash = await generateZKProofHash(
        'quality',
        batchData,
        privacyConfig.sensitiveData.quality
      );
    }

    if (privacyConfig.supplyChainPrivate && privacyConfig.sensitiveData.supplyChain) {
      privacyHashes.supplyChainProofHash = await generateZKProofHash(
        'supplyChain',
        batchData,
        privacyConfig.sensitiveData.supplyChain
      );
    }

    // Step 3: Set privacy configuration on blockchain
    console.log('🛡️ Configuring privacy settings on blockchain...');
    try {
      const signer = await getSigner();
      const privacyLayerContract = getContract(PRIVACY_LAYER_ADDRESS, PRIVACY_LAYER_ABI, signer);

      // Create privacy config for the batch
      await privacyLayerContract.createPrivacyConfig(
        standardResult.batchId,
        await signer.getAddress()
      );

      // Set privacy levels (0 = public, 1 = selective, 2 = private)
      const pricingLevel = privacyConfig.pricingPrivate ? 2 : 0;
      const qualityLevel = privacyConfig.qualityPrivate ? 2 : 0;
      const supplyChainLevel = privacyConfig.supplyChainPrivate ? 2 : 0;

      await privacyLayerContract.setBatchPrivacy(
        standardResult.batchId,
        pricingLevel,
        qualityLevel,
        supplyChainLevel
      );

      console.log('✅ Privacy configuration set successfully');
    } catch (privacyError) {
      console.warn('⚠️ Privacy configuration failed (non-blocking):', privacyError);
      // Privacy setup failure doesn't block the main workflow
    }

    // Step 4: Enhanced database sync with privacy data
    console.log('💾 Syncing privacy-enhanced batch to database...');
    try {
      const { syncBatchToDatabase } = await import('./databaseSync');
      const syncResult = await syncBatchToDatabase({
        batchId: standardResult.batchId,
        transactionHash: standardResult.transactionHash,
        ipfsUri: standardResult.ipfsUri,
        metadataHash: standardResult.metadataHash,
        batchData
      });
      
      if (syncResult.success) {
        console.log('💾 Privacy-enhanced database sync: ✅ completed');
      } else {
        console.warn('💾 Privacy-enhanced database sync: ❌ failed (non-blocking)', syncResult.error);
      }
    } catch (dbError) {
      console.warn('💾 Privacy-enhanced database sync: ❌ failed (non-blocking)', dbError);
    }

    console.log('🎉 Privacy-enhanced batch creation completed successfully!');

    return {
      ...standardResult,
      privacyHashes
    };

  } catch (error) {
    console.error('❌ Error in privacy-enhanced batch creation workflow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Privacy-enhanced batch creation failed: ${errorMessage}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                            ROLE MANAGEMENT                                 */
/* -------------------------------------------------------------------------- */

export async function grantUserRole(userAddress: string, roleName: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await getSigner();
    const accessControlContract = new ethers.Contract(ACCESS_CONTROL_ADDRESS, COFFEE_TOKEN_ABI, signer);
    
    // Get the role hash
    let roleHash: string;
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        roleHash = await accessControlContract.ADMIN_ROLE();
        break;
      case 'PROCESSOR':
        roleHash = await accessControlContract.PROCESSOR_ROLE();
        break;
      case 'COOPERATIVE':
        roleHash = await accessControlContract.COOPERATIVE_ROLE();
        break;
      case 'DISTRIBUTOR':
        roleHash = await accessControlContract.DISTRIBUTOR_ROLE();
        break;
      case 'VERIFIER':
        roleHash = await accessControlContract.VERIFIER_ROLE();
        break;
      case 'MINTER':
        roleHash = await accessControlContract.MINTER_ROLE();
        break;
      case 'REDEMPTION':
        roleHash = await accessControlContract.REDEMPTION_ROLE();
        break;
      case 'FULFILLER':
        roleHash = await accessControlContract.FULFILLER_ROLE();
        break;
      default:
        throw new Error(`Unknown role: ${roleName}`);
    }

    // Check if current user has admin role
    const adminRole = await accessControlContract.ADMIN_ROLE();
    const hasAdminRole = await accessControlContract.hasRole(adminRole, await signer.getAddress());
    
    if (!hasAdminRole) {
      throw new Error('Only admins can grant roles');
    }

    // Grant the role
    const tx = await accessControlContract.grantRole(roleHash, userAddress);
    await tx.wait();

    return {
      success: true,
      txHash: tx.hash
    };

  } catch (error) {
    console.error('Error granting role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function revokeUserRole(userAddress: string, roleName: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await getSigner();
    const accessControlContract = new ethers.Contract(ACCESS_CONTROL_ADDRESS, COFFEE_TOKEN_ABI, signer);
    
    // Get the role hash
    let roleHash: string;
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        roleHash = await accessControlContract.ADMIN_ROLE();
        break;
      case 'PROCESSOR':
        roleHash = await accessControlContract.PROCESSOR_ROLE();
        break;
      case 'COOPERATIVE':
        roleHash = await accessControlContract.COOPERATIVE_ROLE();
        break;
      case 'DISTRIBUTOR':
        roleHash = await accessControlContract.DISTRIBUTOR_ROLE();
        break;
      case 'VERIFIER':
        roleHash = await accessControlContract.VERIFIER_ROLE();
        break;
      case 'MINTER':
        roleHash = await accessControlContract.MINTER_ROLE();
        break;
      case 'REDEMPTION':
        roleHash = await accessControlContract.REDEMPTION_ROLE();
        break;
      case 'FULFILLER':
        roleHash = await accessControlContract.FULFILLER_ROLE();
        break;
      default:
        throw new Error(`Unknown role: ${roleName}`);
    }

    // Check if current user has admin role
    const adminRole = await accessControlContract.ADMIN_ROLE();
    const hasAdminRole = await accessControlContract.hasRole(adminRole, await signer.getAddress());
    
    if (!hasAdminRole) {
      throw new Error('Only admins can revoke roles');
    }

    // Revoke the role
    const tx = await accessControlContract.revokeRole(roleHash, userAddress);
    await tx.wait();

    return {
      success: true,
      txHash: tx.hash
    };

  } catch (error) {
    console.error('Error revoking role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function checkUserRole(userAddress: string, roleName: string): Promise<boolean> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accessControlContract = new ethers.Contract(ACCESS_CONTROL_ADDRESS, COFFEE_TOKEN_ABI, provider);
    
    // Get the role hash
    let roleHash: string;
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        roleHash = await accessControlContract.ADMIN_ROLE();
        break;
      case 'PROCESSOR':
        roleHash = await accessControlContract.PROCESSOR_ROLE();
        break;
      case 'COOPERATIVE':
        roleHash = await accessControlContract.COOPERATIVE_ROLE();
        break;
      case 'DISTRIBUTOR':
        roleHash = await accessControlContract.DISTRIBUTOR_ROLE();
        break;
      case 'VERIFIER':
        roleHash = await accessControlContract.VERIFIER_ROLE();
        break;
      case 'MINTER':
        roleHash = await accessControlContract.MINTER_ROLE();
        break;
      case 'REDEMPTION':
        roleHash = await accessControlContract.REDEMPTION_ROLE();
        break;
      case 'FULFILLER':
        roleHash = await accessControlContract.FULFILLER_ROLE();
        break;
      default:
        return false;
    }

    return await accessControlContract.hasRole(roleHash, userAddress);

  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

export async function getUserAccessLevel(userAddress: string): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accessControlContract = new ethers.Contract(ACCESS_CONTROL_ADDRESS, COFFEE_TOKEN_ABI, provider);
    
    return await accessControlContract.getUserAccessLevel(userAddress);

  } catch (error) {
    console.error('Error getting user access level:', error);
    return 'Public';
  }
}

export async function getAllUserRoles(userAddress: string): Promise<string[]> {
  try {
    const roles = ['ADMIN', 'PROCESSOR', 'COOPERATIVE', 'DISTRIBUTOR', 'VERIFIER', 'MINTER', 'REDEMPTION', 'FULFILLER'];
    const userRoles: string[] = [];

    for (const role of roles) {
      const hasRole = await checkUserRole(userAddress, role);
      if (hasRole) {
        userRoles.push(role);
      }
    }

    return userRoles;

  } catch (error) {
    console.error('Error getting all user roles:', error);
    return [];
  }
}
