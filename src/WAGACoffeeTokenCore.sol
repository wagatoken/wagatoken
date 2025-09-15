// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./WAGAConfigManager.sol";
import "./Interfaces/IWAGABatchManager.sol";
import "./WAGAZKManager.sol";
import "./Interfaces/IPrivacyLayer.sol";
import "./Interfaces/IWAGACoffeeToken.sol";

/**
 * @title WAGACoffeeTokenCore
 * @dev Core functionality for WAGA Coffee Token system - optimized for size
 */
contract WAGACoffeeTokenCore is ERC1155Supply, WAGAConfigManager {

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @notice Essential batch information stored on-chain (moved from WAGAViewFunctions)
     */
    struct BatchInfo {
        uint256 productionDate;
        uint256 expiryDate;
        bool isVerified;
        uint256 quantity;
        uint256 mintedQuantity;
        uint256 pricePerUnit;
        string packagingInfo;
        string metadataHash;
        bool isMetadataVerified;
        uint256 lastVerifiedTimestamp;
    }

    /**
     * @notice Batch request structure for tracking redemption requests
     * @param batchId The batch identifier this request is for
     * @param requester Address that made the request
     * @param requestedQuantity Amount of tokens requested
     * @param requestDetails String details about the request
     * @param requestTimestamp When the request was made
     * @param isFulfilled Whether the request has been fulfilled
     * @param fulfilledQuantity Amount that was actually fulfilled
     * @param fulfilledTimestamp When the request was fulfilled
     */
    struct BatchRequest {
        uint256 batchId;
        address requester;
        uint256 requestedQuantity;
        string requestDetails;
        uint256 requestTimestamp;
        bool isFulfilled;
        uint256 fulfilledQuantity;
        uint256 fulfilledTimestamp;
    }

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Core batch data (moved from WAGAViewFunctions to avoid inheritance)
    mapping(uint256 => BatchInfo) public s_batchInfo;
    
    // Batch request management
    mapping(uint256 => mapping(uint256 => BatchRequest)) public batchRequestsByIndex;
    mapping(uint256 => uint256) public s_batchRequestCount; // batchId => count
    
    mapping(uint256 => bool) public s_isActiveBatch;
    uint256[] public s_activeBatchIds; // Direct enumeration array
    mapping(uint256 => uint256) public s_activeBatchIndex; // O(1) removal support
    uint256 public _nextBatchId = 2025000001;
    
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error CallerNotAuthorized();
    error BatchDoesNotExist();
    error InvalidQuantity();
    error InvalidExpiryDate();
    error BatchAlreadyVerified();
    error BatchNotVerified();
    error ConfigurationManagerNotSet();
    error InvalidPackagingInfo();
    error InsufficientAllowance();
    error TokenTransferFailed();
    error InvalidMetadataHash();
    error MetadataNotVerified();
    error InsufficientInventory();
    error BatchNotFound();    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchCreated(
        uint256 indexed batchId,
        address indexed creator,
        uint256 quantity,
        uint256 pricePerUnit,
        string metadataURI
    );

    event BatchTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    event BatchMinted(
        uint256 indexed batchId,
        address indexed to,
        uint256 amount,
        uint256 totalMinted
    );

    event BatchBurned(
        uint256 indexed batchId,
        address indexed from,
        uint256 amount,
        uint256 totalMinted
    );

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Modular manager contracts
    IWAGABatchManager public batchManager;
    WAGAZKManager public zkManager;

    mapping(uint256 => string) public s_batchMetadata; // Token metadata URIs

    /* -------------------------------------------------------------------------- */
    // ...existing code...

    constructor(
        string memory baseURI
    ) ERC1155(baseURI) {
        // Initialize config manager and view functions (they have no constructor params)
        
        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                                 Modifiers                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Only admins, processors, cooperatives, or roasters can create batches
     */
    modifier onlyBatchCreator() {
        if (!(hasRole(ADMIN_ROLE, msg.sender) || 
              hasRole(PROCESSOR_ROLE, msg.sender) ||
              hasRole(COOPERATIVE_ROLE, msg.sender) ||
              hasRole(ROASTER_ROLE, msg.sender))) {
            revert CallerNotAuthorized();
        }
        _;
    }

    /**
     * @dev Set manager contracts (admin only)
     */
    // Remove duplicate and misplaced setManagers function

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    // ...existing code...

    /**
     * @dev Mint tokens for verified batch - SIMPLIFIED QUANTITY TRACKING
     */
    function mintBatch(
        address to,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        
        // Get batch info from single source of truth
        BatchInfo storage batch = s_batchInfo[batchId];
        
        // Simple validation: ensure we don't mint more than available
        uint256 availableToMint = batch.quantity - batch.mintedQuantity;
        if (amount > availableToMint) {
            revert InsufficientInventory();
        }
        
        // Update minted quantity
        batch.mintedQuantity += amount;
        
        // Mint ERC1155 tokens
        _mint(to, batchId, amount, "");
        
        emit BatchMinted(batchId, to, amount, batch.mintedQuantity);
    }

    /**
     * @dev Burn tokens for redemption - SIMPLIFIED QUANTITY TRACKING
     */
    function burnForRedemption(
        address from,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(REDEMPTION_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        
        uint256 balance = balanceOf(from, batchId);
        if (balance < amount) {
            revert BatchDoesNotExist();
        }
        
        // Burn the ERC1155 tokens first
        _burn(from, batchId, amount);
        
        // Update minted quantity tracking - reduce by burned amount
        BatchInfo storage batch = s_batchInfo[batchId];
        if (batch.mintedQuantity >= amount) {
            batch.mintedQuantity -= amount;
        }
        
        emit BatchBurned(batchId, from, amount, batch.mintedQuantity);
    }

    /**
     * @dev Transfer batch tokens between addresses
     */
    function transferBatch(
        uint256 batchId,
        address from,
        address to,
        uint256 amount
    ) external {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        if (balanceOf(from, batchId) < amount) {
            revert BatchDoesNotExist();
        }
        _safeTransferFrom(from, to, batchId, amount, "");
        emit BatchTransferred(batchId, from, to, amount);
    }

    /**
     * @dev Creates a new batch - SINGLE STANDARDIZED ENTRY POINT
     * This is the only way to create batches in the system
     * @param productionDate Timestamp when the coffee was produced
     * @param expiryDate Timestamp when the batch expires
     * @param quantity Number of units in the batch
     * @param pricePerUnit Price per unit in cents (e.g., 1234 = $12.34)
     * @param origin Origin/region where coffee was grown
     * @param packagingInfo Packaging format (e.g., "60kg bags", "250g bags")
     * @param metadataURI IPFS URI containing batch metadata
     */
    function createBatch(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin,
        string memory packagingInfo,
        string memory metadataURI
    ) external onlyBatchCreator returns (uint256) {
        if (quantity == 0) {
            revert BatchDoesNotExist();
        }
        if (pricePerUnit == 0) {
            revert BatchDoesNotExist();
        }

        // Generate next batch ID
        uint256 newBatchId = _nextBatchId++;

        // Store basic batch information directly (no delegation)
        s_batchInfo[newBatchId] = BatchInfo({
            productionDate: productionDate,
            expiryDate: expiryDate,
            isVerified: false,
            quantity: quantity,
            mintedQuantity: 0,
            pricePerUnit: pricePerUnit,
            packagingInfo: packagingInfo,
            metadataHash: "", // Will be set when metadata is verified
            isMetadataVerified: false,
            lastVerifiedTimestamp: 0
        });

        // Set batch as active
        s_isActiveBatch[newBatchId] = true;
        s_activeBatchIds.push(newBatchId);
        s_activeBatchIndex[newBatchId] = s_activeBatchIds.length - 1;
        

        // Store metadata URI if provided
        if (bytes(metadataURI).length > 0) {
            s_batchMetadata[newBatchId] = metadataURI;
        }

        // Configure with BatchManager if available (unidirectional dependency)
        if (address(batchManager) != address(0)) {
            batchManager.registerBatchCreation(
                newBatchId,
                origin,
                msg.sender
            );
        }

        // Configure privacy with default public settings
        if (address(zkManager) != address(0)) {
            zkManager.configureDefaultPrivacy(newBatchId);
        }

        emit BatchCreated(newBatchId, msg.sender, quantity, pricePerUnit, metadataURI);
        return newBatchId;
    }

    /**
     * @dev Updates the IPFS URI for an existing batch
     */
    function updateBatchIPFS(
        uint256 batchId,
        string memory ipfsUri
    ) external onlyRole(ADMIN_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        if (bytes(ipfsUri).length == 0) {
            revert InvalidMetadataHash();
        }
        
        s_batchMetadata[batchId] = ipfsUri;
        // Additional metadata update logic can be added here
    }

    /* -------------------------------------------------------------------------- */
    /*                               View Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get batch information
     */
    function getBatchInfo(
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
        uint256 lastVerifiedTimestamp
    ) {
        BatchInfo storage info = s_batchInfo[batchId];
        return (
            info.productionDate,
            info.expiryDate,
            info.isVerified,
            info.quantity,
            info.pricePerUnit,
            info.packagingInfo,
            info.metadataHash,
            info.isMetadataVerified,
            info.lastVerifiedTimestamp
        );
    }

    /**
     * @dev Check if batch is active
     */
    function isBatchActive(uint256 batchId) external view returns (bool) {
        return s_isActiveBatch[batchId];
    }

    /**
     * @dev Get batch request (proper implementation)
     */
    function getBatchRequest(uint256 batchId, uint256 requestIndex) external view returns (
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
     * @dev Get batch quantity
     */
    function getBatchQuantity(uint256 batchId) external view returns (uint256) {
        return s_batchInfo[batchId].quantity;
    }

    /**
     * @dev Get active batch IDs
     */
    function getActiveBatchIds() external view returns (uint256[] memory) {
        return s_activeBatchIds;
    }

    /**
     * @notice Checks if a batch has been created
     * @param batchId ID of the batch to check
     * @return True if batch exists
     */
    function isBatchCreated(uint256 batchId) public view returns (bool) {
        return s_batchInfo[batchId].productionDate != 0;
    }

    /**
     * @dev Get available quantity for minting (total - minted)
     */
    function getAvailableQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            return 0;
        }
        BatchInfo storage batch = s_batchInfo[batchId];
        return batch.quantity - batch.mintedQuantity;
    }

    /**
     * @dev Get minted quantity for batch
     */
    function getMintedQuantity(uint256 batchId) external view returns (uint256) {
        return s_batchInfo[batchId].mintedQuantity;
    }

    /**
     * @notice Returns minted quantity for a batch
     * @param batchId ID of the batch to query
     * @return Minted quantity of tokens for batch
     */
    function getBatchMintedQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert BatchNotFound();
        }
        return s_batchInfo[batchId].mintedQuantity;
    }    /**
     * @dev Get total number of batches created
     */
    function getTotalBatches() external view returns (uint256) {
        return _nextBatchId - 2025000001; // Subtract the starting batch ID
    }

    /**
     * @dev Get next batch ID that will be assigned
     */
    function getNextBatchId() external view returns (uint256) {
        return _nextBatchId;
    }

    /* -------------------------------------------------------------------------- */
    /*                           SYSTEM INVARIANT CHECKS                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify batch data consistency across the system
     */
    function verifyBatchConsistency(uint256 batchId) external view returns (bool isConsistent, string memory reason) {
        if (!isBatchCreated(batchId)) {
            return (false, "Batch does not exist");
        }

        BatchInfo storage batch = s_batchInfo[batchId];
        
        // Check basic invariants
        if (batch.mintedQuantity > batch.quantity) {
            return (false, "Minted quantity exceeds total quantity");
        }
        
        if (batch.expiryDate <= batch.productionDate) {
            return (false, "Expiry date must be after production date");
        }
        
        if (batch.pricePerUnit == 0) {
            return (false, "Price per unit cannot be zero");
        }
        
        // Check active status consistency
        bool isActive = s_isActiveBatch[batchId];
        bool isExpired = block.timestamp > batch.expiryDate;
        
        if (isActive && isExpired) {
            return (false, "Active batch is expired");
        }
        
        return (true, "Batch data is consistent");
    }

    /**
     * @dev Verify system-wide consistency
     */
    function verifySystemConsistency() external view returns (bool isConsistent, string memory reason) {
        // Check that all active batches are in the active array
        uint256 activeCount = s_activeBatchIds.length;
        uint256 actualActiveCount = 0;
        
        for (uint256 i = 2025000001; i < _nextBatchId; i++) {
            if (s_isActiveBatch[i]) {
                actualActiveCount++;
            }
        }
        
        if (activeCount != actualActiveCount) {
            return (false, "Active batch count mismatch");
        }
        
        return (true, "System consistency verified");
    }

    /**
     * @dev Set manager contract addresses (admin only) - legacy function for deployment scripts
     */
    function setManagers(
        address _batchManager,
        address _zkManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        batchManager = IWAGABatchManager(_batchManager);
        zkManager = WAGAZKManager(_zkManager);
    }

    /**
     * @dev Set manager contract addresses (admin only)
     */
    function setManagerAddresses(
        address _batchManager,
        address _zkManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        batchManager = IWAGABatchManager(_batchManager);
        zkManager = WAGAZKManager(_zkManager);
    }

    /**
     * @dev Check if caller is a manager contract
     */
    function isManagerContract(address caller) external view returns (bool) {
    return caller == address(batchManager) || caller == address(zkManager);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Override Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns the URI for token type `id`.
     */
    function uri(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return s_batchMetadata[tokenId];
    }

    /* -------------------------------------------------------------------------- */
    /*                               Helper Functions                             */
    /* -------------------------------------------------------------------------- */



    // ...existing code...
    // All batch info and helper functions removed; handled by WAGABatchManager
}
