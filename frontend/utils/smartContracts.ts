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
import { ProofType, CIRCUIT_VERIFIERS } from './types';

// Contract addresses from environment - Base Sepolia Deployment
// Updated to match the actual deployed addresses from deployment summary
const COFFEE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS!;
const COFFEE_VIEWS_ADDRESS = process.env.NEXT_PUBLIC_WAGA_COFFEE_VIEWS_ADDRESS!;
const BATCH_OPERATIONS_ADDRESS = process.env.NEXT_PUBLIC_WAGA_BATCH_OPERATIONS_ADDRESS!;
export const PROOF_OF_RESERVE_ADDRESS = process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS!;
const INVENTORY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS!;
const REDEMPTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WAGA_REDEMPTION_CONTRACT_ADDRESS!;
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_WAGA_TREASURY_ADDRESS!;
const CDP_INTEGRATION_ADDRESS = process.env.NEXT_PUBLIC_WAGA_CDP_INTEGRATION_ADDRESS!;
const CONFIG_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_CONFIG_MANAGER_ADDRESS!;

// ZK Contract addresses
const ZK_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_WAGA_ZK_MANAGER_ADDRESS!;
const PRIVACY_LAYER_ADDRESS = process.env.NEXT_PUBLIC_PRIVACY_LAYER_ADDRESS!;
const CIRCOM_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_CIRCOM_VERIFIER_ADDRESS!;
const PRICE_PRIVACY_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_PRICE_PRIVACY_VERIFIER_ADDRESS!;
const QUALITY_TIER_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_QUALITY_TIER_VERIFIER_ADDRESS!;
const SUPPLY_CHAIN_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_SUPPLY_CHAIN_VERIFIER_ADDRESS!;

// Ethiopian Compliance addresses
const ETHIOPIAN_COMPLIANCE_CORE_ADDRESS = process.env.NEXT_PUBLIC_WAGA_ETHIOPIAN_COMPLIANCE_CORE_ADDRESS!;
const BANKING_CORE_ADDRESS = process.env.NEXT_PUBLIC_WAGA_BANKING_CORE_ADDRESS!;

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
  // Batch Request Functions
  "function createBatchRequest(uint256 batchId, uint256 requestedQuantity, string memory requestDetails) external returns (uint256)",
  "function getBatchRequest(uint256 batchId, uint256 requestIndex) external view returns (uint256 batchId, address requester, uint256 requestedQuantity, string memory requestDetails, uint256 requestTimestamp, bool isFulfilled, uint256 fulfilledQuantity, uint256 fulfilledTimestamp)",
  "function getBatchRequestCount(uint256 batchId) external view returns (uint256)",
  "function getAllBatchRequests(uint256 batchId) external view returns (tuple(uint256,address,uint256,string,uint256,bool,uint256,uint256)[])",
  "event BatchCreated(uint256 indexed batchId, string ipfsUri)",
  "event BatchIPFSUpdated(uint256 indexed batchId, string newIpfsUri)",
  "event TokensMinted(address indexed to, uint256 indexed batchId, uint256 amount)",
  "function uri(uint256 tokenId) external view returns (string memory)"
];

export const PROOF_OF_RESERVE_ABI = [
  "function requestReserveVerification(uint256 batchId, uint256 requestId, string calldata source) external returns (bytes32)",
  "function requestInventoryVerification(uint256 batchId, string calldata source) external returns (bytes32)",
  "function verificationRequests(bytes32 requestId) external view returns (uint256 batchId, uint256 batchQuantity, uint256 requestQuantity, uint256 verifiedQuantity, uint256 requestPrice, uint256 verifiedPrice, string memory expectedPackaging, string memory verifiedPackaging, string memory expectedMetadataHash, string memory verifiedMetadataHash, address recipient, bool completed, bool verified, uint256 lastVerifiedTimestamp, bool shouldMint)",
  "event ReserveVerificationRequested(bytes32 indexed requestId, uint256 indexed batchId, uint256 quantity)",
  "event ReserveVerificationCompleted(bytes32 indexed requestId, uint256 indexed batchId, bool verified)",
  "event TokensMinted(bytes32 indexed requestId, address indexed recipient, uint256 indexed batchId, uint256 requestedQuantity, uint256 verifiedQuantity)"
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

// Coffee Views ABI - for batch viewing and metadata functions
const COFFEE_VIEWS_ABI = [
  "function getBatchInfo(uint256 batchId) external view returns (uint256 productionDate, uint256 expiryDate, uint256 quantity, uint256 pricePerUnit, string memory packagingInfo, string memory metadataHash, uint256 lastVerifiedTimestamp)",
  "function getBatchWithProductType(uint256 batchId) external view returns (uint256, uint256, uint256, uint256, string, string, address, uint256, uint8, string)",
  "function getActiveBatchIds() external view returns (uint256[])",
  "function getBatchProductType(uint256 batchId) external view returns (uint8)",
  "function getBatchUnitWeight(uint256 batchId) external view returns (string)",
  "function getBatchAdditionalInfo(uint256 batchId) external view returns (string memory origin, address creator, uint256 timestamp, bool isExpired, bool isMetadataVerified)",
  "function isBatchMetadataVerified(uint256 batchId) external view returns (bool)",
  "function isBatchVerified(uint256 batchId) external view returns (bool)"
];

// Batch Manager ABI - for batch management and metadata functions
const BATCH_MANAGER_ABI = [
  "function registerBatchCreation(uint256 batchId, string calldata origin, address creator) external",
  "function resetBatchVerificationFlags(uint256 batchId) external",
  "function markBatchExpired(uint256 batchId) external",
  "function markBatchAsVerified(uint256 batchId) external",
  "function updateBatchStatus(uint256 batchId, bool isActive) external",
  "function updateInventory(uint256 batchId, uint256 verifiedQuantity) external",
  "function verifyBatchMetadata(uint256 batchId, string calldata verifiedPackaging, string calldata verifiedMetadataHash) external",
  "function getBatchAdditionalInfo(uint256 batchId) external view returns (string memory origin, address creator, uint256 timestamp, bool isExpired, bool isMetadataVerified)",
  "function updateZKClaims(uint256 batchId, string calldata pricingClaim, string calldata qualityClaim, string calldata supplyChainClaim) external",
  "function canViewPricingData(uint256 batchId, address caller) external view returns (bool)",
  "function canViewSupplyChainData(uint256 batchId, address caller) external view returns (bool)"
];

// Inventory Manager ABI - Based on actual WAGAInventoryManagerMVP.sol contract
const INVENTORY_MANAGER_ABI = [
  // Batch checking functions (actual contract functions)
  "function checkExpiredBatches(uint256[] calldata batchIds) external",
  "function checkLowInventory(uint256[] calldata batchIds) external", 
  "function checkBatchesNeedingVerification(uint256[] calldata batchIds) external",
  "function performPeriodicChecks(uint256[] calldata batchIds) external",
  
  // Status functions (actual contract functions)
  "function getBatchStatus(uint256 batchId) external view returns (bool isExpired, bool isLowInventory, bool needsVerif)",
  "function needsVerification(uint256 batchId) external view returns (bool)",
  "function getActiveBatches() external pure returns (uint256[] memory)",
  
  // Configuration functions (actual contract functions)
  "function setLowInventoryThreshold(uint256 newThreshold) external",
  "function setVerificationInterval(uint256 newInterval) external", 
  "function setMaxBatchesPerCheck(uint256 newMaxBatches) external",
  
  // View functions (actual contract functions)
  "function lowInventoryThreshold() external view returns (uint256)",
  "function verificationInterval() external view returns (uint256)",
  "function maxBatchesPerCheck() external view returns (uint256)",
  "function lastVerificationTime(uint256) external view returns (uint256)",
  
  // Events (actual contract events)
  "event BatchExpired(uint256 indexed batchId, uint256 expiryDate)",
  "event LowInventoryWarning(uint256 indexed batchId, uint256 currentQuantity)",
  "event VerificationRequested(uint256 indexed batchId, bytes32 requestId)",
  "event ThresholdUpdated(string thresholdType, uint256 oldValue, uint256 newValue)",
  "event BatchProcessed(uint256 indexed batchId, string checkType)"
];

// Treasury ABI - Based on actual WAGATreasury.sol contract
const TREASURY_ABI = [
  // Payment functions (actual contract functions)
  "function payForBatch(uint256 batchId, uint256 amount) external",
  "function processCoinbasePayment(address user, uint256 batchId, uint256 amount, string memory chargeId) external",
  "function setBatchPayment(uint256 batchId, uint256 amount) external",
  
  // Distribution functions (actual contract functions)
  "function distributeFunds(address recipient, uint256 amount, string calldata reason) external",
  "function distributeFundsDetailed(uint256 batchId, address seller, uint256 sellerShare, address processor, uint256 processorShare) external",
  "function transferToOfframpPartner(uint256 batchId, address buyer, address offrampPartner, uint256 usdAmount) external",
  
  // View functions (actual contract functions)
  "function getTreasuryStats() external view returns (uint256 totalCollected, uint256 totalDistributed, uint256 currentBalance)",
  "function getBatchPaymentInfo(uint256 batchId) external view returns (uint256 required, uint256 collected)",
  "function checkPaymentStatus(address user, uint256 batchId) external view returns (bool)",
  "function hasOfframpTransferExecuted(uint256 batchId, address buyer) external view returns (bool)",
  "function getOfframpTransferDetails(uint256 batchId, address buyer) external view returns (address offrampPartner, uint256 usdAmount, bool executed)",
  
  // Admin functions (actual contract functions)
  "function setUSDCAddress(address newUSDCAddress) external",
  "function setCoffeeToken(address _coffeeToken) external",
  "function emergencyWithdraw(address token, uint256 amount) external",
  
  // Events (actual contract events)
  "event PaymentReceived(address indexed user, uint256 indexed batchId, uint256 amount, uint256 timestamp)",
  "event CoinbasePaymentProcessed(address indexed user, uint256 indexed batchId, string chargeId)",
  "event PaymentDistributed(address indexed recipient, uint256 amount, string reason)",
  "event FundsDistributed(uint256 indexed batchId, address indexed seller, uint256 sellerShare, address indexed processor, uint256 processorShare)",
  "event OfframpTransferExecuted(uint256 indexed batchId, address indexed buyer, address indexed offrampPartner, uint256 usdAmount, uint256 timestamp)",
  "event BatchPaymentRequired(uint256 indexed batchId, uint256 amount)",
  "event USDCAddressUpdated(address indexed oldAddress, address indexed newAddress)"
];

// CDP Integration ABI - Based on actual WAGACDPIntegration.sol contract
const CDP_INTEGRATION_ABI = [
  // Smart Account Management (actual contract functions)
  "function createSmartAccount(address user) external returns (address smartAccount)",
  "function getUserSmartAccount(address user) external view returns (address)",
  
  // Payment Processing (actual contract functions)
  "function initiateCDPPayment(address user, uint256 batchId, uint256 amount, string calldata chargeId) external",
  "function confirmCDPPayment(string calldata chargeId, bool success) external",
  "function processCDPWebhook(bytes32 webhookId, string calldata chargeId, bool success) external",
  "function processCrossBorderPayment(address user, uint256 batchId, uint256 amount, string calldata chargeId, string calldata sourceCountry, string calldata targetCountry) external",
  
  // Configuration (actual contract functions)
  "function setCoffeeToken(address _coffeeToken) external",
  "function updateCDPConfig(address _cdpSmartAccountFactory, address _cdpPaymaster) external",
  
  // View functions (actual contract functions)
  "function getCDPPayment(string calldata chargeId) external view returns (tuple(address user, uint256 batchId, uint256 amount, string chargeId, uint256 timestamp, uint8 status))",
  
  // Emergency functions (actual contract functions)
  "function emergencyPause() external",
  "function emergencyUnpause() external",
  
  // Events (actual contract events)
  "event SmartAccountCreated(address indexed user, address indexed smartAccount)"
];

// Access Control ABI - for role and permission management
// Config Manager ABI - Unified access control and system configuration
const CONFIG_MANAGER_ABI = [
  // Role management functions
  "function grantRole(bytes32 role, address account) external",
  "function revokeRole(bytes32 role, address account) external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function canCreateBatches(address account) external view returns (bool)",
  "function getUserAccessLevel(address account) external view returns (string)",
  
  // Seller registration functions
  "function registerSeller(uint64 sellerId, address sellerAddress, string calldata sellerName, string calldata contactInfo) external",
  "function updateSellerContact(uint64 sellerId, string calldata newContactInfo) external",
  "function deactivateSeller(uint64 sellerId) external",
  "function getSellerProfile(uint64 sellerId) external view returns (address sellerAddress, string memory sellerName, string memory contactInfo, bool isActive, uint256 registrationTimestamp)",
  "function getSellerAddress(uint64 sellerId) external view returns (address)",
  "function getSellerId(address sellerAddress) external view returns (uint64)",
  "function isRegisteredSeller(address account) external view returns (bool)",
  
  // System configuration functions
  "function setInventoryManager(address newInventoryManager) external",
  "function setRedemptionContract(address newRedemptionContract) external",
  "function setProofOfReserveManager(address newProofOfReserveManager) external",
  "function getInventoryManager() external view returns (address)",
  "function getRedemptionContract() external view returns (address)",
  "function getProofOfReserveManager() external view returns (address)",
  
  // Role constants
  "function ADMIN_ROLE() external view returns (bytes32)",
  "function INVENTORY_MANAGER_ROLE() external view returns (bytes32)",
  "function REDEMPTION_ROLE() external view returns (bytes32)",
  "function PROOF_OF_RESERVE_ROLE() external view returns (bytes32)",
  "function MINTER_ROLE() external view returns (bytes32)",
  "function VERIFIER_ROLE() external view returns (bytes32)",
  "function FULFILLER_ROLE() external view returns (bytes32)",
  "function PROCESSOR_ROLE() external view returns (bytes32)",
  "function DISTRIBUTOR_ROLE() external view returns (bytes32)",
  "function BATCH_CREATOR_ROLE() external view returns (bytes32)",
  "function COOPERATIVE_ROLE() external view returns (bytes32)",
  "function ROASTER_ROLE() external view returns (bytes32)",
  "function ZK_ADMIN_ROLE() external view returns (bytes32)",
  "function PRIVACY_ADMIN_ROLE() external view returns (bytes32)",
  "function COMPLIANCE_MANAGER_ROLE() external view returns (bytes32)",
  "function ORIGIN_VERIFIER_ROLE() external view returns (bytes32)",
  "function QUALITY_INSPECTOR_ROLE() external view returns (bytes32)",
  "function BANKING_PARTNER_ROLE() external view returns (bytes32)",
  
  // Events
  "event SellerRegistered(uint64 indexed sellerId, address indexed sellerAddress, string sellerName)",
  "event SellerContactUpdated(uint64 indexed sellerId, string newContactInfo)",
  "event SellerDeactivated(uint64 indexed sellerId)",
  "event InventoryManagerSet(address indexed oldManager, address indexed newManager)",
  "event RedemptionContractSet(address indexed oldContract, address indexed newContract)",
  "event ProofOfReserveManagerSet(address indexed oldManager, address indexed newManager)"
];

// Ethiopian Compliance Core ABI - for Ethiopian export compliance
const ETHIOPIAN_COMPLIANCE_ABI = [
  // ECTA Permit functions
  "function addECTAPermit(uint256 batchId, tuple(string permitNumber, string exporterName, string exporterLicense, uint256 issueDate, uint256 expiryDate, bool isValid, string permitDocumentHash) permit) external",
  "function getECTAPermit(uint256 batchId) external view returns (tuple(string permitNumber, string exporterName, string exporterLicense, uint256 issueDate, uint256 expiryDate, bool isValid, string permitDocumentHash))",
  
  // Quality Certificate functions
  "function addQualityCertificate(uint256 batchId, tuple(string certificateNumber, string gradingResult, uint256 moistureContent, uint256 screenSize, bool scaeCompliant, uint256 issueDate, string certificateHash, string inspectorId) certificate) external",
  "function getQualityCertificate(uint256 batchId) external view returns (tuple(string certificateNumber, string gradingResult, uint256 moistureContent, uint256 screenSize, bool scaeCompliant, uint256 issueDate, string certificateHash, string inspectorId))",
  
  // Origin Verification functions
  "function addOriginVerification(uint256 batchId, tuple(string region, string woreda, string kebele, string cooperativeName, string cooperativeLicense, bool verified, uint256 verificationDate, string verificationDocumentHash) origin) external",
  "function getOriginVerification(uint256 batchId) external view returns (tuple(string region, string woreda, string kebele, string cooperativeName, string cooperativeLicense, bool verified, uint256 verificationDate, string verificationDocumentHash))",
  
  // EUDR Compliance functions
  "function addEUDRCertificate(uint256 batchId, tuple(string certificateId, string issuer, uint256 issueDate, uint256 expiryDate, bool isValid, string geoDataHash, string complianceLevel, string deforestationRisk) certificate) external",
  "function addGeolocationData(uint256 batchId, tuple(string plotType, string coordinates, uint256 plotSize, string verificationMethod) geoData) external",
  "function validateEUDRCompliance(uint256 batchId) external view returns (bool isCompliant)",
  
  // Banking and BoE functions
  "function addBankingPartner(address bankAddress, string memory bankName) external",
  "function removeBankingPartner(address bankAddress) external",
  "function isAuthorizedBank(address bankAddress) external view returns (bool isAuthorized)",
  "function registerTradeWithBoE(uint256 batchId, address buyer, address seller, uint256 quantity, uint256 valueUSD, string memory buyerBankDetails) external",
  "function confirmFiatTransfer(uint256 batchId, address buyer, string memory bankTransactionId) external",
  
  // SWIFT Banking functions
  "function registerBankingPartner(bytes11 swiftCode, address bankAddress, string memory bankName, tuple(bytes11 swiftCode, string bankName, bool canActAsOfframp, bool canHandleForexSurrender, uint8 partnerType, bytes11 connectedBankSwift, uint256 maxTransactionAmount, bool isActive) capabilities) external",
  "function getBankingCapabilities(bytes11 swiftCode) external view returns (tuple(bytes11 swiftCode, string bankName, bool canActAsOfframp, bool canHandleForexSurrender, uint8 partnerType, bytes11 connectedBankSwift, uint256 maxTransactionAmount, bool isActive))",
  "function getBankingPartner(address partner) external view returns (bytes11 swiftCode, string memory bankName, bool canOfframp)",
  "function assignOfframpPartner(uint256 batchId) external returns (bytes11 offrampSwift, uint8 partnerType)",
  
  // Multi-stage transfer functions
  "function confirmFiatTransferStage(uint256 batchId, address buyer, uint8 stage, string memory transactionId) external",
  "function confirmSellerPayment(uint256 batchId, address buyer, uint256 usdAmountReceived, string memory sellerTransactionId) external",
  "function recordOfframpTransferInitiated(uint256 batchId, address buyer, bytes11 offrampSwift, uint256 usdAmount) external",
  
  // Compliance status functions
  "function validateUpstreamCompliance(uint256 batchId) external view returns (bool isCompliant)",
  "function getComplianceStatus(uint256 batchId) external view returns (bool hasECTA, bool hasQuality, bool hasOrigin, bool isFullyCompliant)",
  
  // Utility functions
  "function convertUSDToETB(uint256 usdAmount) external view returns (uint256 etbAmount)",
  "function resolveBankAddress(bytes11 swiftCode) external view returns (address bankAddress)",
  "function resolveSwiftCode(address bankAddress) external view returns (bytes11 swiftCode)",
  
  // Events
  "event ECTAPermitAdded(uint256 indexed batchId, string permitNumber)",
  "event QualityCertificateAdded(uint256 indexed batchId, string certificateNumber)",
  "event OriginVerified(uint256 indexed batchId, string region, string cooperativeName)",
  "event TradeRegisteredWithBoE(uint256 indexed batchId, address indexed buyer, uint256 tradeId)",
  "event FiatTransferCompleted(uint256 indexed batchId, address indexed buyer, string bankTransactionId)",
  "event BankingPartnerAdded(address indexed bankAddress, string bankName)",
  "event EUDRCertificateAdded(uint256 indexed batchId, string certificateId, string issuer)",
  "event BankingPartnerRegistered(bytes11 indexed swiftCode, address indexed bankAddress, string bankName)"
];

// Banking Core ABI - for core banking infrastructure
const BANKING_CORE_ABI = [
  // SWIFT Banking functions
  "function registerBankingPartner(bytes11 swiftCode, address bankAddress, string memory bankName, tuple(bytes11 swiftCode, string bankName, bool canActAsOfframp, bool canHandleForexSurrender, uint8 partnerType, bytes11 connectedBankSwift, uint256 maxTransactionAmount, bool isActive) capabilities) external",
  "function getBankingCapabilities(bytes11 swiftCode) external view returns (tuple(bytes11 swiftCode, string bankName, bool canActAsOfframp, bool canHandleForexSurrender, uint8 partnerType, bytes11 connectedBankSwift, uint256 maxTransactionAmount, bool isActive))",
  "function getBankingPartner(address partner) external view returns (bytes11 swiftCode, string memory bankName, bool canOfframp)",
  "function assignOfframpPartner(uint256 batchId) external returns (bytes11 offrampSwift, uint8 partnerType)",
  
  // Banking integration functions
  "function addBankingPartner(address bankAddress, string memory bankName) external",
  "function removeBankingPartner(address bankAddress) external",
  "function isAuthorizedBank(address bankAddress) external view returns (bool isAuthorized)",
  
  // Exchange rate functions
  "function convertUSDToETB(uint256 usdAmount) external view returns (uint256 etbAmount)",
  "function updateUSDToETBRate(uint256 newRate) external",
  "function getUSDToETBRate() external view returns (uint256 rate)",
  
  // Utility functions
  "function getRegisteredBankingPartnersCount() external view returns (uint256 count)",
  "function resolveBankAddress(bytes11 swiftCode) external view returns (address bankAddress)",
  "function resolveSwiftCode(address bankAddress) external view returns (bytes11 swiftCode)",
  
  // SWIFT validation functions
  "function addSupportedCountryCode(bytes2 countryCode) external",
  "function removeSupportedCountryCode(bytes2 countryCode) external",
  "function addRecognizedBankCode(bytes4 bankCode) external",
  "function removeRecognizedBankCode(bytes4 bankCode) external",
  "function validateAndCacheSWIFTCode(bytes11 swiftCode) external",
  "function isCountryCodeSupported(bytes2 countryCode) external view returns (bool isSupported)",
  "function isBankCodeRecognized(bytes4 bankCode) external view returns (bool isRecognized)",
  "function isSWIFTCodeValidated(bytes11 swiftCode) external view returns (bool isValidated)",
  "function extractCountryCode(bytes11 swiftCode) external pure returns (bytes2 countryCode)",
  "function extractBankCode(bytes11 swiftCode) external pure returns (bytes4 bankCode)"
];

// Additional Verifier ABIs for ZK circuits
const PRICE_PRIVACY_VERIFIER_ABI = [
  "function verifyProof(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[3] memory input) external view returns (bool)",
  "function verifyProofWithOutputs(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[] memory input) external view returns (bool)"
];

const QUALITY_TIER_VERIFIER_ABI = [
  "function verifyProof(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[3] memory input) external view returns (bool)",
  "function verifyQualityTierProof(uint256[8] memory proof, uint256[3] memory publicSignals) external view returns (bool)"
];

const SUPPLY_CHAIN_VERIFIER_ABI = [
  "function verifyProof(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[3] memory input) external view returns (bool)",
  "function verifySupplyChainProof(uint256[8] memory proof, uint256[4] memory publicSignals) external view returns (bool)"
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
 * Complete blockchain-first workflow orchestrator with ZK privacy integration
 */
export async function createBatchBlockchainFirst(batchData: BatchCreationData | ExtendedBatchCreationData, zkConfig?: {
  enablePricePrivacy?: boolean;
  enableQualityPrivacy?: boolean;
  enableSupplyChainPrivacy?: boolean;
  enableEUDRCompliance?: boolean;
  enableEthiopianCompliance?: boolean;
  pricingClaim?: string;
  qualityClaim?: string;
  supplyChainClaim?: string;
}): Promise<{
  batchId: string;
  ipfsUri: string;
  metadataHash: string;
  transactionHash: string;
  qrCodeDataUrl: string;
  verificationQR: string;
  zkResults?: {
    privacyConfigured: boolean;
    proofsGenerated: string[];
    privacyTransactionHash?: string;
  };
}> {
  try {
    console.log('🚀 Starting blockchain-first batch creation workflow...');
    const hasZKConfig = zkConfig && (zkConfig.enablePricePrivacy || zkConfig.enableQualityPrivacy || zkConfig.enableSupplyChainPrivacy);

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

    console.log(`✅ Batch ${batchId} created on blockchain with transaction: ${createTxHash}`);

    // Step 2: Generate standardized metadata with batchId and privacy info
    console.log('📝 Generating metadata with batch ID...');
    const metadata = generateCoffeeMetadata(batchData);

    // Update metadata with the actual batch ID, product type info, and privacy features
    const updatedMetadata = {
      ...metadata,
      name: `${metadata.name} - Batch #${batchId}`,
      properties: {
        ...metadata.properties,
        batchId: batchId,
        blockchainId: batchId,
        hasPrivacyFeatures: !!hasZKConfig,
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
        }),
        // Add ZK configuration info
        ...(hasZKConfig && {
          privacyEnabled: true,
          pricePrivate: zkConfig.enablePricePrivacy || false,
          qualityPrivate: zkConfig.enableQualityPrivacy || false,
          supplyChainPrivate: zkConfig.enableSupplyChainPrivacy || false,
          pricingClaim: zkConfig.pricingClaim || 'Standard Pricing',
          qualityClaim: zkConfig.qualityClaim || 'Quality Verified',
          supplyChainClaim: zkConfig.supplyChainClaim || 'Origin Verified'
        })
      }
    };

    // Step 3: Upload metadata to IPFS with batch ID
    console.log('📤 Uploading metadata to IPFS...');
    const { uri: ipfsUri, metadataHash } = await uploadMetadataToIPFS(updatedMetadata);

    // Step 4: Update blockchain with IPFS data
    const { transactionHash: updateTxHash } = await updateBatchWithIPFS(batchId, ipfsUri, metadataHash);

    // Step 5: ZK Privacy Configuration (if requested)
    let zkResults: any = undefined;
    if (hasZKConfig) {
      console.log('🔐 Configuring privacy features...');
      try {
        zkResults = await configurePrivacyAndZKProofs(batchId, zkConfig);
        console.log(`✅ Privacy configuration completed for batch ${batchId}`);
      } catch (zkError) {
        console.warn('❌ Privacy configuration failed (non-blocking):', zkError);
        zkResults = {
          privacyConfigured: false,
          proofsGenerated: [],
          error: zkError instanceof Error ? zkError.message : 'Unknown ZK error'
        };
      }
    }

    // Step 6: Generate QR codes
    console.log('🔍 Generating QR codes...');
    const qrCodeDataUrl = await generateBatchQRCode(batchId, updatedMetadata, ipfsUri);
    const verificationQR = await generateSimpleVerificationQR(batchId);

    // Step 7: Enhanced database sync (preserves blockchain-first integrity)
    console.log('💾 Database sync status: initiating...');
    try {
      const { syncBatchToDatabase } = await import('./databaseSync');
      const syncResult = await syncBatchToDatabase({
        batchId,
        transactionHash: createTxHash,
        ipfsUri,
        metadataHash,
        batchData,
        zkConfig: hasZKConfig ? zkConfig : undefined,
        zkResults
      });
      
      if (syncResult.success) {
        console.log('💾 Database sync status: ✅ confirmed');
      } else {
        console.warn('💾 Database sync status: ❌ failed (non-blocking)', syncResult.error);
      }
    } catch (dbError) {
      console.warn('💾 Database sync status: ❌ failed (non-blocking)', dbError);
    }

    console.log('🎉 Blockchain-first batch creation completed successfully!');
    console.log(`   Batch ID: ${batchId}`);
    console.log(`   IPFS URI: ${ipfsUri}`);
    console.log(`   Privacy Features: ${hasZKConfig ? 'Enabled' : 'Disabled'}`);

    return {
      batchId,
      ipfsUri,
      metadataHash,
      transactionHash: updateTxHash, // Return the final transaction hash
      qrCodeDataUrl,
      verificationQR,
      ...(zkResults && { zkResults })
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
  batchRequestId: string = "0", // Default to 0 for inventory verification
  jsSource: string = `
    // WAGA Coffee verification - aligned with smart contract expectations
    const batchId = args[0];
    const batchQuantity = args[1];
    const requestQuantity = args[2];
    const expectedPrice = args[3];
    const expectedPackaging = args[4];
    const expectedMetadataHash = args[5];
    
    console.log('WAGA verification for batch:', batchId);
    console.log('Expected quantity:', batchQuantity);
    console.log('Requested quantity:', requestQuantity);
    
    try {
      // Primary verification: Check if batch exists in database
      const batchResponse = await Functions.makeHttpRequest({
        url: \`http://localhost:3001/api/batches/\${batchId}\`,
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (batchResponse.error) {
        throw new Error(\`Batch API Error: \${batchResponse.error}\`);
      }
      
      const batch = batchResponse.data;
      if (!batch || !batch.batchId) {
        throw new Error(\`Batch \${batchId} not found in database\`);
      }
      
      // Verify core batch data
      const verifiedQuantity = parseInt(batch.quantity) || 0;
      const verifiedPrice = Math.round(parseFloat(batch.pricePerUnit || batch.price) * 100); // Convert to cents
      const verifiedPackaging = batch.packagingInfo || batch.packaging || "";
      const verifiedMetadataHash = batch.metadataHash || "";
      
      // Validation checks
      if (verifiedQuantity < parseInt(requestQuantity)) {
        throw new Error(\`Insufficient inventory: verified=\${verifiedQuantity}, requested=\${requestQuantity}\`);
      }
      
      // Additional verification: Check inventory status
      try {
        const inventoryResponse = await Functions.makeHttpRequest({
          url: \`http://localhost:3001/api/waga/inventory/\${batchId}\`,
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (inventoryResponse.data && inventoryResponse.data.actualQuantity) {
          const actualInventory = parseInt(inventoryResponse.data.actualQuantity);
          if (actualInventory < verifiedQuantity) {
            console.warn(\`Inventory discrepancy: database=\${verifiedQuantity}, actual=\${actualInventory}\`);
          }
        }
      } catch (inventoryError) {
        console.warn('Inventory check failed:', inventoryError.message);
        // Continue with verification - inventory check is supplementary
      }
      
      console.log('Verification successful:', {
        verifiedQuantity,
        verifiedPrice,
        verifiedPackaging: verifiedPackaging.substring(0, 20),
        verifiedMetadataHash: verifiedMetadataHash.substring(0, 20)
      });
      
      // Return in format expected by smart contract: (uint256, uint256, string, string)
      return Functions.encodeUint256(verifiedQuantity) + 
             Functions.encodeUint256(verifiedPrice) + 
             Functions.encodeString(verifiedPackaging) + 
             Functions.encodeString(verifiedMetadataHash);
      
    } catch (error) {
      console.error('WAGA verification failed:', error.message);
      // Return zeros for failed verification
      return Functions.encodeUint256(0) + 
             Functions.encodeUint256(0) + 
             Functions.encodeString("") + 
             Functions.encodeString("");
    }
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
    
    console.log(`Requesting verification for batch ${batchId} with request ${batchRequestId}`);
    
    // Use inventory verification if no specific request ID provided
    let tx: any;
    if (batchRequestId === "0") {
      tx = await proofOfReserveContract.requestInventoryVerification(batchId, jsSource);
    } else {
      tx = await proofOfReserveContract.requestReserveVerification(batchId, batchRequestId, jsSource);
    }

    const receipt: any = await tx.wait();
    
    // Find the verification request event
    const verificationEvent: any = receipt.events?.find(
      (event: any) => event.event === "ReserveVerificationRequested"
    );

    if (!verificationEvent) {
      throw new Error("ReserveVerificationRequested event not found");
    }

    const chainlinkRequestId: string = verificationEvent.args.requestId;
    console.log('Verification request submitted:', chainlinkRequestId);

    return chainlinkRequestId;

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
  proofType: 'pricing' | 'quality' | 'supplyChain' | 'eudrDeforestation' | 'eudrGeolocation' | 'ectaPermit' | 'qualityCertificate' | 'originVerification' | 'boeForex',
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

/**
 * Configure privacy and generate ZK proofs for a batch
 * This function is called from the enhanced createBatchBlockchainFirst workflow
 */
async function configurePrivacyAndZKProofs(batchId: string, zkConfig: {
  enablePricePrivacy?: boolean;
  enableQualityPrivacy?: boolean;
  enableSupplyChainPrivacy?: boolean;
  enableEUDRCompliance?: boolean;
  enableEthiopianCompliance?: boolean;
  pricingClaim?: string;
  qualityClaim?: string;
  supplyChainClaim?: string;
}): Promise<{
  privacyConfigured: boolean;
  proofsGenerated: string[];
  privacyTransactionHash?: string;
}> {
  try {
    console.log(`🔐 Configuring privacy for batch ${batchId}...`);
    const proofsGenerated: string[] = [];
    
    // Step 1: Set up privacy configuration on blockchain
    const signer = await getSigner();
    const privacyLayerContract = getContract(PRIVACY_LAYER_ADDRESS, PRIVACY_LAYER_ABI, signer);
    
    // Create privacy config for the batch
    const privacyTx = await privacyLayerContract.createPrivacyConfig(
      batchId,
      await signer.getAddress()
    );
    
    console.log(`✅ Privacy config created for batch ${batchId}, transaction: ${privacyTx.hash}`);
    
    // Step 2: Generate ZK proofs for enabled privacy features
    const proofsToGenerate = [];
    
    // Map ZK config to proof types
    if (zkConfig.enablePricePrivacy) {
      proofsToGenerate.push({
        type: ProofType.PRICE_COMPETITIVENESS,
        claim: zkConfig.pricingClaim || 'Price Competitive',
        category: 'pricing'
      });
    }
    
    if (zkConfig.enableQualityPrivacy) {
      proofsToGenerate.push({
        type: ProofType.QUALITY_STANDARDS,
        claim: zkConfig.qualityClaim || 'Quality Verified',
        category: 'quality'
      });
    }
    
    if (zkConfig.enableSupplyChainPrivacy) {
      proofsToGenerate.push({
        type: ProofType.SUPPLY_CHAIN_PROVENANCE,
        claim: zkConfig.supplyChainClaim || 'Origin Verified',
        category: 'supplyChain'
      });
    }

    // EUDR Compliance proofs (always required for European markets)
    if (zkConfig.enableEUDRCompliance !== false) {
      proofsToGenerate.push(
        {
          type: ProofType.EUDR_DEFORESTATION_COMPLIANCE,
          claim: 'Deforestation-free production verified',
          category: 'eudrDeforestation'
        },
        {
          type: ProofType.EUDR_GEOLOCATION_VERIFICATION,
          claim: 'Geographic origin verified for EUDR compliance',
          category: 'eudrGeolocation'
        }
      );
    }

    // Ethiopian compliance proofs (required for Ethiopian coffee exports)
    if (zkConfig.enableEthiopianCompliance !== false) {
      proofsToGenerate.push(
        {
          type: ProofType.ECTA_PERMIT_VALIDITY,
          claim: 'ECTA export permit valid',
          category: 'ectaPermit'
        },
        {
          type: ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
          claim: 'Quality certificate authenticated',
          category: 'qualityCertificate'
        },
        {
          type: ProofType.ORIGIN_VERIFICATION_PROOF,
          claim: 'Ethiopian origin verified',
          category: 'originVerification'
        },
        {
          type: ProofType.BOE_FOREX_COMPLIANCE,
          claim: 'Bank of Ethiopia forex compliance verified',
          category: 'boeForex'
        }
      );
    }

    // Generate all required proofs
    const zkManagerContract = getContract(ZK_MANAGER_ADDRESS, ZK_MANAGER_ABI, signer);
    
    for (const proofConfig of proofsToGenerate) {
      console.log(`🔒 Generating ${ProofType[proofConfig.type]} proof...`);
      try {
        const proofHash = await generateZKProofHash(
          proofConfig.category as 'pricing' | 'quality' | 'supplyChain' | 'eudrDeforestation' | 'eudrGeolocation' | 'ectaPermit' | 'qualityCertificate' | 'originVerification' | 'boeForex',
          { batchId, claim: proofConfig.claim },
          { sensitiveData: `${proofConfig.category}_proof` }
        );
        
        // Store proof hash on blockchain using the proof type as index
        await zkManagerContract.storeProofHash(batchId, proofConfig.type, proofHash);
        
        proofsGenerated.push(`${ProofType[proofConfig.type]}: ${proofHash}`);
        console.log(`✅ ${ProofType[proofConfig.type]} proof generated: ${proofHash}`);
      } catch (error) {
        console.warn(`❌ ${ProofType[proofConfig.type]} proof generation failed:`, error);
      }
    }
    
    // Wait for privacy configuration transaction to be mined
    await privacyTx.wait();
    
    return {
      privacyConfigured: true,
      proofsGenerated,
      privacyTransactionHash: privacyTx.hash
    };
    
  } catch (error) {
    console.error('❌ Error configuring privacy and ZK proofs:', error);
    throw new Error(`Privacy configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                            ROLE MANAGEMENT                                 */
/* -------------------------------------------------------------------------- */

export async function grantUserRole(userAddress: string, roleName: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await getSigner();
    
    // Use the main coffee token contract which implements access control
    // Based on the deployment summary, the WAGACoffeeTokenCore implements the central authority pattern
    const coffeeTokenContract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);
    
    // Get the role hash
    let roleHash: string;
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        roleHash = await coffeeTokenContract.ADMIN_ROLE();
        break;
      case 'PROCESSOR':
        roleHash = await coffeeTokenContract.PROCESSOR_ROLE();
        break;
      case 'COOPERATIVE':
        roleHash = await coffeeTokenContract.COOPERATIVE_ROLE();
        break;
      case 'DISTRIBUTOR':
        roleHash = await coffeeTokenContract.DISTRIBUTOR_ROLE();
        break;
      case 'VERIFIER':
        roleHash = await coffeeTokenContract.VERIFIER_ROLE();
        break;
      case 'MINTER':
        roleHash = await coffeeTokenContract.MINTER_ROLE();
        break;
      case 'REDEMPTION':
        roleHash = await coffeeTokenContract.REDEMPTION_ROLE();
        break;
      case 'FULFILLER':
        roleHash = await coffeeTokenContract.FULFILLER_ROLE();
        break;
      default:
        throw new Error(`Unknown role: ${roleName}`);
    }

    // Check if current user has admin role
    const adminRole = await coffeeTokenContract.ADMIN_ROLE();
    const hasAdminRole = await coffeeTokenContract.hasRole(adminRole, await signer.getAddress());
    
    if (!hasAdminRole) {
      throw new Error('Only admins can grant roles');
    }

    // Grant the role
    const tx = await coffeeTokenContract.grantRole(roleHash, userAddress);
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
    
    // Use the main coffee token contract which implements access control
    const coffeeTokenContract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);
    
    // Get the role hash
    let roleHash: string;
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        roleHash = await coffeeTokenContract.ADMIN_ROLE();
        break;
      case 'PROCESSOR':
        roleHash = await coffeeTokenContract.PROCESSOR_ROLE();
        break;
      case 'COOPERATIVE':
        roleHash = await coffeeTokenContract.COOPERATIVE_ROLE();
        break;
      case 'DISTRIBUTOR':
        roleHash = await coffeeTokenContract.DISTRIBUTOR_ROLE();
        break;
      case 'VERIFIER':
        roleHash = await coffeeTokenContract.VERIFIER_ROLE();
        break;
      case 'MINTER':
        roleHash = await coffeeTokenContract.MINTER_ROLE();
        break;
      case 'REDEMPTION':
        roleHash = await coffeeTokenContract.REDEMPTION_ROLE();
        break;
      case 'FULFILLER':
        roleHash = await coffeeTokenContract.FULFILLER_ROLE();
        break;
      default:
        throw new Error(`Unknown role: ${roleName}`);
    }

    // Check if current user has admin role
    const adminRole = await coffeeTokenContract.ADMIN_ROLE();
    const hasAdminRole = await coffeeTokenContract.hasRole(adminRole, await signer.getAddress());
    
    if (!hasAdminRole) {
      throw new Error('Only admins can revoke roles');
    }

    // Revoke the role
    const tx = await coffeeTokenContract.revokeRole(roleHash, userAddress);
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
    const coffeeTokenContract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, provider);
    
    // Get the role hash
    let roleHash: string;
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        roleHash = await coffeeTokenContract.ADMIN_ROLE();
        break;
      case 'PROCESSOR':
        roleHash = await coffeeTokenContract.PROCESSOR_ROLE();
        break;
      case 'COOPERATIVE':
        roleHash = await coffeeTokenContract.COOPERATIVE_ROLE();
        break;
      case 'DISTRIBUTOR':
        roleHash = await coffeeTokenContract.DISTRIBUTOR_ROLE();
        break;
      case 'VERIFIER':
        roleHash = await coffeeTokenContract.VERIFIER_ROLE();
        break;
      case 'MINTER':
        roleHash = await coffeeTokenContract.MINTER_ROLE();
        break;
      case 'REDEMPTION':
        roleHash = await coffeeTokenContract.REDEMPTION_ROLE();
        break;
      case 'FULFILLER':
        roleHash = await coffeeTokenContract.FULFILLER_ROLE();
        break;
      default:
        return false;
    }

    return await coffeeTokenContract.hasRole(roleHash, userAddress);

  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

export async function getUserAccessLevel(userAddress: string): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const coffeeTokenContract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, provider);
    
    return await coffeeTokenContract.getUserAccessLevel(userAddress);

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

// ===========================
// NEW CONTRACT HELPER FUNCTIONS
// ===========================

// ===========================
// CONFIG MANAGER FUNCTIONS
// ===========================

/**
 * Register a new seller in the system
 */
export async function registerSeller(
  sellerId: string,
  sellerAddress: string,
  sellerName: string,
  contactInfo: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`📝 Registering seller ${sellerName} with ID ${sellerId}...`);
    
    const signer = await getSigner();
    const configManagerContract = getContract(CONFIG_MANAGER_ADDRESS, CONFIG_MANAGER_ABI, signer);
    
    const tx = await configManagerContract.registerSeller(
      sellerId,
      sellerAddress,
      sellerName,
      contactInfo
    );
    
    console.log(`✅ Seller registration submitted: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error registering seller:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get seller profile information
 */
export async function getSellerProfile(sellerId: string): Promise<{
  sellerAddress: string;
  sellerName: string;
  contactInfo: string;
  isActive: boolean;
  registrationTimestamp: number;
} | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const configManagerContract = new ethers.Contract(CONFIG_MANAGER_ADDRESS, CONFIG_MANAGER_ABI, provider);
    
    const profile = await configManagerContract.getSellerProfile(sellerId);
    
    return {
      sellerAddress: profile[0],
      sellerName: profile[1],
      contactInfo: profile[2],
      isActive: profile[3],
      registrationTimestamp: Number(profile[4])
    };
    
  } catch (error) {
    console.error('Error getting seller profile:', error);
    return null;
  }
}

/**
 * Check if an address is a registered seller
 */
export async function isRegisteredSeller(address: string): Promise<boolean> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const configManagerContract = new ethers.Contract(CONFIG_MANAGER_ADDRESS, CONFIG_MANAGER_ABI, provider);
    
    return await configManagerContract.isRegisteredSeller(address);
    
  } catch (error) {
    console.error('Error checking seller registration:', error);
    return false;
  }
}

// ===========================
// ETHIOPIAN COMPLIANCE FUNCTIONS
// ===========================

/**
 * Add ECTA permit for a batch
 */
export async function addECTAPermit(
  batchId: string,
  permit: {
    permitNumber: string;
    exporterName: string;
    exporterLicense: string;
    issueDate: number;
    expiryDate: number;
    isValid: boolean;
    permitDocumentHash: string;
  }
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`📜 Adding ECTA permit for batch ${batchId}...`);
    
    const signer = await getSigner();
    const complianceContract = getContract(ETHIOPIAN_COMPLIANCE_CORE_ADDRESS, ETHIOPIAN_COMPLIANCE_ABI, signer);
    
    const tx = await complianceContract.addECTAPermit(batchId, permit);
    
    console.log(`✅ ECTA permit added: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error adding ECTA permit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get compliance status for a batch
 */
export async function getComplianceStatus(batchId: string): Promise<{
  hasECTA: boolean;
  hasQuality: boolean;
  hasOrigin: boolean;
  isFullyCompliant: boolean;
} | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const complianceContract = new ethers.Contract(ETHIOPIAN_COMPLIANCE_CORE_ADDRESS, ETHIOPIAN_COMPLIANCE_ABI, provider);
    
    const status = await complianceContract.getComplianceStatus(batchId);
    
    return {
      hasECTA: status[0],
      hasQuality: status[1],
      hasOrigin: status[2],
      isFullyCompliant: status[3]
    };
    
  } catch (error) {
    console.error('Error getting compliance status:', error);
    return null;
  }
}

/**
 * Add quality certificate for a batch
 */
export async function addQualityCertificate(
  batchId: string,
  certificate: {
    certificateNumber: string;
    gradingResult: string;
    moistureContent: number;
    screenSize: number;
    scaeCompliant: boolean;
    issueDate: number;
    certificateHash: string;
    inspectorId: string;
  }
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`🏆 Adding quality certificate for batch ${batchId}...`);
    
    const signer = await getSigner();
    const complianceContract = getContract(ETHIOPIAN_COMPLIANCE_CORE_ADDRESS, ETHIOPIAN_COMPLIANCE_ABI, signer);
    
    const tx = await complianceContract.addQualityCertificate(batchId, certificate);
    
    console.log(`✅ Quality certificate added: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error adding quality certificate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Add origin verification for a batch
 */
export async function addOriginVerification(
  batchId: string,
  origin: {
    region: string;
    woreda: string;
    kebele: string;
    cooperativeName: string;
    cooperativeLicense: string;
    verified: boolean;
    verificationDate: number;
    verificationDocumentHash: string;
  }
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`🌍 Adding origin verification for batch ${batchId}...`);
    
    const signer = await getSigner();
    const complianceContract = getContract(ETHIOPIAN_COMPLIANCE_CORE_ADDRESS, ETHIOPIAN_COMPLIANCE_ABI, signer);
    
    const tx = await complianceContract.addOriginVerification(batchId, origin);
    
    console.log(`✅ Origin verification added: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error adding origin verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ===========================
// BANKING CORE FUNCTIONS
// ===========================

/**
 * Get current USD to ETB exchange rate
 */
export async function getUSDToETBRate(): Promise<number | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const bankingContract = new ethers.Contract(BANKING_CORE_ADDRESS, BANKING_CORE_ABI, provider);
    
    const rate = await bankingContract.getUSDToETBRate();
    return Number(rate) / 1e6; // Assuming 6 decimal precision
    
  } catch (error) {
    console.error('Error getting USD to ETB rate:', error);
    return null;
  }
}

/**
 * Convert USD amount to ETB
 */
export async function convertUSDToETB(usdAmount: number): Promise<number | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const bankingContract = new ethers.Contract(BANKING_CORE_ADDRESS, BANKING_CORE_ABI, provider);
    
    const etbAmount = await bankingContract.convertUSDToETB(
      Math.floor(usdAmount * 1e6) // Convert to wei equivalent
    );
    
    return Number(etbAmount) / 1e6; // Convert back to decimal
    
  } catch (error) {
    console.error('Error converting USD to ETB:', error);
    return null;
  }
}

/**
 * Register a banking partner
 */
export async function registerBankingPartner(
  bankAddress: string,
  bankName: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`🏦 Registering banking partner ${bankName}...`);
    
    const signer = await getSigner();
    const bankingContract = getContract(BANKING_CORE_ADDRESS, BANKING_CORE_ABI, signer);
    
    const tx = await bankingContract.addBankingPartner(bankAddress, bankName);
    
    console.log(`✅ Banking partner registered: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error registering banking partner:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if an address is an authorized bank
 */
export async function isAuthorizedBank(bankAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const bankingContract = new ethers.Contract(BANKING_CORE_ADDRESS, BANKING_CORE_ABI, provider);
    
    return await bankingContract.isAuthorizedBank(bankAddress);
    
  } catch (error) {
    console.error('Error checking bank authorization:', error);
    return false;
  }
}

/**
 * Get banking capabilities for a SWIFT code
 */
export async function getBankingCapabilities(swiftCode: string): Promise<any | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const bankingContract = new ethers.Contract(BANKING_CORE_ADDRESS, BANKING_CORE_ABI, provider);
    
    return await bankingContract.getBankingCapabilities(swiftCode);
    
  } catch (error) {
    console.error('Error getting banking capabilities:', error);
    return null;
  }
}

/**
 * Get banking partner information
 */
export async function getBankingPartner(partnerAddress: string): Promise<{
  swiftCode: string;
  bankName: string;
  canOfframp: boolean;
} | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const bankingContract = new ethers.Contract(BANKING_CORE_ADDRESS, BANKING_CORE_ABI, provider);
    
    const result = await bankingContract.getBankingPartner(partnerAddress);
    return {
      swiftCode: result[0],
      bankName: result[1],
      canOfframp: result[2]
    };
    
  } catch (error) {
    console.error('Error getting banking partner:', error);
    return null;
  }
}

// ===========================
// ENHANCED CONTRACT GETTER FUNCTIONS
// ===========================

/**
 * Get comprehensive batch information from multiple contracts
 */
export async function getEnhancedBatchInfo(batchId: string): Promise<{
  coreInfo: any;
  additionalInfo: any;
  complianceStatus: any;
  privacyConfig: any;
} | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get core batch info
    const coffeeTokenContract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, provider);
    const coreInfo = await coffeeTokenContract.getBatchInfo(batchId);
    
    // Get additional info from views contract
    const viewsContract = new ethers.Contract(COFFEE_VIEWS_ADDRESS, COFFEE_VIEWS_ABI, provider);
    const additionalInfo = await viewsContract.getBatchAdditionalInfo(batchId);
    
    // Get compliance status
    const complianceContract = new ethers.Contract(ETHIOPIAN_COMPLIANCE_CORE_ADDRESS, ETHIOPIAN_COMPLIANCE_ABI, provider);
    const complianceStatus = await complianceContract.getComplianceStatus(batchId);
    
    // Get privacy configuration
    const privacyContract = new ethers.Contract(PRIVACY_LAYER_ADDRESS, PRIVACY_LAYER_ABI, provider);
    const privacyConfig = await privacyContract.batchPrivacyConfig(batchId);
    
    return {
      coreInfo,
      additionalInfo,
      complianceStatus: {
        hasECTA: complianceStatus[0],
        hasQuality: complianceStatus[1],
        hasOrigin: complianceStatus[2],
        isFullyCompliant: complianceStatus[3]
      },
      privacyConfig
    };
    
  } catch (error) {
    console.error('Error getting enhanced batch info:', error);
    return null;
  }
}

/**
 * Get contract addresses mapping
 */
export function getContractAddresses(): Record<string, string> {
  return {
    COFFEE_TOKEN: COFFEE_TOKEN_ADDRESS,
    COFFEE_VIEWS: COFFEE_VIEWS_ADDRESS,
    BATCH_OPERATIONS: BATCH_OPERATIONS_ADDRESS,
    PROOF_OF_RESERVE: PROOF_OF_RESERVE_ADDRESS,
    INVENTORY_MANAGER: INVENTORY_MANAGER_ADDRESS,
    REDEMPTION_CONTRACT: REDEMPTION_CONTRACT_ADDRESS,
    TREASURY: TREASURY_ADDRESS,
    CDP_INTEGRATION: CDP_INTEGRATION_ADDRESS,
    CONFIG_MANAGER: CONFIG_MANAGER_ADDRESS,
    ZK_MANAGER: ZK_MANAGER_ADDRESS,
    PRIVACY_LAYER: PRIVACY_LAYER_ADDRESS,
    CIRCOM_VERIFIER: CIRCOM_VERIFIER_ADDRESS,
    PRICE_PRIVACY_VERIFIER: PRICE_PRIVACY_VERIFIER_ADDRESS,
    QUALITY_TIER_VERIFIER: QUALITY_TIER_VERIFIER_ADDRESS,
    SUPPLY_CHAIN_VERIFIER: SUPPLY_CHAIN_VERIFIER_ADDRESS,
    ETHIOPIAN_COMPLIANCE_CORE: ETHIOPIAN_COMPLIANCE_CORE_ADDRESS,
    BANKING_CORE: BANKING_CORE_ADDRESS
  };
}

/**
 * Get all contract ABIs mapping
 */
export function getContractABIs(): Record<string, string[]> {
  return {
    COFFEE_TOKEN: COFFEE_TOKEN_ABI,
    COFFEE_VIEWS: COFFEE_VIEWS_ABI,
    BATCH_OPERATIONS: BATCH_MANAGER_ABI,
    PROOF_OF_RESERVE: PROOF_OF_RESERVE_ABI,
    INVENTORY_MANAGER: INVENTORY_MANAGER_ABI,
    REDEMPTION_CONTRACT: REDEMPTION_CONTRACT_ABI,
    TREASURY: TREASURY_ABI,
    CDP_INTEGRATION: CDP_INTEGRATION_ABI,
    CONFIG_MANAGER: CONFIG_MANAGER_ABI,
    ZK_MANAGER: ZK_MANAGER_ABI,
    PRIVACY_LAYER: PRIVACY_LAYER_ABI,
    CIRCOM_VERIFIER: CIRCOM_VERIFIER_ABI,
    PRICE_PRIVACY_VERIFIER: PRICE_PRIVACY_VERIFIER_ABI,
    QUALITY_TIER_VERIFIER: QUALITY_TIER_VERIFIER_ABI,
    SUPPLY_CHAIN_VERIFIER: SUPPLY_CHAIN_VERIFIER_ABI,
    ETHIOPIAN_COMPLIANCE: ETHIOPIAN_COMPLIANCE_ABI,
    BANKING_CORE: BANKING_CORE_ABI
  };
}

// ===========================
// TREASURY PAYMENT FUNCTIONS
// ===========================

/**
 * Set payment requirement for a batch
 */
export async function setBatchPayment(
  batchId: string,
  paymentAmount: number
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`💰 Setting payment requirement for batch ${batchId}: ${paymentAmount} USDC`);
    
    const signer = await getSigner();
    const treasuryContract = getContract(TREASURY_ADDRESS, TREASURY_ABI, signer);
    
    // Convert to 6 decimal USDC format
    const paymentAmountWei = Math.floor(paymentAmount * 1e6);
    
    const tx = await treasuryContract.setBatchPayment(batchId, paymentAmountWei);
    
    console.log(`✅ Payment requirement set: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error setting batch payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Pay for a batch (buyer pays the required amount)
 */
export async function payForBatch(
  batchId: string,
  paymentAmount: number
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`💳 Paying for batch ${batchId}: ${paymentAmount} USDC`);
    
    const signer = await getSigner();
    const treasuryContract = getContract(TREASURY_ADDRESS, TREASURY_ABI, signer);
    
    // Convert to 6 decimal USDC format
    const paymentAmountWei = Math.floor(paymentAmount * 1e6);
    
    const tx = await treasuryContract.payForBatch(batchId, paymentAmountWei);
    
    console.log(`✅ Payment completed: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error paying for batch:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Transfer payment to offramp partner (banking transfer)
 */
export async function transferToOfframpPartner(
  batchId: string,
  buyer: string,
  offrampPartner: string,
  amount: number
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`🏦 Transferring ${amount} USDC to offramp partner for batch ${batchId}`);
    
    const signer = await getSigner();
    const treasuryContract = getContract(TREASURY_ADDRESS, TREASURY_ABI, signer);
    
    // Convert to 6 decimal USDC format
    const amountWei = Math.floor(amount * 1e6);
    
    const tx = await treasuryContract.transferToOfframpPartner(
      batchId,
      buyer,
      offrampPartner,
      amountWei
    );
    
    console.log(`✅ Offramp transfer completed: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error transferring to offramp partner:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check payment status for a batch and buyer
 */
export async function checkPaymentStatus(
  buyer: string,
  batchId: string
): Promise<boolean> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, provider);
    
    return await treasuryContract.checkPaymentStatus(buyer, batchId);
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    return false;
  }
}

/**
 * Get batch payment requirement
 */
export async function getBatchPaymentAmount(batchId: string): Promise<number | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const treasuryContract = new ethers.Contract(TREASURY_ADDRESS, TREASURY_ABI, provider);
    
    const paymentAmountWei = await treasuryContract.getBatchPaymentAmount(batchId);
    return Number(paymentAmountWei) / 1e6; // Convert back to decimal USDC
    
  } catch (error) {
    console.error('Error getting batch payment amount:', error);
    return null;
  }
}

/**
 * Add EUDR certificate for a batch
 */
export async function addEUDRCertificate(
  batchId: string,
  certificate: {
    certificateId: string;
    issuer: string;
    issueDate: number;
    expiryDate: number;
    isValid: boolean;
    geoDataHash: string;
    complianceLevel: string;
    deforestationRisk: string;
  }
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    console.log(`🌍 Adding EUDR certificate for batch ${batchId}...`);
    
    const signer = await getSigner();
    const complianceContract = getContract(ETHIOPIAN_COMPLIANCE_CORE_ADDRESS, ETHIOPIAN_COMPLIANCE_ABI, signer);
    
    const tx = await complianceContract.addEUDRCertificate(batchId, certificate);
    
    console.log(`✅ EUDR certificate added: ${tx.hash}`);
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error adding EUDR certificate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate EUDR compliance for a batch
 */
export async function validateEUDRCompliance(batchId: string): Promise<boolean> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const complianceContract = new ethers.Contract(ETHIOPIAN_COMPLIANCE_CORE_ADDRESS, ETHIOPIAN_COMPLIANCE_ABI, provider);
    
    return await complianceContract.validateEUDRCompliance(batchId);
    
  } catch (error) {
    console.error('Error validating EUDR compliance:', error);
    return false;
  }
}

// ============================================================================
// BATCH REQUEST MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Interface for batch request data
 */
export interface BatchRequestData {
  batchId: string;
  requester: string;
  requestedQuantity: string;
  requestDetails: string;
  requestTimestamp: string;
  isFulfilled: boolean;
  fulfilledQuantity: string;
  fulfilledTimestamp: string;
  requestIndex: number;
}

/**
 * Create a new batch request (for distributors)
 */
export async function createBatchRequest(
  batchId: string,
  requestedQuantity: string,
  requestDetails: string
): Promise<{ success: boolean; requestIndex?: number; transactionHash?: string; error?: string }> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, signer);

    const quantityWei = ethers.parseUnits(requestedQuantity, 18);
    
    const tx = await contract.createBatchRequest(batchId, quantityWei, requestDetails);
    const receipt = await tx.wait();
    
    // Extract request index from events (assuming BatchRequestCreated event exists)
    const requestIndex = receipt.logs?.length ? receipt.logs.length - 1 : 0;
    
    return {
      success: true,
      requestIndex,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error creating batch request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a specific batch request
 */
export async function getBatchRequest(
  batchId: string,
  requestIndex: number
): Promise<BatchRequestData | null> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, provider);

    const result = await contract.getBatchRequest(batchId, requestIndex);
    
    return {
      batchId: result[0].toString(),
      requester: result[1],
      requestedQuantity: ethers.formatUnits(result[2], 18),
      requestDetails: result[3],
      requestTimestamp: result[4].toString(),
      isFulfilled: result[5],
      fulfilledQuantity: ethers.formatUnits(result[6], 18),
      fulfilledTimestamp: result[7].toString(),
      requestIndex
    };
    
  } catch (error) {
    console.error('Error getting batch request:', error);
    return null;
  }
}

/**
 * Get all batch requests for a specific batch
 */
export async function getAllBatchRequests(batchId: string): Promise<BatchRequestData[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, provider);

    // First get the request count
    const requestCount = await contract.getBatchRequestCount(batchId);
    const count = parseInt(requestCount.toString());
    
    const requests: BatchRequestData[] = [];
    
    // Fetch each request individually
    for (let i = 0; i < count; i++) {
      const request = await getBatchRequest(batchId, i);
      if (request) {
        requests.push(request);
      }
    }
    
    return requests;
    
  } catch (error) {
    console.error('Error getting all batch requests:', error);
    return [];
  }
}

/**
 * Get all pending batch requests across all batches (for admin review)
 */
export async function getAllPendingBatchRequests(): Promise<BatchRequestData[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(COFFEE_TOKEN_ADDRESS, COFFEE_TOKEN_ABI, provider);

    // Get all active batch IDs
    const batchIds = await contract.getActiveBatchIds();
    const allRequests: BatchRequestData[] = [];
    
    // For each batch, get all requests
    for (const batchId of batchIds) {
      const requests = await getAllBatchRequests(batchId.toString());
      // Filter for pending (unfulfilled) requests
      const pendingRequests = requests.filter(req => !req.isFulfilled);
      allRequests.push(...pendingRequests);
    }
    
    // Sort by timestamp (newest first)
    return allRequests.sort((a, b) => parseInt(b.requestTimestamp) - parseInt(a.requestTimestamp));
    
  } catch (error) {
    console.error('Error getting all pending batch requests:', error);
    return [];
  }
}

/**
 * Approve a batch request and trigger verification (for WAGA admins with VERIFIER_ROLE)
 */
export async function approveBatchRequest(
  batchId: string,
  requestIndex: number,
  chainlinkSource: string
): Promise<{ success: boolean; verificationRequestId?: string; transactionHash?: string; error?: string }> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const proofOfReserveContract = new ethers.Contract(PROOF_OF_RESERVE_ADDRESS, PROOF_OF_RESERVE_ABI, signer);

    const tx = await proofOfReserveContract.requestReserveVerification(batchId, requestIndex, chainlinkSource);
    const receipt = await tx.wait();
    
    // Extract verification request ID from events
    const verificationEvent = receipt.logs?.find((log: any) => {
      try {
        const parsedLog = proofOfReserveContract.interface.parseLog(log);
        return parsedLog?.name === 'ReserveVerificationRequested';
      } catch {
        return false;
      }
    });
    
    let verificationRequestId;
    if (verificationEvent) {
      const parsedLog = proofOfReserveContract.interface.parseLog(verificationEvent);
      verificationRequestId = parsedLog?.args[0]; // First argument is requestId
    }
    
    return {
      success: true,
      verificationRequestId,
      transactionHash: tx.hash
    };
    
  } catch (error) {
    console.error('Error approving batch request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
