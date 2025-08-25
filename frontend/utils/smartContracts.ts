import { ethers } from 'ethers';
import { 
  createBatchWithQRCode, 
  BatchCreationData, 
  fetchMetadataFromIPFS, 
  CoffeeBatchMetadata,
  generateCoffeeMetadata,
  uploadMetadataToIPFS,
  generateBatchQRCode,
  generateSimpleVerificationQR
} from './ipfsMetadata';

// Contract addresses from environment
const COFFEE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS!;
const PROOF_OF_RESERVE_ADDRESS = process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS!;
const INVENTORY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS!;
const REDEMPTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS!;

// Chainlink Functions configuration
const CHAINLINK_DON_ID = process.env.NEXT_PUBLIC_CHAINLINK_DON_ID!;
const CHAINLINK_SUBSCRIPTION_ID = process.env.NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID!;

// Simplified ABIs for the functions we need - Updated with blockchain-first workflow
const COFFEE_TOKEN_ABI = [
  // Blockchain-first workflow functions
  "function createBatch() external returns (uint256)",
  "function updateBatchIPFS(uint256 batchId, string memory ipfsUri, uint256 productionDate, uint256 expiryDate, uint256 quantity, uint256 pricePerUnit, string memory packagingInfo, string memory metadataHash) external",
  
  // Legacy function (kept for compatibility)
  "function createBatch(string memory ipfsUri, uint256 productionDate, uint256 expiryDate, uint256 quantity, uint256 pricePerUnit, string memory packagingInfo, string memory metadataHash) external returns (uint256)",
  
  // View functions
  "function s_batchInfo(uint256 batchId) external view returns (uint256 productionDate, uint256 expiryDate, bool isVerified, uint256 quantity, uint256 pricePerUnit, string memory packagingInfo, string memory metadataHash, bool isMetadataVerified, uint256 lastVerifiedTimestamp)",
  "function getActiveBatchIds() external view returns (uint256[] memory)",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function ADMIN_ROLE() external view returns (bytes32)",
  "function VERIFIER_ROLE() external view returns (bytes32)",
  "function DISTRIBUTOR_ROLE() external view returns (bytes32)",
  "event BatchCreated(uint256 indexed batchId, address indexed creator, uint256 quantity)"
];

const PROOF_OF_RESERVE_ABI = [
  "function requestReserveVerification(uint256 batchId, address recipient, string calldata source) external returns (bytes32)",
  "function requestInventoryVerification(uint256 batchId, string calldata source) external returns (bytes32)",
  "function verificationRequests(bytes32 requestId) external view returns (uint256 batchId, uint256 requestQuantity, uint256 verifiedQuantity, uint256 requestPrice, uint256 verifiedPrice, string memory expectedPackaging, string memory verifiedPackaging, string memory expectedMetadataHash, string memory verifiedMetadataHash, address recipient, bool completed, bool verified, uint256 lastVerifiedTimestamp, bool shouldMint)",
  "event ReserveVerificationRequested(bytes32 indexed requestId, uint256 indexed batchId, uint256 quantity)"
];

const REDEMPTION_CONTRACT_ABI = [
  "function requestRedemption(uint256 batchId, uint256 quantity, string memory deliveryDetails) external returns (uint256)",
  "function fulfillRedemption(uint256 redemptionId) external",
  "function getRedemptionDetails(uint256 redemptionId) external view returns (uint256 batchId, address requester, uint256 quantity, string memory deliveryDetails, uint8 status, uint256 requestTime, uint256 fulfillmentTime)",
  "event RedemptionRequested(uint256 indexed redemptionId, uint256 indexed batchId, address indexed requester, uint256 quantity)"
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

// Redemption request interface
export interface RedemptionRequest {
  redemptionId: string;
  batchId: string;
  requester: string;
  quantity: number;
  deliveryDetails: string;
  status: number; // 0: Pending, 1: Fulfilled, 2: Cancelled
  requestTime: number;
  fulfillmentTime: number;
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
// BLOCKCHAIN-FIRST WORKFLOW FUNCTIONS
// ===========================

/**
 * Create batch on blockchain first (step 1 of blockchain-first workflow)
 */
export async function createBatchOnBlockchain(): Promise<{
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

    console.log('Creating batch on blockchain (step 1)...');
    const tx = await coffeeTokenContract.createBatch();
    const receipt = await tx.wait();

    // Find the batch creation event to get the batch ID
    const batchCreatedEvent = receipt.events?.find(
      (event: any) => event.event === "BatchCreated"
    );

    if (!batchCreatedEvent) {
      throw new Error("BatchCreated event not found");
    }

    const batchId = batchCreatedEvent.args.batchId.toString();
    
    console.log(`✅ Batch created on blockchain: ID ${batchId}`);
    return {
      batchId,
      transactionHash: receipt.transactionHash
    };

  } catch (error) {
    console.error('Error creating batch on blockchain:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to create batch on blockchain: ${errorMessage}`);
  }
}

/**
 * Update batch with IPFS data (step 2 of blockchain-first workflow)
 */
export async function updateBatchWithIPFS(
  batchId: string,
  ipfsUri: string,
  batchData: BatchCreationData
): Promise<{
  transactionHash: string;
  batchId: string;
}> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    // Check if user has admin role
    const adminRole = await coffeeTokenContract.ADMIN_ROLE();
    const hasAdminRole = await coffeeTokenContract.hasRole(adminRole, await signer.getAddress());
    
    if (!hasAdminRole) {
      throw new Error('User does not have ADMIN_ROLE required to update batches');
    }

    console.log(`Updating batch ${batchId} with IPFS data (step 2)...`);
    
    // Convert dates to Unix timestamps
    const productionDate = Math.floor(batchData.productionDate.getTime() / 1000);
    const expiryDate = Math.floor(batchData.expiryDate.getTime() / 1000);
    
    // Extract CID from IPFS URI
    const metadataHash = ipfsUri.replace('ipfs://', '');
    
    // Convert price to cents
    const priceInCents = Math.round(parseFloat(batchData.pricePerUnit) * 100).toString();
    
    const tx = await coffeeTokenContract.updateBatchIPFS(
      batchId,
      ipfsUri,
      productionDate,
      expiryDate,
      batchData.quantity,
      priceInCents,
      batchData.packagingInfo,
      metadataHash
    );

    const receipt = await tx.wait();
    
    console.log(`✅ Batch ${batchId} updated with IPFS data`);
    return {
      transactionHash: receipt.transactionHash,
      batchId
    };

  } catch (error) {
    console.error('Error updating batch with IPFS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to update batch with IPFS: ${errorMessage}`);
  }
}

/**
 * Complete blockchain-first batch creation workflow
 */
export async function createBatchBlockchainFirst(batchData: BatchCreationData): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
  qrCodeDataUrl: string;
  verificationQR: string;
}> {
  try {
    console.log('🚀 Starting blockchain-first batch creation workflow...');
    
    // Step 1: Create batch on blockchain first
    const { batchId, transactionHash: createTxHash } = await createBatchOnBlockchain();
    
    // Step 2: Upload to IPFS with the blockchain-generated batch ID
    const batchDataWithId = {
      ...batchData,
      batchId: parseInt(batchId)
    };
    
    console.log('📤 Uploading batch data to IPFS...');
    
    // Generate standardized metadata
    const metadata = generateCoffeeMetadata(batchData);
    
    // Upload metadata to IPFS
    const { uri: ipfsUri, metadataHash } = await uploadMetadataToIPFS(metadata);
    
    // Step 3: Update blockchain with IPFS data
    console.log('📝 Updating blockchain with IPFS data...');
    const { transactionHash: updateTxHash } = await updateBatchWithIPFS(
      batchId, 
      ipfsUri, 
      batchData
    );
    
    // Step 4: Generate QR codes
    console.log('🔳 Generating QR codes...');
    const qrCodeDataUrl = await generateBatchQRCode(batchId, metadata, ipfsUri);
    const verificationQR = await generateSimpleVerificationQR(batchId);
    
    console.log('✅ Blockchain-first workflow completed successfully!');
    
    return {
      batchId,
      ipfsUri,
      metadataHash,
      transactionHash: updateTxHash, // Return the final update transaction
      qrCodeDataUrl,
      verificationQR
    };

  } catch (error) {
    console.error('Error in blockchain-first workflow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Blockchain-first workflow failed: ${errorMessage}`);
  }
}

// ===========================
// ADMIN FUNCTIONS (LEGACY - KEEP FOR COMPATIBILITY)
// ===========================

/**
 * Create a new coffee batch (Admin only)
 */
export async function createCoffeeBatch(batchData: BatchCreationData): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
  qrCodeDataUrl: string;
  verificationQR: string;
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

    // Create batch creation function
    const createBatchFunction = async (
      ipfsUri: string,
      productionDate: number,
      expiryDate: number,
      quantity: number,
      pricePerUnit: string,
      packagingInfo: string,
      metadataHash: string
    ) => {
      return coffeeTokenContract.createBatch(
        ipfsUri,
        productionDate,
        expiryDate,
        quantity,
        pricePerUnit,
        packagingInfo,
        metadataHash
      );
    };

    // Create batch with IPFS and QR code
    const result = await createBatchWithQRCode(batchData, createBatchFunction);

    console.log('Batch created successfully:', result);
    return result;

  } catch (error) {
    console.error('Error creating coffee batch:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to create coffee batch: ${errorMessage}`);
  }
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

    const batchInfo = await coffeeTokenContract.s_batchInfo(batchId);
    
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
    const batchInfo = await getBatchInfo(batchId);
    
    // Try to construct IPFS URI from metadata hash
    const ipfsUri = `ipfs://${batchInfo.metadataHash}`;
    
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
  deliveryDetails: string
): Promise<string> {
  try {
    const signer = await getSigner();
    const redemptionContract = getContract(REDEMPTION_CONTRACT_ADDRESS, REDEMPTION_CONTRACT_ABI, signer);

    console.log(`Requesting redemption for ${quantity} units of batch ${batchId}`);
    const tx = await redemptionContract.requestRedemption(batchId, quantity, deliveryDetails);

    const receipt = await tx.wait();
    
    // Find the redemption request event
    const redemptionEvent = receipt.events?.find(
      (event: any) => event.event === "RedemptionRequested"
    );

    if (!redemptionEvent) {
      throw new Error("RedemptionRequested event not found");
    }

    const redemptionId = redemptionEvent.args.redemptionId.toString();
    console.log('Redemption request submitted:', redemptionId);

    return redemptionId;

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
  isDistributor: boolean;
}> {
  try {
    const signer = await getSigner();
    const coffeeTokenContract = getContract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const address = userAddress || await signer.getAddress();
    
    const [adminRole, verifierRole, distributorRole] = await Promise.all([
      coffeeTokenContract.ADMIN_ROLE(),
      coffeeTokenContract.VERIFIER_ROLE(),
      coffeeTokenContract.DISTRIBUTOR_ROLE()
    ]);

    const [isAdmin, isVerifier, isDistributor] = await Promise.all([
      coffeeTokenContract.hasRole(adminRole, address),
      coffeeTokenContract.hasRole(verifierRole, address),
      coffeeTokenContract.hasRole(distributorRole, address)
    ]);

    return { isAdmin, isVerifier, isDistributor };

  } catch (error) {
    console.error('Error checking user roles:', error);
    return { isAdmin: false, isVerifier: false, isDistributor: false };
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
    
    const [
      batchId,
      requester,
      quantity,
      deliveryDetails,
      status,
      requestTime,
      fulfillmentTime
    ] = redemption;

    return {
      redemptionId,
      batchId: batchId.toString(),
      requester,
      quantity: quantity.toNumber(),
      deliveryDetails,
      status: status.toNumber(),
      requestTime: requestTime.toNumber(),
      fulfillmentTime: fulfillmentTime.toNumber()
    };

  } catch (error) {
    console.error('Error fetching redemption request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch redemption request: ${errorMessage}`);
  }
}
