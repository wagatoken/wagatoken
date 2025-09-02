// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./WAGAConfigManager.sol";
import "./WAGAViewFunctions.sol";
import "./Interfaces/IWAGABatchManager.sol";
import "./WAGAZKManager.sol";
import "./Interfaces/IPrivacyLayer.sol";

/**
 * @title WAGACoffeeTokenCore
 * @dev Core functionality for WAGA Coffee Token system - modular version with multi-product support
 */
contract WAGACoffeeTokenCore is ERC1155Supply, WAGAConfigManager, WAGAViewFunctions {

    /* -------------------------------------------------------------------------- */
    /*                                   Enums                                    */
    /* -------------------------------------------------------------------------- */

    enum ProductType {
        RETAIL_BAGS,    // 250g/500g ready-to-consume coffee bags
        GREEN_BEANS,    // 60kg green coffee beans
        ROASTED_BEANS   // 60kg roasted coffee beans
    }

    /**
     * @dev Update batch inventory (only admins or trusted contracts)
     */
    function updateInventory(uint256 batchId, uint256 newQuantity) external onlyRole(ADMIN_ROLE) {
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_mintBatch();
        }
        if (newQuantity == 0) {
            revert WAGACoffeeTokenCore__InvalidQuantity_createBatch();
        }
        s_batchInfo[batchId].quantity = newQuantity;
    }

    /**
     * @dev Forwarding function for batch metadata verification (for compatibility)
     */
    function verifyBatchMetadata(
        uint256 batchId,
        uint256 verifiedPrice,
        string calldata verifiedPackaging,
        string calldata verifiedMetadataHash
    ) external onlyRole(ADMIN_ROLE) {
        batchManager.verifyBatchMetadata(batchId, verifiedPrice, verifiedPackaging, verifiedMetadataHash);
    }

    /**
     * @dev Forwarding function to check if batch metadata is verified
     */
    function isBatchMetadataVerified(uint256 batchId) external view returns (bool) {
        return batchManager.isBatchMetadataVerified(batchId);
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
    error WAGACoffeeTokenCore__BatchQuantityExceeded_mintBatch();
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

    // Basic ERC1155 token state only
    mapping(uint256 => string) public s_batchMetadata; // Token metadata URIs
    mapping(uint256 => bool) public batchCreated; // Track created batches (for ERC1155)
    mapping(uint256 => ProductType) public batchProductType; // Product type for each batch
    mapping(uint256 => string) public batchUnitWeight; // Unit weight specification
    uint256 public batchCounter; // Total batches created

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

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
    function setManagers(
        address _batchManager,
        address _zkManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        batchManager = IWAGABatchManager(_batchManager);
        zkManager = WAGAZKManager(_zkManager);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Create a new coffee batch with product type - delegates to BatchManager
     */
    function createBatchWithProductType(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string calldata origin,
        string calldata packagingInfo,
        string calldata unitWeight,
        ProductType productType,
        string calldata metadataURI
    ) external returns (uint256) {
        // Role validation based on product type
        if (productType == ProductType.RETAIL_BAGS) {
            require(hasRole(ADMIN_ROLE, msg.sender), "Admin role required for retail bags");
        } else if (productType == ProductType.GREEN_BEANS) {
            require(hasRole(COOPERATIVE_ROLE, msg.sender), "Cooperative role required for green beans");
        } else if (productType == ProductType.ROASTED_BEANS) {
            require(hasRole(ROASTER_ROLE, msg.sender), "Roaster role required for roasted beans");
        }

        // Generate new batch ID
        uint256 batchId = ++batchCounter;

        // Store product type information
        batchCreated[batchId] = true;
        batchProductType[batchId] = productType;
        batchUnitWeight[batchId] = unitWeight;
        s_batchMetadata[batchId] = metadataURI;

        // Delegate detailed batch creation to BatchManager
        batchManager.createBatchInfo(
            batchId,
            productionDate,
            expiryDate,
            quantity,
            pricePerUnit,
            origin,
            packagingInfo,
            IPrivacyLayer.PrivacyLevel(1) // Use correct enum value for MODERATE
        );

        emit BatchCreated(batchId, msg.sender, quantity, pricePerUnit, metadataURI);
        return batchId;
    }

    /**
     * @dev Create a new coffee batch - delegates to BatchManager (backward compatibility)
     */
    function createBatch(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string calldata origin,
        string calldata packagingInfo,
        string calldata metadataURI
    ) external onlyRole(PROCESSOR_ROLE) returns (uint256) {
        // Generate new batch ID
        uint256 batchId = ++batchCounter;

        // Mark batch as created in ERC1155 system (backward compatibility)
        batchCreated[batchId] = true;
        batchProductType[batchId] = ProductType.RETAIL_BAGS; // Default for backward compatibility
        batchUnitWeight[batchId] = packagingInfo; // Use packaging info as unit weight
        s_batchMetadata[batchId] = metadataURI;

        // Delegate detailed batch creation to BatchManager
        batchManager.createBatchInfo(
            batchId,
            productionDate,
            expiryDate,
            quantity,
            pricePerUnit,
            origin,
            packagingInfo,
            IPrivacyLayer.PrivacyLevel(1) // Use correct enum value for MODERATE
        );

        emit BatchCreated(batchId, msg.sender, quantity, pricePerUnit, metadataURI);
        return batchId;
    }

    /**
     * @dev Simplified batch creation for testing
     */
    function createBatchSimple(
        uint256 quantity,
        uint256 pricePerUnit,
        string calldata metadataURI
    ) external onlyRole(PROCESSOR_ROLE) returns (uint256) {
        // Validate inputs
        if (quantity == 0) {
            revert WAGACoffeeTokenCore__InvalidQuantity_createBatch();
        }
        if (pricePerUnit == 0) {
            revert WAGACoffeeTokenCore__InvalidPrice_createBatch();
        }

        // Create batch ID
        uint256 batchId = ++batchCounter;
        
        // Check if batch already exists
        if (batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchAlreadyExists_createBatch();
        }

        // Mark batch as created
        batchCreated[batchId] = true;

        // Delegate detailed batch creation to BatchManager if available
        if (address(batchManager) != address(0)) {
            batchManager.createBatchInfoWithCaller(
                msg.sender, // Pass the original caller
                batchId,
                block.timestamp, // productionDate
                block.timestamp + 365 days, // expiryDate
                quantity,
                pricePerUnit,
                "Origin TBD", // origin
                "Standard", // packagingInfo
                IPrivacyLayer.PrivacyLevel(1) // Use integer cast for privacy level
            );
        }

        // Set the batch as active in our view functions
        s_isActiveBatch[batchId] = true;

        emit BatchCreated(batchId, msg.sender, quantity, pricePerUnit, metadataURI);
        return batchId;
    }

    /**
     * @dev Mint tokens for verified batch (called by ProofOfReserve)
     */
    function mintBatch(
        address to,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_mintBatch();
        }
        
        // Get batch info from shared state
        BatchInfo memory batch = s_batchInfo[batchId];
        if (batch.mintedQuantity + amount > batch.quantity) {
            revert WAGACoffeeTokenCore__BatchQuantityExceeded_mintBatch();
        }

        // Update minted quantity in shared state
        s_batchInfo[batchId].mintedQuantity += amount;

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
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_burnForRedemption();
        }
        
        uint256 balance = balanceOf(from, batchId);
        if (balance < amount) {
            revert WAGACoffeeTokenCore__InsufficientBatchQuantity_burnForRedemption();
        }

        // Burn ERC1155 tokens
        _burn(from, batchId, amount);
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
     * @dev Check if batch exists (required by BatchManager)
     */
    function isBatchCreated(uint256 batchId) public view override returns (bool) {
        return batchCreated[batchId];
    }

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



    /**
     * @dev Get batch information with product type
     */
    function getBatchWithProductType(uint256 batchId) external view returns (
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin,
        string memory packagingInfo,
        address creator,
        uint256 timestamp,
        ProductType productType,
        string memory unitWeight
    ) {
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_mintBatch();
        }

        (
            productionDate,
            expiryDate,
            quantity,
            pricePerUnit,
            origin,
            packagingInfo,
            creator,
            timestamp
        ) = batchManager.getBatchInfo(batchId);

        productType = batchProductType[batchId];
        unitWeight = batchUnitWeight[batchId];
    }

    /**
     * @dev Get product type for a batch
     */
    function getBatchProductType(uint256 batchId) external view returns (ProductType) {
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_mintBatch();
        }
        return batchProductType[batchId];
    }

    /**
     * @dev Get unit weight for a batch
     */
    function getBatchUnitWeight(uint256 batchId) external view returns (string memory) {
        if (!batchCreated[batchId]) {
            revert WAGACoffeeTokenCore__BatchDoesNotExist_mintBatch();
        }
        return batchUnitWeight[batchId];
    }
}
