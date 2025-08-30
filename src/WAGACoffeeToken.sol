// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {IZKVerifier} from "./ZKIntegration/Interfaces/IZKVerifier.sol";
import {IPrivacyLayer} from "./ZKIntegration/Interfaces/IPrivacyLayer.sol";
import {IComplianceVerifier} from "./ZKIntegration/Interfaces/IComplianceVerifier.sol";

/**
 * @title WAGACoffeeToken
 * @dev Enhanced ERC1155 token contract with maximum privacy features
 * @dev Supports ZK proofs, encrypted data storage, and selective transparency
 */
contract WAGACoffeeToken is
    ERC1155,
    ERC1155Supply,
    ERC1155URIStorage,
    AccessControl,
    ReentrancyGuard,
    ERC1155Holder,
    WAGAConfigManager
{
    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                   */
    /* -------------------------------------------------------------------------- */
    error WAGACoffeeToken__BatchDoesNotExist_createBatch();
    error WAGACoffeeToken__BatchAlreadyExists_createBatch();
    error WAGACoffeeToken__InvalidQuantity_createBatch();
    error WAGACoffeeToken__InvalidPrice_createBatch();
    error WAGACoffeeToken__AccessControlUnauthorizedAccount_createBatch();
    error WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
    error WAGACoffeeToken__BatchDoesNotExist_updateInventory();
    error WAGACoffeeToken__InvalidQuantity_updateInventory();
    error WAGACoffeeToken__BatchDoesNotExist_verifyBatchMetadata();
    error WAGACoffeeToken__MetadataMisMatch_verifyBatchMetadata();
    error WAGACoffeeToken__BatchDoesNotExist_updateBatchIPFS();
    error WAGACoffeeToken__BatchDoesNotExist_updateBatchIPFSWithZKProofs();
    error WAGACoffeeToken__ZKProofVerificationFailed_updateBatchIPFSWithZKProofs();
    error WAGACoffeeToken__InvalidZKProof_updateBatchIPFSWithZKProofs();
    error WAGACoffeeToken__BatchDoesNotExist_requestBatch();
    error WAGACoffeeToken__AccessControlUnauthorizedAccount_requestBatch();
    error WAGACoffeeToken__BatchDoesNotExist_getBatchInfoWithPrivacy();
    error WAGACoffeeToken__InvalidCaller_getBatchInfoWithPrivacy();
    error WAGACoffeeToken__EncryptionKeyNotFound_getEncryptedBatchData();
    error WAGACoffeeToken__ZKProofNotFound_getZKProof();
    error WAGACoffeeToken__InvalidPrivacyLevel_createBatch();
    error WAGACoffeeToken__InsufficientBatchQuantity_mintBatch();
    error WAGACoffeeToken__BatchQuantityExceeded_mintBatch();
    error WAGACoffeeToken__InventoryMismatch_updateInventory();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    // Optimized batch information with separate mappings for efficiency
    struct BatchInfo {
        uint256 productionDate;
        uint256 expiryDate;
        uint256 quantity;              // Total batch quantity (coffee bags)
        uint256 mintedQuantity;        // Total tokens minted for this batch
        uint256 pricePerUnit;
        uint256 lastVerifiedTimestamp;
    }

    // Bit-packed flags for boolean values (gas efficient)
    // Bit 0: isVerified
    // Bit 1: isMetadataVerified  
    // Bit 2: isActive
    // Bit 3-7: Reserved for future use

    // Batch request structure for distributors
    struct BatchRequest {
        uint256 batchId;
        address requester;
        uint256 requestedQuantity;  // Add requested quantity
        string requestDetails;
        uint256 requestTimestamp;
        bool isFulfilled;
        uint256 fulfilledQuantity;
        uint256 fulfilledTimestamp;
    }

    // ZK Proof structure for verification
    struct ZKProof {
        bytes32 proofHash;
        bytes proofData;
        uint256 proofTimestamp;
        address proofGenerator;
        bool isValid;
        string proofType; // "price", "quality", "supply_chain", "compliance"
    }

    // Encrypted data structure
    struct EncryptedData {
        bytes32 dataHash;
        bytes encryptedData;
        bytes32 encryptionKeyHash;
        uint256 encryptionTimestamp;
        address dataOwner;
        bool isAccessible;
    }

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Batch management
    mapping(uint256 => BatchInfo) public s_batchInfo;
    mapping(uint256 => bool) public s_batchExists;
    mapping(uint256 => bool) public s_batchActive;
    uint256 public s_batchCounter;

    // Separate mappings for extended batch data (gas efficient)
    mapping(uint256 => string) public batchPackagingInfo;
    mapping(uint256 => string) public batchMetadataHash;
    mapping(uint256 => bytes32) public batchZKProofHash;
    mapping(uint256 => bytes32) public batchEncryptedDataHash;
    mapping(uint256 => uint8) public batchFlags; // Bit-packed booleans

    // Batch requests from distributors
    mapping(uint256 => BatchRequest) public batchRequests;
    mapping(uint256 => uint256) public batchRequestCount;
    mapping(uint256 => mapping(uint256 => BatchRequest)) public batchRequestsByIndex;

    // ZK Proof management
    mapping(uint256 => ZKProof) public batchZKProofs;
    mapping(bytes32 => bool) public zkProofExists;

    // Encrypted data management
    mapping(uint256 => EncryptedData) public batchEncryptedData;
    mapping(bytes32 => bool) public encryptedDataExists;

    // Privacy configuration per batch
    mapping(uint256 => IPrivacyLayer.PrivacyConfig) public batchPrivacyConfig;

    // ZK Verification contracts
    IZKVerifier public zkVerifier;
    IPrivacyLayer public privacyLayer;
    IComplianceVerifier public complianceVerifier;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchCreated(
        uint256 indexed batchId,
        address indexed creator,
        uint256 quantity,
        uint256 pricePerUnit,
        IPrivacyLayer.PrivacyConfig privacyConfig
    );

    event BatchVerified(
        uint256 indexed batchId,
        address indexed verifier,
        uint256 verifiedQuantity
    );

    event BatchRequested(
        uint256 indexed batchId,
        address indexed requester,
        uint256 requestedQuantity,
        string requestDetails,
        uint256 requestId
    );

    event BatchFulfilled(
        uint256 indexed batchId,
        address indexed requester,
        uint256 fulfilledQuantity
    );

    event ZKProofAdded(
        uint256 indexed batchId,
        bytes32 indexed proofHash,
        string proofType,
        address indexed generator
    );

    event ZKProofVerified(
        uint256 indexed batchId,
        bytes32 indexed proofHash,
        bool isValid
    );

    event EncryptedDataStored(
        uint256 indexed batchId,
        bytes32 indexed dataHash,
        address indexed owner
    );

    event PrivacyConfigUpdated(
        uint256 indexed batchId,
        IPrivacyLayer.PrivacyConfig privacyConfig
    );

    event TokensMinted(
        uint256 indexed batchId,
        address indexed recipient,
        uint256 quantity,
        uint256 totalMintedForBatch
    );

    event InventoryVerified(
        uint256 indexed batchId,
        uint256 onChainTokens,
        uint256 offChainInventory,
        bool isSynchronized
    );

    /* -------------------------------------------------------------------------- */
    /*                                 Constructor                                */
    /* -------------------------------------------------------------------------- */

    constructor(
        string memory baseURI,
        address zkVerifierAddress,
        address privacyLayerAddress,
        address complianceVerifierAddress
    ) ERC1155(baseURI) {
        zkVerifier = IZKVerifier(zkVerifierAddress);
        privacyLayer = IPrivacyLayer(privacyLayerAddress);
        complianceVerifier = IComplianceVerifier(complianceVerifierAddress);

        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(INVENTORY_MANAGER_ROLE, msg.sender);
        _grantRole(ZK_ADMIN_ROLE, msg.sender);
        _grantRole(PRIVACY_ADMIN_ROLE, msg.sender);
        _grantRole(DATA_MANAGER_ROLE, msg.sender);
        _grantRole(COMPETITIVE_ADMIN_ROLE, msg.sender);
        _grantRole(MARKET_ANALYST_ROLE, msg.sender);
        _grantRole(PROCESSOR_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        
        // Note: ZK contract roles will be granted in initializeSystem()
        // after all contracts are deployed
    }

    /* -------------------------------------------------------------------------- */
    /*                              Batch Management                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Create a new coffee batch with maximum privacy features
     * @param productionDate Production date timestamp
     * @param expiryDate Expiry date timestamp
     * @param quantity Initial quantity
     * @param pricePerUnit Price per unit (can be hidden via ZK proofs)
     * @param packagingInfo Packaging information
     * @param metadataHash IPFS metadata hash
     * @param zkProofHash Hash of ZK proof for verification
     * @param encryptedDataHash Hash of encrypted sensitive data
     * @param privacyConfig Privacy configuration for selective transparency
     */
    function createBatch(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string calldata packagingInfo,
        string calldata metadataHash,
        bytes32 zkProofHash,
        bytes32 encryptedDataHash,
        IPrivacyLayer.PrivacyConfig calldata privacyConfig
    ) external {
        // Only admins and processors can create batches
        if (!hasRole(ADMIN_ROLE, msg.sender) && !hasRole(PROCESSOR_ROLE, msg.sender)) {
            revert WAGACoffeeToken__AccessControlUnauthorizedAccount_createBatch();
        }

        // Validate inputs
        if (quantity == 0) {
            revert WAGACoffeeToken__InvalidQuantity_createBatch();
        }
        if (pricePerUnit == 0) {
            revert WAGACoffeeToken__InvalidPrice_createBatch();
        }
        if (productionDate >= expiryDate) {
            revert WAGACoffeeToken__BatchDoesNotExist_createBatch();
        }

        // Generate batch ID
        uint256 batchId = ++s_batchCounter;

        // Check if batch already exists
        if (s_batchExists[batchId]) {
            revert WAGACoffeeToken__BatchAlreadyExists_createBatch();
        }

        // Validate privacy configuration
        if (!_validatePrivacyConfig(privacyConfig)) {
            revert WAGACoffeeToken__InvalidPrivacyLevel_createBatch();
        }

        // Store core batch information
        s_batchInfo[batchId] = BatchInfo({
            productionDate: productionDate,
            expiryDate: expiryDate,
            quantity: quantity,
            mintedQuantity: 0,  // Initialize minted quantity to 0
            pricePerUnit: pricePerUnit,
            lastVerifiedTimestamp: 0
        });

        // Store extended batch data in separate mappings
        batchPackagingInfo[batchId] = packagingInfo;
        batchMetadataHash[batchId] = metadataHash;
        batchZKProofHash[batchId] = zkProofHash;
        batchEncryptedDataHash[batchId] = encryptedDataHash;

        // Set initial flags (isActive = true, others = false)
        _setBatchFlag(batchId, 0, false); // isVerified
        _setBatchFlag(batchId, 1, false); // isMetadataVerified
        _setBatchFlag(batchId, 2, true);  // isActive

        // Store ZK proof if provided
        if (zkProofHash != bytes32(0)) {
            batchZKProofs[batchId] = ZKProof({
                proofHash: zkProofHash,
                proofData: "",
                proofTimestamp: block.timestamp,
                proofGenerator: msg.sender,
                isValid: false,
                proofType: ""
            });
            zkProofExists[zkProofHash] = true;
        }

        // Store encrypted data if provided
        if (encryptedDataHash != bytes32(0)) {
            batchEncryptedData[batchId] = EncryptedData({
                dataHash: encryptedDataHash,
                encryptedData: "",
                encryptionKeyHash: bytes32(0),
                encryptionTimestamp: block.timestamp,
                dataOwner: msg.sender,
                isAccessible: false
            });
            encryptedDataExists[encryptedDataHash] = true;
        }

        // Store privacy configuration
        batchPrivacyConfig[batchId] = privacyConfig;

        // Mark batch as existing and active
        s_batchExists[batchId] = true;
        s_batchActive[batchId] = true;

        emit BatchCreated(
            batchId,
            msg.sender,
            quantity,
            pricePerUnit,
            privacyConfig
        );
    }

    /**
     * @dev Request a batch with specific quantity (only distributors can request)
     * @param batchId Batch identifier
     * @param requestedQuantity Quantity requested from the batch
     * @param requestDetails Request details
     */
    function requestBatch(
        uint256 batchId,
        uint256 requestedQuantity,
        string calldata requestDetails
    ) external {
        // Only distributors can request batches
        if (!hasRole(DISTRIBUTOR_ROLE, msg.sender)) {
            revert WAGACoffeeToken__AccessControlUnauthorizedAccount_requestBatch();
        }

        // Check if batch exists
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_requestBatch();
        }

        // Check if batch is active
        if (!isBatchActive(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_requestBatch();
        }

        // Validate requested quantity
        if (requestedQuantity == 0) {
            revert WAGACoffeeToken__InvalidQuantity_createBatch();
        }

        // Check if requested quantity is available
        BatchInfo storage batchInfo = s_batchInfo[batchId];
        uint256 availableQuantity = batchInfo.quantity - batchInfo.mintedQuantity;
        
        // Calculate already requested but not yet fulfilled quantity
        uint256 alreadyRequested = 0;
        for (uint256 i = 0; i < batchRequestCount[batchId]; i++) {
            BatchRequest storage existingRequest = batchRequestsByIndex[batchId][i];
            if (!existingRequest.isFulfilled) {
                alreadyRequested += existingRequest.requestedQuantity;
            }
        }
        
        uint256 remainingQuantity = availableQuantity - alreadyRequested;
        if (requestedQuantity > remainingQuantity) {
            revert WAGACoffeeToken__InvalidQuantity_createBatch();
        }

        // Create batch request
        uint256 requestId = batchRequestCount[batchId]++;
        batchRequestsByIndex[batchId][requestId] = BatchRequest({
            batchId: batchId,
            requester: msg.sender,
            requestedQuantity: requestedQuantity,
            requestDetails: requestDetails,
            requestTimestamp: block.timestamp,
            isFulfilled: false,
            fulfilledQuantity: 0,
            fulfilledTimestamp: 0
        });

        batchRequests[requestId] = batchRequestsByIndex[batchId][requestId];

        emit BatchRequested(batchId, msg.sender, requestedQuantity, requestDetails, requestId);
    }

    /**
     * @dev Update batch IPFS metadata with ZK proofs for enhanced privacy
     * @param batchId Batch identifier
     * @param metadataHash New IPFS metadata hash
     * @param zkProofData ZK proof data for verification
     * @param proofType Type of ZK proof
     */
    function updateBatchIPFSWithZKProofs(
        uint256 batchId,
        string calldata metadataHash,
        bytes calldata zkProofData,
        string calldata proofType
    ) external {
        // Only admins and processors can update with ZK proofs
        if (!hasRole(ADMIN_ROLE, msg.sender) && !hasRole(PROCESSOR_ROLE, msg.sender)) {
            revert WAGACoffeeToken__AccessControlUnauthorizedAccount_createBatch();
        }

        // Check if batch exists
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchIPFSWithZKProofs();
        }

        // Verify ZK proof
        if (!zkVerifier.verifyProof(zkProofData, proofType)) {
            revert WAGACoffeeToken__ZKProofVerificationFailed_updateBatchIPFSWithZKProofs();
        }

        // Update batch metadata
        batchMetadataHash[batchId] = metadataHash;
        _setBatchFlag(batchId, 1, true); // isMetadataVerified

        // Update ZK proof
        bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, proofType, block.timestamp));
        batchZKProofs[batchId] = ZKProof({
            proofHash: proofHash,
            proofData: zkProofData,
            proofTimestamp: block.timestamp,
            proofGenerator: msg.sender,
            isValid: true,
            proofType: proofType
        });
        zkProofExists[proofHash] = true;

        emit ZKProofAdded(batchId, proofHash, proofType, msg.sender);
        emit ZKProofVerified(batchId, proofHash, true);
    }

    /**
     * @dev Store encrypted data for maximum privacy
     * @param batchId Batch identifier
     * @param encryptedData Encrypted sensitive data
     * @param encryptionKeyHash Hash of encryption key
     */
    function storeEncryptedBatchData(
        uint256 batchId,
        bytes calldata encryptedData,
        bytes32 encryptionKeyHash
    ) external {
        // Only admins and processors can store encrypted data
        if (!hasRole(ADMIN_ROLE, msg.sender) && !hasRole(PROCESSOR_ROLE, msg.sender)) {
            revert WAGACoffeeToken__AccessControlUnauthorizedAccount_createBatch();
        }

        // Check if batch exists
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchIPFSWithZKProofs();
        }

        // Store encrypted data
        bytes32 dataHash = keccak256(encryptedData);
        batchEncryptedData[batchId] = EncryptedData({
            dataHash: dataHash,
            encryptedData: encryptedData,
            encryptionKeyHash: encryptionKeyHash,
            encryptionTimestamp: block.timestamp,
            dataOwner: msg.sender,
            isAccessible: false
        });
        encryptedDataExists[dataHash] = true;

        // Update batch encrypted data hash
        batchEncryptedDataHash[batchId] = dataHash;

        emit EncryptedDataStored(batchId, dataHash, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                              View Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get batch information with role-based privacy filtering
     * @param batchId Batch identifier
     * @param caller Address of the caller for role-based access control
     */
    function getBatchInfoWithPrivacy(
        uint256 batchId,
        address caller
    ) external view returns (
        uint256 productionDate,
        uint256 expiryDate,
        bool isVerified,
        uint256 quantity,
        uint256 mintedQuantity,
        uint256 pricePerUnit,
        string memory packagingInfo,
        string memory metadataHash,
        bool isMetadataVerified,
        uint256 lastVerifiedTimestamp,
        IPrivacyLayer.PrivacyConfig memory privacyConfig
    ) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_getBatchInfoWithPrivacy();
        }

        BatchInfo storage info = s_batchInfo[batchId];
        bool isVerifiedFlag = _getBatchFlag(batchId, 0);
        bool isMetadataVerifiedFlag = _getBatchFlag(batchId, 1);
        
        // Determine what data to return based on caller's role
        if (hasRole(ADMIN_ROLE, caller) || hasRole(PROCESSOR_ROLE, caller)) {
            // Admins and Processors: Full access to all data
            return (
                info.productionDate,
                info.expiryDate,
                isVerifiedFlag,
                info.quantity,
                info.mintedQuantity,
                info.pricePerUnit,
                batchPackagingInfo[batchId],
                batchMetadataHash[batchId],
                isMetadataVerifiedFlag,
                info.lastVerifiedTimestamp,
                batchPrivacyConfig[batchId]
            );
        } else if (hasRole(DISTRIBUTOR_ROLE, caller)) {
            // Distributors: Price visible, quality/supply chain hidden but proven
            return (
                info.productionDate,
                info.expiryDate,
                isVerifiedFlag,
                info.quantity,
                info.mintedQuantity,
                info.pricePerUnit, // Price is visible to distributors
                batchPackagingInfo[batchId],
                batchMetadataHash[batchId],
                isMetadataVerifiedFlag,
                info.lastVerifiedTimestamp,
                batchPrivacyConfig[batchId]
            );
        } else {
            // Public: Basic info only, no price data
            return (
                info.productionDate,
                info.expiryDate,
                isVerifiedFlag,
                info.quantity,
                info.mintedQuantity,
                0, // Price hidden from public
                batchPackagingInfo[batchId],
                batchMetadataHash[batchId],
                isMetadataVerifiedFlag,
                info.lastVerifiedTimestamp,
                batchPrivacyConfig[batchId]
            );
        }
    }

    /**
     * @dev Get batch information with privacy (legacy function for backward compatibility)
     * @param batchId Batch identifier
     */
    function getBatchInfoWithPrivacy(
        uint256 batchId
    ) external view returns (
        uint256 productionDate,
        uint256 expiryDate,
        bool isVerified,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory packagingInfo,
        string memory metadataHash,
        bool isMetadataVerified,
        uint256 lastVerifiedTimestamp,
        IPrivacyLayer.PrivacyConfig memory privacyConfig
    ) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_getBatchInfoWithPrivacy();
        }

        BatchInfo storage info = s_batchInfo[batchId];
        return (
            info.productionDate,
            info.expiryDate,
            _getBatchFlag(batchId, 0), // isVerified
            info.quantity,
            info.pricePerUnit,
            batchPackagingInfo[batchId],
            batchMetadataHash[batchId],
            _getBatchFlag(batchId, 1), // isMetadataVerified
            info.lastVerifiedTimestamp,
            batchPrivacyConfig[batchId]
        );
    }

    /**
     * @dev Get ZK proof for a batch
     * @param batchId Batch identifier
     */
    function getZKProof(
        uint256 batchId
    ) external view returns (
        bytes32 proofHash,
        bytes memory proofData,
        uint256 proofTimestamp,
        address proofGenerator,
        bool isValid,
        string memory proofType
    ) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__ZKProofNotFound_getZKProof();
        }

        ZKProof storage proof = batchZKProofs[batchId];
        return (
            proof.proofHash,
            proof.proofData,
            proof.proofTimestamp,
            proof.proofGenerator,
            proof.isValid,
            proof.proofType
        );
    }

    /**
     * @dev Get encrypted data for a batch (only accessible to authorized users)
     * @param batchId Batch identifier
     * @param encryptionKey Encryption key for decryption
     */
    function getEncryptedBatchData(
        uint256 batchId,
        bytes32 encryptionKey
    ) external view returns (
        bytes32 dataHash,
        bytes memory encryptedData,
        bytes32 encryptionKeyHash,
        uint256 encryptionTimestamp,
        address dataOwner
    ) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__EncryptionKeyNotFound_getEncryptedBatchData();
        }

        EncryptedData storage data = batchEncryptedData[batchId];
        
        // Verify encryption key
        if (data.encryptionKeyHash != keccak256(abi.encodePacked(encryptionKey))) {
            revert WAGACoffeeToken__EncryptionKeyNotFound_getEncryptedBatchData();
        }

        return (
            data.dataHash,
            data.encryptedData,
            data.encryptionKeyHash,
            data.encryptionTimestamp,
            data.dataOwner
        );
    }

    /**
     * @dev Get batch request count
     * @param batchId Batch identifier
     */
    function getBatchRequestCount(uint256 batchId) external view returns (uint256) {
        return batchRequestCount[batchId];
    }

    /**
     * @dev Get batch request by index
     * @param batchId Batch identifier
     * @param requestIndex Request index
     */
    function getBatchRequest(
        uint256 batchId,
        uint256 requestIndex
    ) external view returns (
        uint256 requestBatchId,
        address requester,
        uint256 requestedQuantity,
        string memory requestDetails,
        uint256 requestTimestamp,
        bool isFulfilled,
        uint256 fulfilledQuantity,
        uint256 fulfilledTimestamp
    ) {
        BatchRequest storage request = batchRequestsByIndex[batchId][requestIndex];
        return (
            request.batchId,
            request.requester,
            request.requestedQuantity,
            request.requestDetails,
            request.requestTimestamp,
            request.isFulfilled,
            request.fulfilledQuantity,
            request.fulfilledTimestamp
        );
    }

    /**
     * @dev Get all batch requests for a batch
     * @param batchId Batch identifier
     */
    function getAllBatchRequests(
        uint256 batchId
    ) external view returns (BatchRequest[] memory) {
        uint256 count = batchRequestCount[batchId];
        BatchRequest[] memory requests = new BatchRequest[](count);
        
        for (uint256 i = 0; i < count; i++) {
            requests[i] = batchRequestsByIndex[batchId][i];
        }
        
        return requests;
    }

    /**
     * @dev Check if batch exists
     * @param batchId Batch identifier
     */
    function isBatchCreated(uint256 batchId) public view returns (bool) {
        return s_batchExists[batchId];
    }

    /**
     * @dev Check if batch is active
     * @param batchId Batch identifier
     */
    function isBatchActive(uint256 batchId) public view returns (bool) {
        return s_batchActive[batchId];
    }

    /**
     * @dev Get all active batch IDs
     * @return activeBatchIds Array of active batch IDs
     */
    function getActiveBatchIds() external view returns (uint256[] memory activeBatchIds) {
        uint256 activeCount = 0;
        
        // First pass: count active batches
        for (uint256 i = 1; i <= s_batchCounter; i++) {
            if (s_batchActive[i]) {
                activeCount++;
            }
        }
        
        // Second pass: collect active batch IDs
        activeBatchIds = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= s_batchCounter; i++) {
            if (s_batchActive[i]) {
                activeBatchIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeBatchIds;
    }

    /**
     * @dev Get batch expiry date
     * @param batchId Batch identifier
     */
    function getBatchExpiryDate(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return s_batchInfo[batchId].expiryDate;
    }

    /**
     * @dev Get batch last verified timestamp
     * @param batchId Batch identifier
     */
    function getBatchLastVerifiedTimestamp(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return s_batchInfo[batchId].lastVerifiedTimestamp;
    }

    /**
     * @dev Get batch quantity
     * @param batchId Batch identifier
     */
    function getBatchQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return s_batchInfo[batchId].quantity;
    }

    /**
     * @dev Get batch creation date
     * @param batchId Batch identifier
     */
    function getBatchCreationDate(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return s_batchInfo[batchId].productionDate;
    }

    /**
     * @dev Get batch verification status
     * @param batchId Batch identifier
     */
    function isBatchVerified(uint256 batchId) external view returns (bool) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return _getBatchFlag(batchId, 0);
    }

    /**
     * @dev Get batch metadata verification status
     * @param batchId Batch identifier
     */
    function isBatchMetadataVerified(uint256 batchId) external view returns (bool) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return _getBatchFlag(batchId, 1);
    }

    /**
     * @dev Get batch packaging info
     * @param batchId Batch identifier
     */
    function getBatchPackagingInfo(uint256 batchId) external view returns (string memory) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return batchPackagingInfo[batchId];
    }

    /**
     * @dev Get batch metadata hash
     * @param batchId Batch identifier
     */
    function getBatchMetadataHash(uint256 batchId) external view returns (string memory) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return batchMetadataHash[batchId];
    }

    /**
     * @dev Get batch ZK proof hash
     * @param batchId Batch identifier
     */
    function getBatchZKProofHash(uint256 batchId) external view returns (bytes32) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return batchZKProofHash[batchId];
    }

    /**
     * @dev Get batch encrypted data hash
     * @param batchId Batch identifier
     */
    function getBatchEncryptedDataHash(uint256 batchId) external view returns (bytes32) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        return batchEncryptedDataHash[batchId];
    }

    /**
     * @dev Mark batch as expired (only inventory manager)
     * @param batchId Batch identifier
     */
    function markBatchExpired(uint256 batchId) external onlyRole(INVENTORY_MANAGER_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        _setBatchFlag(batchId, 2, false); // isActive = false
        s_batchActive[batchId] = false;
    }

    /**
     * @dev Reset batch verification flags (only inventory manager)
     * @param batchId Batch identifier
     */
    function resetBatchVerificationFlags(uint256 batchId) external onlyRole(INVENTORY_MANAGER_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        _setBatchFlag(batchId, 0, false); // isVerified = false
        _setBatchFlag(batchId, 1, false); // isMetadataVerified = false
    }

    /* -------------------------------------------------------------------------- */
    /*                              Admin Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update batch status (only admins)
     * @param batchId Batch identifier
     * @param isActive Active status
     */
    function updateBatchStatus(uint256 batchId, bool isActive) external onlyRole(ADMIN_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        s_batchActive[batchId] = isActive;
        _setBatchFlag(batchId, 2, isActive); // isActive
    }

    /**
     * @dev Update batch inventory (only admins)
     * @param batchId Batch identifier
     * @param newQuantity New quantity
     */
    function updateInventory(uint256 batchId, uint256 newQuantity) external onlyRole(ADMIN_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateInventory();
        }
        if (newQuantity == 0) {
            revert WAGACoffeeToken__InvalidQuantity_updateInventory();
        }
        s_batchInfo[batchId].quantity = newQuantity;
    }

    /**
     * @dev Verify batch metadata (only admins)
     * @param batchId Batch identifier
     * @param verifiedPrice Verified price
     * @param verifiedPackaging Verified packaging
     * @param verifiedMetadataHash Verified metadata hash
     */
    function verifyBatchMetadata(
        uint256 batchId,
        uint256 verifiedPrice,
        string calldata verifiedPackaging,
        string calldata verifiedMetadataHash
    ) external onlyRole(ADMIN_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_verifyBatchMetadata();
        }

        BatchInfo storage info = s_batchInfo[batchId];
        
        if (info.pricePerUnit != verifiedPrice ||
            keccak256(bytes(batchPackagingInfo[batchId])) != keccak256(bytes(verifiedPackaging)) ||
            keccak256(bytes(batchMetadataHash[batchId])) != keccak256(bytes(verifiedMetadataHash))) {
            revert WAGACoffeeToken__MetadataMisMatch_verifyBatchMetadata();
        }

        _setBatchFlag(batchId, 1, true); // isMetadataVerified
        info.lastVerifiedTimestamp = block.timestamp;
    }

    /**
     * @dev Update batch last verified timestamp (only admins)
     * @param batchId Batch identifier
     * @param timestamp Timestamp
     */
    function updateBatchLastVerifiedTimestamp(
        uint256 batchId,
        uint256 timestamp
    ) external onlyRole(ADMIN_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        s_batchInfo[batchId].lastVerifiedTimestamp = timestamp;
    }

    /**
     * @dev Mint batch tokens with inventory validation (only admins)
     * @param to Recipient address
     * @param batchId Batch identifier
     * @param amount Amount to mint
     */
    function mintBatch(
        address to,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_createBatch();
        }
        
        BatchInfo storage batchInfo = s_batchInfo[batchId];
        
        // Validate minting doesn't exceed batch quantity
        if (batchInfo.mintedQuantity + amount > batchInfo.quantity) {
            revert WAGACoffeeToken__BatchQuantityExceeded_mintBatch();
        }
        
        // Validate amount is greater than 0
        if (amount == 0) {
            revert WAGACoffeeToken__InsufficientBatchQuantity_mintBatch();
        }
        
        // Update minted quantity
        batchInfo.mintedQuantity += amount;
        
        // Mint tokens
        _mint(to, batchId, amount, "");
        
        // Emit event
        emit TokensMinted(batchId, to, amount, batchInfo.mintedQuantity);
    }

    /**
     * @dev Update batch IPFS metadata (only admins)
     * @param batchId Batch identifier
     * @param metadataHash New metadata hash
     * @param newMetadataHash New metadata hash
     */
    function updateBatchIPFS(
        uint256 batchId,
        string calldata metadataHash,
        string calldata newMetadataHash
    ) external {
        // Only admins and processors can update IPFS metadata
        if (!hasRole(ADMIN_ROLE, msg.sender) && !hasRole(PROCESSOR_ROLE, msg.sender)) {
            revert WAGACoffeeToken__AccessControlUnauthorizedAccount_createBatch();
        }

        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchIPFS();
        }
        batchMetadataHash[batchId] = newMetadataHash;
    }

    /**
     * @dev Verify inventory synchronization between on-chain tokens and off-chain inventory
     * @param batchId Batch identifier
     * @param offChainInventory Off-chain inventory quantity
     * @return isSynchronized Whether inventory is synchronized
     */
    function verifyInventorySynchronization(
        uint256 batchId,
        uint256 offChainInventory
    ) external onlyRole(ADMIN_ROLE) returns (bool isSynchronized) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        
        BatchInfo storage batchInfo = s_batchInfo[batchId];
        uint256 onChainTokens = batchInfo.mintedQuantity;
        
        // Check if on-chain tokens match off-chain inventory
        isSynchronized = (onChainTokens == offChainInventory);
        
        // Emit verification event
        emit InventoryVerified(batchId, onChainTokens, offChainInventory, isSynchronized);
        
        return isSynchronized;
    }

    /**
     * @dev Get batch inventory information
     * @param batchId Batch identifier
     * @return totalQuantity Total batch quantity
     * @return mintedQuantity Total tokens minted
     * @return availableQuantity Available quantity for minting
     */
    function getBatchInventoryInfo(
        uint256 batchId
    ) external view returns (
        uint256 totalQuantity,
        uint256 mintedQuantity,
        uint256 availableQuantity
    ) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        
        BatchInfo storage batchInfo = s_batchInfo[batchId];
        totalQuantity = batchInfo.quantity;
        mintedQuantity = batchInfo.mintedQuantity;
        availableQuantity = batchInfo.quantity - batchInfo.mintedQuantity;
        
        return (totalQuantity, mintedQuantity, availableQuantity);
    }

    /**
     * @dev Burn tokens for redemption (only redemption contract)
     * @param from Address to burn tokens from
     * @param batchId Batch identifier
     * @param amount Amount to burn
     */
    function burnForRedemption(
        address from,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(REDEMPTION_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_createBatch();
        }
        
        BatchInfo storage batchInfo = s_batchInfo[batchId];
        
        // Validate burning doesn't exceed minted quantity
        if (amount > batchInfo.mintedQuantity) {
            revert WAGACoffeeToken__BatchQuantityExceeded_mintBatch();
        }
        
        // Validate amount is greater than 0
        if (amount == 0) {
            revert WAGACoffeeToken__InsufficientBatchQuantity_mintBatch();
        }
        
        // Update minted quantity (decrease)
        batchInfo.mintedQuantity -= amount;
        
        // Burn tokens
        _burn(from, batchId, amount);
        
        // Emit event
        emit TokensMinted(batchId, from, amount, batchInfo.mintedQuantity);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Helper Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validate privacy configuration
     * @param privacyConfig Privacy configuration to validate
     */
    function _validatePrivacyConfig(
        IPrivacyLayer.PrivacyConfig memory privacyConfig
    ) internal pure returns (bool) {
        // Validate privacy levels (0 = Public, 1 = Selective, 2 = Private)
        if (privacyConfig.pricingSelective > 2 || 
            privacyConfig.qualitySelective > 2 || 
            privacyConfig.supplyChainSelective > 2) {
            return false;
        }
        return true;
    }

    /**
     * @dev Get batch flag value
     * @param batchId Batch identifier
     * @param flagBit Bit position (0: isVerified, 1: isMetadataVerified, 2: isActive)
     */
    function _getBatchFlag(uint256 batchId, uint8 flagBit) internal view returns (bool) {
        return (batchFlags[batchId] & (1 << flagBit)) != 0;
    }

    /**
     * @dev Set batch flag value
     * @param batchId Batch identifier
     * @param flagBit Bit position (0: isVerified, 1: isMetadataVerified, 2: isActive)
     * @param value Flag value
     */
    function _setBatchFlag(uint256 batchId, uint8 flagBit, bool value) internal {
        uint8 currentFlags = batchFlags[batchId];
        if (value) {
            batchFlags[batchId] = uint8(currentFlags | (1 << flagBit));
        } else {
            batchFlags[batchId] = uint8(currentFlags & ~(1 << flagBit));
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              Override Functions                             */
    /* -------------------------------------------------------------------------- */

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function uri(uint256 tokenId) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return super.uri(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl, ERC1155Holder) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
