// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./WAGAConfigManager.sol";
import "./WAGAViewFunctions.sol";

/**
 * @title WAGACoffeeTokenCore
 * @dev Core functionality for WAGA Coffee Token system - modular version
 */
contract WAGACoffeeTokenCore is ERC1155Supply, WAGAConfigManager, WAGAViewFunctions {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error WAGACoffeeTokenCore__BatchAlreadyExists_createBatch();
    error WAGACoffeeTokenCore__InvalidQuantity_createBatch();
    error WAGACoffeeTokenCore__InvalidPrice_createBatch();
    error WAGACoffeeTokenCore__BatchDoesNotExist_updateBatchStatus();
    error WAGACoffeeTokenCore__BatchDoesNotExist_updateBatchURI();
    error WAGACoffeeTokenCore__BatchDoesNotExist_transferBatch();
    error WAGACoffeeTokenCore__InsufficientBalance_transferBatch();

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

    event BatchStatusUpdated(
        uint256 indexed batchId,
        bool isActive
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

    // Manager contract addresses (for modular architecture)
    address public batchManager;
    address public zkManager;

    // Additional state variables not in WAGAViewFunctions
    mapping(uint256 => string) public s_batchMetadata; // Token metadata URIs
    mapping(uint256 => bool) public batchCreated; // Track created batches
    mapping(uint256 => bool) public batchActive; // Track active batches
    uint256 public batchCounter; // Total batches created

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        string memory baseURI
    ) ERC1155(baseURI) WAGAConfigManager() WAGAViewFunctions() {
        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Create a new coffee batch
     */
    function createBatch(
        uint256 batchId,
        uint256 quantity,
        uint256 pricePerUnit,
        string calldata metadataURI
    ) external onlyRole(PROCESSOR_ROLE) {
        if (batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchAlreadyExists_createBatch();
        }
        if (quantity == 0) {
            revert WAGACoffeeTokenCore__InvalidQuantity_createBatch();
        }
        if (pricePerUnit == 0) {
            revert WAGACoffeeTokenCore__InvalidPrice_createBatch();
        }

        // Mark batch as created and active
        batchCreated[batchId] = true;
        batchActive[batchId] = true;
        batchCounter++;

        // Store basic batch info in WAGAViewFunctions state
        s_batchInfo[batchId] = BatchInfo({
            productionDate: block.timestamp,
            expiryDate: block.timestamp + 365 days, // Default 1 year
            isVerified: false,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            packagingInfo: "Standard",
            metadataHash: metadataURI,
            isMetadataVerified: false,
            lastVerifiedTimestamp: block.timestamp
        });

        // Store metadata URI
        s_batchMetadata[batchId] = metadataURI;

        emit BatchCreated(batchId, msg.sender, quantity, pricePerUnit, metadataURI);
    }

    /**
     * @dev Update batch status (active/inactive)
     */
    function updateBatchStatus(
        uint256 batchId,
        bool isActive
    ) external onlyRole(PROCESSOR_ROLE) {
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_updateBatchStatus();
        }

        batchActive[batchId] = isActive;
        emit BatchStatusUpdated(batchId, isActive);
    }

    /**
     * @dev Update batch metadata URI
     */
    function updateBatchURI(
        uint256 batchId,
        string calldata newURI
    ) external onlyRole(PROCESSOR_ROLE) {
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_updateBatchURI();
        }

        s_batchMetadata[batchId] = newURI;
        s_batchInfo[batchId].metadataHash = newURI;
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
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_transferBatch();
        }
        if (balanceOf(from, batchId) < amount) {
            revert WAGACoffeeTokenCore__InsufficientBalance_transferBatch();
        }

        _safeTransferFrom(from, to, batchId, amount, "");
        emit BatchTransferred(batchId, from, to, amount);
    }

    /* -------------------------------------------------------------------------- */
    /*                               View Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get total number of batches created
     */
    function getTotalBatches() external view returns (uint256) {
        return batchCounter;
    }

    /**
     * @dev Set manager contract addresses (admin only)
     */
    function setManagerAddresses(
        address _batchManager,
        address _zkManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        batchManager = _batchManager;
        zkManager = _zkManager;
    }

    /**
     * @dev Check if caller is a manager contract
     */
    function isManagerContract(address caller) external view returns (bool) {
        return caller == batchManager || caller == zkManager;
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
}
