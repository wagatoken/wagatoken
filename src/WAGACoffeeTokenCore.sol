// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./WAGAConfigManager.sol";
import "./WAGAViewFunctions.sol";
import "./Interfaces/IWAGABatchManager.sol";
import "./WAGAZKManager.sol";
import "./Interfaces/IPrivacyLayer.sol";
import "./Interfaces/IWAGACoffeeToken.sol";

/**
 * @title WAGACoffeeTokenCore
 * @dev Core functionality for WAGA Coffee Token system - modular version with multi-product support
 */
contract WAGACoffeeTokenCore is ERC1155Supply, WAGAConfigManager, WAGAViewFunctions, IWAGACoffeeToken {

    mapping(uint256 => bool) public s_batchCreated; // Track created batches (for ERC1155)

    /**
     * @dev Mark a batch as created (called by processor roles)
     */
    function batchCreated(uint256 batchId) external onlyRole(PROCESSOR_ROLE) {
        require(!s_batchCreated[batchId], "Batch already exists");
        s_batchCreated[batchId] = true;
        emit BatchCreated(batchId, msg.sender, 0, 0, "");
    }
    
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error WAGACoffeeTokenCore__BatchAlreadyExists_createBatch();
    error WAGACoffeeTokenCore__InvalidQuantity_createBatch();
    error WAGACoffeeTokenCore__InvalidPrice_createBatch();
    error WAGACoffeeTokenCore__BatchDoesNotExist_updateBatchURI();
    error WAGACoffeeTokenCore__BatchDoesNotExist_transferBatch();
    error WAGACoffeeTokenCore__InsufficientBalance_transferBatch();
    error WAGACoffeeTokenCore__BatchDoesNotExist_mintBatch();
    error WAGACoffeeTokenCore__BatchDoesNotExist_burnForRedemption();
    error WAGACoffeeTokenCore__BatchQuantityExceeded_burnForRedemption();
    error WAGACoffeeTokenCore__InsufficientBatchQuantity_burnForRedemption();

    /* -------------------------------------------------------------------------- */
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

    /**
     * @dev Set manager contracts (admin only)
     */
    // Remove duplicate and misplaced setManagers function

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    // ...existing code...

    /**
     * @dev Mint tokens for verified batch (called by ProofOfReserve)
     */
    function mintBatch(
        address to,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        if (!s_batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_mintBatch();
        }
        
        // Get batch quantity from BatchManager
        (,,uint256 batchQuantity,,,,,) = batchManager.getBatchInfo(batchId);
        
        // Update minted quantity tracking in local state
        s_batchInfo[batchId].mintedQuantity += amount;
        
        // Enforce mint limit - total minted cannot exceed batch quantity
        require(s_batchInfo[batchId].mintedQuantity <= batchQuantity, "Total minted exceeds batch quantity");
        require(amount <= batchQuantity, "Mint amount exceeds batch quantity");
        
        // Mint ERC1155 tokens
        _mint(to, batchId, amount, "");
    }

    /**
     * @dev Burn tokens for redemption (called by RedemptionManager)
     */
    function burnForRedemption(
        address from,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(REDEMPTION_ROLE) {
        if (!s_batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_burnForRedemption();
        }
        uint256 balance = balanceOf(from, batchId);
        if (balance < amount) {
            revert WAGACoffeeTokenCore__InsufficientBatchQuantity_burnForRedemption();
        }
        
        // Update minted quantity tracking - reduce by burned amount
        if (s_batchInfo[batchId].mintedQuantity >= amount) {
            s_batchInfo[batchId].mintedQuantity -= amount;
        }
        
        // Burn the ERC1155 tokens
        _burn(from, batchId, amount);
        
        // Note: Batch inventory (s_batchInfo[batchId].quantity) represents physical inventory
        // and should be managed by BatchManager based on actual physical redemptions
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
        if (!s_batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_transferBatch();
        }
        if (balanceOf(from, batchId) < amount) {
            revert WAGACoffeeTokenCore__InsufficientBalance_transferBatch();
        }
        _safeTransferFrom(from, to, batchId, amount, "");
        emit BatchTransferred(batchId, from, to, amount);
    }

    /**
     * @dev Creates a new batch for blockchain-first workflow
     */
    function createBatch(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin,
        string memory packagingInfo,
        string memory metadataURI
    ) external onlyRole(PROCESSOR_ROLE) returns (uint256) {
        if (quantity == 0) {
            revert WAGACoffeeTokenCore__InvalidQuantity_createBatch();
        }
        if (pricePerUnit == 0) {
            revert WAGACoffeeTokenCore__InvalidPrice_createBatch();
        }

        // Generate next batch ID
        uint256 newBatchId = _nextBatchId++;
        
        // Mark batch as created in this contract
        s_batchCreated[newBatchId] = true;

        // Store metadata URI if provided
        if (bytes(metadataURI).length > 0) {
            s_batchMetadata[newBatchId] = metadataURI;
        }

        // Delegate detailed batch creation to BatchManager if available
        if (address(batchManager) != address(0)) {
            batchManager.createBatchInfoWithCaller(
                msg.sender,
                newBatchId,
                productionDate,
                expiryDate,
                quantity,
                pricePerUnit,
                origin,
                packagingInfo,
                IPrivacyLayer.PrivacyLevel.PUBLIC
            );
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
        if (!s_batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_updateBatchURI();
        }
        require(bytes(ipfsUri).length > 0, "IPFS URI cannot be empty");
        
        s_batchMetadata[batchId] = ipfsUri;
        // Additional metadata update logic can be added here
    }

    /* -------------------------------------------------------------------------- */
    /*                               View Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if batch exists (required by BatchManager)
     */
    function isBatchCreated(uint256 batchId) public view override(WAGAViewFunctions, IWAGACoffeeToken) returns (bool) {
        return s_batchCreated[batchId];
    }

    /**
     * @dev Get batch information - delegates to inherited function
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
        return getBasicBatchInfo(batchId);
    }

    /**
     * @dev Get total number of batches created
     */
    function getTotalBatches() external view returns (uint256) {
        return _nextBatchId - 2025000001; // Subtract the starting batch ID
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
