// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./WAGAConfigManager.sol";
import "./Interfaces/IWAGABatchManager.sol";
import "./WAGAZKManager.sol";
import "./WAGAViewFunctions.sol";

/**
 * @title WAGACoffeeTokenCore 
 * @dev OPTIMIZED Core ERC1155 token functionality - LEAN VERSION
 * @notice Focused on essential token operations only, inherits batch data from WAGAViewFunctions
 */
contract WAGACoffeeTokenCore is ERC1155Supply, WAGAConfigManager, WAGAViewFunctions {

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // MINIMAL STATE - Only essential token data
    mapping(uint256 => string) public s_batchMetadata; // Token metadata URIs
    
    // Manager contracts
    IWAGABatchManager public batchManager;
    WAGAZKManager public zkManager;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchCreated(uint256 indexed batchId, address indexed creator, uint256 quantity, uint256 pricePerUnit, string metadataURI);
    event BatchMinted(uint256 indexed batchId, address indexed to, uint256 amount, uint256 totalMinted);
    event BatchBurned(uint256 indexed batchId, address indexed from, uint256 amount, uint256 totalMinted);
    event BatchTransferred(uint256 indexed batchId, address indexed from, address indexed to, uint256 amount);

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error CallerNotAuthorized();
    error BatchDoesNotExist();
    error InvalidQuantity();
    error InsufficientInventory();
    error InsufficientBalance();

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(string memory baseURI) ERC1155(baseURI) {
        // Note: Role granting is handled by WAGAConfigManager constructor
        // since this contract inherits from WAGAConfigManager
    }

    /* -------------------------------------------------------------------------- */
    /*                                 Modifiers                                  */
    /* -------------------------------------------------------------------------- */

    modifier onlyBatchCreator() {
        if (!(hasRole(ADMIN_ROLE, msg.sender) || 
              hasRole(PROCESSOR_ROLE, msg.sender) ||
              hasRole(COOPERATIVE_ROLE, msg.sender) ||
              hasRole(ROASTER_ROLE, msg.sender))) {
            revert CallerNotAuthorized();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Creates a new batch - LEAN VERSION
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
        if (quantity == 0 || pricePerUnit == 0) {
            revert InvalidQuantity();
        }

        uint256 newBatchId = _nextBatchId++;
        
        // Store batch data using inherited storage from WAGAViewFunctions
        s_batchInfo[newBatchId] = BatchInfo({
            productionDate: productionDate,
            expiryDate: expiryDate,
            isVerified: false,
            quantity: quantity,
            mintedQuantity: 0,
            pricePerUnit: pricePerUnit,
            packagingInfo: packagingInfo,
            metadataHash: "",
            isMetadataVerified: false,
            lastVerifiedTimestamp: 0
        });

        // Set batch as active using inherited storage
        s_isActiveBatch[newBatchId] = true;
        s_activeBatchIds.push(newBatchId);
        s_activeBatchIndex[newBatchId] = s_activeBatchIds.length - 1;
        
        // Store metadata URI
        if (bytes(metadataURI).length > 0) {
            s_batchMetadata[newBatchId] = metadataURI;
        }

        // Register with BatchManager
        if (address(batchManager) != address(0)) {
            batchManager.registerBatchCreation(newBatchId, origin, msg.sender);
        }

        // Configure privacy with default public settings
        if (address(zkManager) != address(0)) {
            zkManager.configureDefaultPrivacy(newBatchId);
        }

        emit BatchCreated(newBatchId, msg.sender, quantity, pricePerUnit, metadataURI);
        return newBatchId;
    }

    /**
     * @dev Mint tokens - SIMPLIFIED
     */
    function mintBatch(address to, uint256 batchId, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (!s_isActiveBatch[batchId]) {
            revert BatchDoesNotExist();
        }
        
        // Validate using inherited storage
        BatchInfo storage batch = s_batchInfo[batchId];
        if (batch.mintedQuantity + amount > batch.quantity) {
            revert InsufficientInventory();
        }
        
        // Update minted quantity
        batch.mintedQuantity += amount;
        
        _mint(to, batchId, amount, "");
        emit BatchMinted(batchId, to, amount, totalSupply(batchId));
    }

    /**
     * @dev Burn tokens for redemption - SIMPLIFIED
     */
    function burnForRedemption(address from, uint256 batchId, uint256 amount) external onlyRole(REDEMPTION_ROLE) {
        if (balanceOf(from, batchId) < amount) {
            revert InsufficientBalance();
        }
        
        _burn(from, batchId, amount);
        
        // Update minted quantity (reduce it when burning)
        BatchInfo storage batch = s_batchInfo[batchId];
        if (batch.mintedQuantity >= amount) {
            batch.mintedQuantity -= amount;
        }
        
        emit BatchBurned(batchId, from, amount, totalSupply(batchId));
    }

    /**
     * @dev Transfer batch tokens - LEAN VERSION
     */
    function transferBatch(uint256 batchId, address from, address to, uint256 amount) external {
        if (!s_isActiveBatch[batchId]) {
            revert BatchDoesNotExist();
        }
        if (balanceOf(from, batchId) < amount) {
            revert InsufficientBalance();
        }
        _safeTransferFrom(from, to, batchId, amount, "");
        emit BatchTransferred(batchId, from, to, amount);
    }

    /* -------------------------------------------------------------------------- */
    /*                               View Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if batch has been created - override from WAGAViewFunctions
     */
    function isBatchCreated(uint256 batchId) public view override returns (bool) {
        return s_batchInfo[batchId].productionDate != 0;
    }

    /**
     * @dev Check if batch is active - override from WAGAViewFunctions
     */
    function isBatchActive(uint256 batchId) external view override returns (bool) {
        return s_isActiveBatch[batchId];
    }

    /**
     * @dev Get next batch ID - override from WAGAViewFunctions
     */
    function getNextBatchId() external view override returns (uint256) {
        return _nextBatchId;
    }

    /**
     * @dev Get batch information - INTERFACE REQUIRED FUNCTION
     * @notice Returns the 7 core parameters expected by IWAGACoffeeToken interface
     */
    function getBatchInfo(uint256 batchId) external view returns (
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory packagingInfo,
        string memory metadataHash,
        uint256 lastVerifiedTimestamp
    ) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        
        BatchInfo storage info = s_batchInfo[batchId];
        return (
            info.productionDate,
            info.expiryDate,
            info.quantity,
            info.pricePerUnit,
            info.packagingInfo,
            info.metadataHash,
            info.lastVerifiedTimestamp
        );
    }

    /**
     * @dev Get complete batch information - override from WAGAViewFunctions
     * @notice Extended version with additional verification fields
     */
    function getBasicBatchInfo(uint256 batchId) public view override returns (
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
     * @dev Get minted quantity for a batch - override from WAGAViewFunctions
     */
    function getBatchMintedQuantity(uint256 batchId) external view override returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        return s_batchInfo[batchId].mintedQuantity;
    }

    /**
     * @dev Get minted quantity for a batch - INTERFACE REQUIRED FUNCTION
     * @notice Alias for getBatchMintedQuantity to satisfy IWAGACoffeeToken interface
     */
    function getMintedQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        return s_batchInfo[batchId].mintedQuantity;
    }

    /**
     * @dev Get available quantity for a batch - INTERFACE REQUIRED FUNCTION
     * @notice Returns quantity - mintedQuantity to satisfy IWAGACoffeeToken interface
     */
    function getAvailableQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        BatchInfo storage info = s_batchInfo[batchId];
        return info.quantity - info.mintedQuantity;
    }

    /**
     * @dev Get batch quantity - delegate to inherited function
     */
    function getBatchQuantity(uint256 batchId) external view override returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        return s_batchInfo[batchId].quantity;
    }

    /**
     * @dev Get active batch IDs - delegate to inherited function
     */
    function getActiveBatchIds() external view override returns (uint256[] memory) {
        return s_activeBatchIds;
    }

    /**
     * @dev Get batch request - delegate to inherited function
     * @notice Uses uint256 requestIndex to match WAGAViewFunctions.getBatchRequest
     */
    function getBatchRequest(uint256 batchId, uint256 requestIndex) external view override returns (
        uint256 requestBatchId,
        address requester,
        uint256 requestedQuantity,
        string memory requestDetails,
        uint256 requestTimestamp,
        bool isFulfilled,
        uint256 fulfilledQuantity,
        uint256 fulfilledTimestamp
    ) {
        // Directly return the data from storage using inherited storage mappings
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

    /* -------------------------------------------------------------------------- */
    /*                              Manager Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set manager contract address
     */
    function setBatchManager(address _batchManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        batchManager = IWAGABatchManager(_batchManager);
    }

    /**
     * @dev Set manager addresses - for deployment script compatibility
     * @param _batchManager Address of the batch manager
     * @param _zkManager Address of the ZK manager
     */
    function setManagerAddresses(address _batchManager, address _zkManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        batchManager = IWAGABatchManager(_batchManager);
        zkManager = WAGAZKManager(_zkManager);
    }

    /**
     * @dev Get the ZK manager address
     * @return ZK manager contract address
     */
    function getZKManager() external view returns (WAGAZKManager) {
        return zkManager;
    }

    /**
     * @dev Update batch IPFS URI
     */
    function updateBatchIPFS(uint256 batchId, string memory ipfsUri) external onlyRole(ADMIN_ROLE) {
        if (!s_isActiveBatch[batchId]) {
            revert BatchDoesNotExist();
        }
        s_batchMetadata[batchId] = ipfsUri;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Override Functions                            */
    /* -------------------------------------------------------------------------- */

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return s_batchMetadata[tokenId];
    }
}
