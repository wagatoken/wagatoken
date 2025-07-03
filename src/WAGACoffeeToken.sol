// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title WAGACoffeeToken
 * @author WAGA Coffee Team
 * @notice ERC1155 token contract for WAGA Coffee batch-based token system
 * @dev Implements role-based access control, supply tracking, and optimized active batch management
 *
 * Each token ID (batchId) represents a unique coffee batch with production details,
 * verification status, and metadata. Features gas-efficient active batch tracking
 * for scalable batch management operations.
 */
contract WAGACoffeeToken is
    ERC1155,
    AccessControl,
    ERC1155Supply,
    ERC1155URIStorage
{
    using Strings for uint256;

    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    error WAGACoffeeToken__InvalidInventoryManagerAddress_setInventoryManager();
    error WAGACoffeeToken__InvalidredemptionContractAddress_setRedemptionContract();
    error WAGACoffeeToken__InvalidIPFSUri_createBatch();
    error WAGACoffeeToken__InvalidPackagingSize_createBatch();
    error WAGACoffeeToken__InvalidProductionDate_createBatch();
    error WAGACoffeeToken__ZeroMetaDataValues_createBatch();
    error WAGACoffeeToken__InvalidBatchDates_createBatch();
    error WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
    error WAGACoffeeToken__BatchDoesNotExist_updateInventory();
    error WAGACoffeeToken__BatchDoesNotExist_setPricePerUint();
    error WAGACoffeeToken__BatchIsInactive_setPricePerUint(
        uint256 productionDate,
        uint256 expiryDate
    );
    error WAGACoffeeToken__BatchDoesNotExist_verifyBatchMetadata();
    error WAGACoffeeToken__MetadataMisMatch_verifyBatchMetaData();
    error WAGACoffeeToken__UnauthorizedCaller_updateBatchStatus(address caller);
    error WAGACoffeeToken__UnauthorizedCaller_verifyBatchMetadata(
        address caller
    );
    error WAGACoffeeToken__BatchIsInactive_markBatchExpired(
        uint256 productionDate,
        uint256 expiryDate
    );
    error WAGACoffeeToken__BatchDoesNotExist_mintBatch();
    error WAGACoffeeToken__BatchNotVerified_mintBatch();
    error WAGACoffeeToken__BatchDoesNotExist_getBatchQuantity();

    /* -------------------------------------------------------------------------- */
    /*                              TYPE DECLARATIONS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Essential batch information stored on-chain
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @param isVerified Whether batch has been verified by Proof of Reserve Manager
     * @param currentQuantity Current available quantity of tokens for this batch
     * @param pricePerUnit Price per unit in wei
     * @param packagingInfo Must be "250g" or "500g"
     * @param metadataHash IPFS CID or SHA-256 hash of off-chain metadata
     * @param isMetadataVerified Whether metadata has been verified
     */
    struct BatchInfo {
        uint256 productionDate;
        uint256 expiryDate;
        bool isVerified;
        uint256 currentQuantity;
        uint256 pricePerUnit;
        string packagingInfo;
        string metadataHash;
        bool isMetadataVerified;
    }

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant INVENTORY_MANAGER_ROLE =
        keccak256("INVENTORY_MANAGER_ROLE");
    bytes32 public constant REDEMPTION_ROLE = keccak256("REDEMPTION_ROLE");
    bytes32 public constant PROOF_OF_RESERVE_ROLE =
        keccak256("PROOF_OF_RESERVE_ROLE");

    // Contract manager addresses
    address private s_inventoryManager;
    address private s_redemptionManager;
    address private s_proofOfReserveManager;

    // Batch information storage
    mapping(uint256 batchId => BatchInfo) public s_batchInfo;

    // Optimized active batch tracking system
    mapping(uint256 => bool) private s_isActiveBatch; // O(1) status lookup
    uint256[] private s_activeBatchIds; // Direct enumeration array
    mapping(uint256 batchId => uint256 index) private s_activeBatchIndex; // O(1) removal support

    // Historical tracking
    uint256[] public allBatchIds;
    uint256 private _nextBatchId = 2025000001; // Start from 1 for batch IDs

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event BatchCreated(uint256 indexed batchId, string ipfsUri);
    event BatchStatusUpdated(uint256 indexed batchId, bool isVerified);
    event InventoryUpdated(uint256 indexed batchId, uint256 newQuantity);
    event BatchExpired(
        uint256 indexed batchId,
        uint256 productionDate,
        uint256 expiryDate
    );
    event BatchPriceUpdated(
        uint256 indexed batchId,
        uint256 oldPrice,
        uint256 newPrice
    );
    event BatchMetadataVerified(uint256 indexed batchId);
    event InventoryManagerUpdated(
        address indexed newInventoryManager,
        address indexed updatedBy
    );
    event RedemptionMangerUpdated(
        address indexed newRedemptionManager,
        address indexed updatedBy
    );
    event ProofOfReserveManagerUpdated(
        address indexed newProofOfReserveManager,
        address indexed updatedBy
    );

    /* -------------------------------------------------------------------------- */
    /*                                  MODIFIERS                                 */
    /* -------------------------------------------------------------------------- */

    modifier onlyInventoryManagerOrProofOfReserve() {
        if (
            !hasRole(INVENTORY_MANAGER_ROLE, msg.sender) &&
            !hasRole(PROOF_OF_RESERVE_ROLE, msg.sender)
        ) {
            revert WAGACoffeeToken__UnauthorizedCaller_updateBatchStatus(
                msg.sender
            );
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                 CONSTRUCTOR                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Initializes the contract with manager addresses
     * @param _inventoryManager Address for inventory management
     * @param _redemptionContract Address for token redemption
     * @param _proofOfReserveManager Address for proof of reserve operations
     */
    constructor(
        address _inventoryManager,
        address _redemptionContract,
        address _proofOfReserveManager
    ) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, _proofOfReserveManager);
        setInventoryManager(_inventoryManager);
        setRedemptionManager(_redemptionContract);
        setProofOfReserveManager(_proofOfReserveManager);
    }

    /* -------------------------------------------------------------------------- */
    /*                             EXTERNAL FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */
    // below are a subset of public functions placed here for convenience
    /**
     * @notice Sets or updates the inventory manager address
     * @param _inventoryManager New inventory manager address
     */
    function setInventoryManager(
        address _inventoryManager
    ) public onlyRole(ADMIN_ROLE) {
        if (_inventoryManager == address(0)) {
            revert WAGACoffeeToken__InvalidInventoryManagerAddress_setInventoryManager();
        }
        if (s_inventoryManager != address(0)) {
            _revokeRole(INVENTORY_MANAGER_ROLE, s_inventoryManager);
        }
        s_inventoryManager = _inventoryManager;
        _grantRole(INVENTORY_MANAGER_ROLE, _inventoryManager);
        emit InventoryManagerUpdated(_inventoryManager, msg.sender);
    }

    /**
     * @notice Sets or updates the redemption contract address
     * @param _redemptionContract New redemption contract address
     */
    function setRedemptionManager(
        address _redemptionContract
    ) public onlyRole(ADMIN_ROLE) {
        if (_redemptionContract == address(0)) {
            revert WAGACoffeeToken__InvalidredemptionContractAddress_setRedemptionContract();
        }
        if (s_redemptionManager != address(0)) {
            _revokeRole(REDEMPTION_ROLE, s_redemptionManager);
        }
        s_redemptionManager = _redemptionContract;
        _grantRole(REDEMPTION_ROLE, _redemptionContract);
        emit RedemptionMangerUpdated(_redemptionContract, msg.sender);
    }

    /**
     * @notice Sets or updates the proof of reserve manager address
     * @param _proofOfReserveManager New proof of reserve manager address
     */
    function setProofOfReserveManager(
        address _proofOfReserveManager
    ) public onlyRole(ADMIN_ROLE) {
        if (_proofOfReserveManager == address(0)) {
            revert WAGACoffeeToken__InvalidredemptionContractAddress_setRedemptionContract();
        }
        if (s_proofOfReserveManager != address(0)) {
            _revokeRole(PROOF_OF_RESERVE_ROLE, s_proofOfReserveManager);
        }
        s_proofOfReserveManager = _proofOfReserveManager;
        _grantRole(PROOF_OF_RESERVE_ROLE, _proofOfReserveManager);
        emit ProofOfReserveManagerUpdated(_proofOfReserveManager, msg.sender);
    }

    /**
     * @notice Creates a new coffee batch with metadata
     * @param ipfsUri IPFS URI for batch metadata
     * @param productionDate Batch production timestamp
     * @param expiryDate Batch expiry timestamp
     * @param pricePerUnit Price per unit in wei
     * @param packagingInfo Must be "250g" or "500g"
     * @param metadataHash Hash of off-chain metadata
     * @return batchId The newly created batch ID
     */
    function createBatch(
        string memory ipfsUri,
        uint256 productionDate,
        uint256 expiryDate,
        uint256 pricePerUnit,
        string memory packagingInfo,
        string memory metadataHash
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        uint256 batchId = _nextBatchId++;

        if (expiryDate == 0 || pricePerUnit == 0 || productionDate == 0) {
            revert WAGACoffeeToken__ZeroMetaDataValues_createBatch();
        }
        if (productionDate > block.timestamp || expiryDate <= block.timestamp) {
            revert WAGACoffeeToken__InvalidBatchDates_createBatch();
        }
        if (
            bytes(ipfsUri).length == 0 ||
            bytes(packagingInfo).length == 0 ||
            bytes(metadataHash).length == 0
        ) {
            revert WAGACoffeeToken__InvalidIPFSUri_createBatch();
        }
        if (
            keccak256(bytes(packagingInfo)) != keccak256("250g") &&
            keccak256(bytes(packagingInfo)) != keccak256("500g")
        ) {
            revert WAGACoffeeToken__InvalidPackagingSize_createBatch();
        }

        s_batchInfo[batchId] = BatchInfo({
            productionDate: productionDate,
            expiryDate: expiryDate,
            isVerified: false,
            currentQuantity: 0,
            pricePerUnit: pricePerUnit,
            packagingInfo: packagingInfo,
            metadataHash: metadataHash,
            isMetadataVerified: false
        });

        _setURI(batchId, ipfsUri);
        emit BatchCreated(batchId, ipfsUri);

        addToActiveBatches(batchId);
        allBatchIds.push(batchId);

        return batchId;
    }

    /**
     * @notice Updates batch verification status
     * @param batchId ID of the batch to update
     * @param isVerified New verification status
     */
    function updateBatchStatus(
        uint256 batchId,
        bool isVerified
    ) external onlyInventoryManagerOrProofOfReserve {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        s_batchInfo[batchId].isVerified = isVerified;
        emit BatchStatusUpdated(batchId, isVerified);
    }

    /**
     * @notice Updates batch inventory quantity
     * @param batchId ID of the batch to update
     * @param newQuantity New quantity value
     */
    function updateInventory(
        uint256 batchId,
        uint256 newQuantity
    ) external onlyInventoryManagerOrProofOfReserve {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateInventory();
        }

        uint256 currentQuantity = s_batchInfo[batchId].currentQuantity;

        if (newQuantity == 0 && currentQuantity > 0) {
            removeFromActiveBatches(batchId);
        } else if (newQuantity > 0 && currentQuantity == 0) {
            addToActiveBatches(batchId);
        }

        s_batchInfo[batchId].currentQuantity = newQuantity;
        emit InventoryUpdated(batchId, newQuantity);
    }

    /**
     * @notice Sets new price per unit for a batch
     * @param batchId ID of the batch to update
     * @param newPrice New price per unit in wei
     */
    function setPricePerUnit(
        uint256 batchId,
        uint256 newPrice
    ) external onlyRole(ADMIN_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_setPricePerUint();
        }
        if (!s_isActiveBatch[batchId]) {
            uint256 productionDate = s_batchInfo[batchId].productionDate;
            uint256 expiryDate = s_batchInfo[batchId].expiryDate;
            revert WAGACoffeeToken__BatchIsInactive_setPricePerUint(
                productionDate,
                expiryDate
            );
        }

        uint256 oldPrice = s_batchInfo[batchId].pricePerUnit;
        s_batchInfo[batchId].pricePerUnit = newPrice;
        emit BatchPriceUpdated(batchId, oldPrice, newPrice);
    }

    // function setCurrentQuantity(
    //     uint256 batchId,
    //     uint256 newQuantity
    // ) external onlyRole(INVENTORY_MANAGER_ROLE) {
    //     if (!isBatchCreated(batchId)) {
    //         revert WAGACoffeeToken__BatchDoesNotExist_updateInventory();
    //     }

    //     s_batchInfo[batchId].currentQuantity = newQuantity;
    //     emit InventoryUpdated(batchId, newQuantity);
    // }

    /**
     * @notice Verifies batch metadata against expected values
     * @param batchId ID of the batch to verify
     * @param verifiedPrice Expected price per unit
     * @param verifiedPackaging Expected packaging info
     * @param verifiedMetadataHash Expected metadata hash
     */
    function verifyBatchMetadata(
        uint256 batchId,
        uint256 verifiedPrice,
        string memory verifiedPackaging,
        string memory verifiedMetadataHash
    ) external onlyInventoryManagerOrProofOfReserve {
        BatchInfo storage info = s_batchInfo[batchId];
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_verifyBatchMetadata();
        }
        if (
            info.pricePerUnit != verifiedPrice &&
            keccak256(bytes(info.packagingInfo)) !=
            keccak256(bytes(verifiedPackaging)) &&
            keccak256(bytes(info.metadataHash)) !=
            keccak256(bytes(verifiedMetadataHash))
        ) {
            revert WAGACoffeeToken__MetadataMisMatch_verifyBatchMetaData();
        }
        info.isMetadataVerified = true;
        emit BatchMetadataVerified(batchId);
    }

    /**
     * @notice Marks a batch as expired
     * @param batchId ID of the batch to expire
     */
    function markBatchExpired(
        uint256 batchId
    ) external onlyRole(INVENTORY_MANAGER_ROLE) {
        if (!s_isActiveBatch[batchId]) {
            uint256 productionDate_1 = s_batchInfo[batchId].productionDate;
            uint256 expiryDate_1 = s_batchInfo[batchId].expiryDate;
            revert WAGACoffeeToken__BatchIsInactive_markBatchExpired(
                productionDate_1,
                expiryDate_1
            );
        }

        removeFromActiveBatches(batchId);
        uint256 productionDate = s_batchInfo[batchId].productionDate;
        uint256 expiryDate = s_batchInfo[batchId].expiryDate;
        emit BatchExpired(batchId, productionDate, expiryDate);
    }

    /**
     * @notice Mints tokens for a verified batch
     * @param to Address to receive minted tokens
     * @param batchId ID of the batch to mint from
     * @param amount Number of tokens to mint
     */
    function mintBatch(
        address to,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_mintBatch();
        }
        if (!s_batchInfo[batchId].isVerified) {
            revert WAGACoffeeToken__BatchNotVerified_mintBatch();
        }

        if (
            s_batchInfo[batchId].currentQuantity == 0 &&
            !s_isActiveBatch[batchId]
        ) {
            addToActiveBatches(batchId);
        }

        s_batchInfo[batchId].currentQuantity += amount;
        _mint(to, batchId, amount, "");
    }

    /**
     * @notice Burns tokens during redemption process
     * @param account Address to burn tokens from
     * @param batchId ID of the batch to burn from
     * @param amount Number of tokens to burn
     */
    function burnForRedemption(
        address account,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(REDEMPTION_ROLE) {
        _burn(account, batchId, amount);
        s_batchInfo[batchId].currentQuantity -= amount;
    }

    /* -------------------------------------------------------------------------- */
    /*                           EXTERNAL VIEW FUNCTIONS                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Returns all currently active batch IDs
     * @return Array of active batch IDs
     */
    function getActiveBatchIds() external view returns (uint256[] memory) {
        return s_activeBatchIds;
    }

    /**
     * @notice Returns paginated active batch IDs
     * @param offset Starting index for pagination
     * @param limit Maximum number of IDs to return
     * @return batchIds Array of batch IDs for requested page
     * @return hasMore Whether more pages are available
     */
    function getActiveBatchIdsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory batchIds, bool hasMore) {
        uint256 totalCount = s_activeBatchIds.length;
        if (offset >= totalCount) {
            return (new uint256[](0), false);
        }

        uint256 end = offset + limit;
        if (end > totalCount) {
            end = totalCount;
        }

        batchIds = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            batchIds[i - offset] = s_activeBatchIds[i];
        }

        hasMore = end < totalCount;
    }

    /**
     * @notice Returns the count of active batches
     * @return Number of currently active batches
     */
    function getActiveBatchCount() external view returns (uint256) {
        return s_activeBatchIds.length;
    }

    /**
     * @notice Returns complete batch information
     * @param batchId ID of the batch to query
     * @return productionDate Batch production timestamp
     * @return expiryDate Batch expiry timestamp
     * @return isVerified Whether batch is verified
     * @return currentQuantity Current quantity available
     * @return pricePerUnit Price per unit in wei
     * @return packagingInfo Packaging size information
     * @return metadataHash Hash of off-chain metadata
     * @return isMetadataVerified Whether metadata is verified
     */
    function getbatchInfo(
        uint256 batchId
    )
        external
        view
        returns (
            uint256 productionDate,
            uint256 expiryDate,
            bool isVerified,
            uint256 currentQuantity,
            uint256 pricePerUnit,
            string memory packagingInfo,
            string memory metadataHash,
            bool isMetadataVerified
        )
    {
        BatchInfo storage info = s_batchInfo[batchId];
        return (
            info.productionDate,
            info.expiryDate,
            info.isVerified,
            info.currentQuantity,
            info.pricePerUnit,
            info.packagingInfo,
            info.metadataHash,
            info.isMetadataVerified
        );
    }

    /**
     * @notice Checks if a batch is currently active
     * @param batchId ID of the batch to check
     * @return True if batch is active
     */
    function isBatchActive(uint256 batchId) external view returns (bool) {
        return s_isActiveBatch[batchId];
    }

    /**
     * @notice Returns current quantity for a batch
     * @param batchId ID of the batch to query
     * @return Current quantity available
     */
    function getBatchQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_getBatchQuantity();
        }
        return s_batchInfo[batchId].currentQuantity;
    }

    /**
     * @notice Returns the next batch ID that will be assigned
     * @return Next batch ID
     */
    function getNextBatchId() external view returns (uint256) {
        return _nextBatchId;
    }

    /**
     * @notice Returns the inventory manager address
     * @return Current inventory manager address
     */
    function getInventoryManager() external view returns (address) {
        return s_inventoryManager;
    }

    /**
     * @notice Returns the redemption manager address
     * @return Current redemption manager address
     */
    function getRedemptionManager() external view returns (address) {
        return s_redemptionManager;
    }

    /* -------------------------------------------------------------------------- */
    /*                              PUBLIC FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Checks if a batch has been created
     * @param batchId ID of the batch to check
     * @return True if batch exists
     */
    function isBatchCreated(uint256 batchId) public view returns (bool) {
        return s_batchInfo[batchId].productionDate != 0;
    }

    /**
     * @notice Returns the URI for a token ID
     * @param tokenId Token ID to query
     * @return URI containing token metadata
     */
    function uri(
        uint256 tokenId
    ) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return ERC1155URIStorage.uri(tokenId);
    }

    /**
     * @notice Checks interface support
     * @param interfaceId Interface identifier
     * @return True if interface is supported
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /* -------------------------------------------------------------------------- */
    /*                             INTERNAL FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Adds a batch to the active tracking system
     * @param batchId ID of batch to add
     */
    function addToActiveBatches(uint256 batchId) internal {
        if (!s_isActiveBatch[batchId]) {
            s_isActiveBatch[batchId] = true;
            s_activeBatchIndex[batchId] = s_activeBatchIds.length;
            s_activeBatchIds.push(batchId); // This is how you add a new element to the array
        }
    }

    // // Optimized active batch tracking system
    // mapping(uint256 => bool) private s_isActiveBatch; // O(1) status lookup
    // uint256[] private s_activeBatchIds; // Direct enumeration array
    // mapping(uint256 batchId => uint256 index) private s_activeBatchIndex; // O(1) removal support

    /**
     * @dev Removes a batch from the active tracking system using swap-and-pop
     * @param batchId ID of batch to remove
     */
    function removeFromActiveBatches(uint256 batchId) internal {
        if (s_isActiveBatch[batchId]) {
            // Use the s_activeBatchIndex mapping to get the index of the batch to remove from the s_activeBatchIds Array. The s_activeBatchIndex mapping is used to track the index of each batch in the s_activeBatchIds array.
            uint256 index = s_activeBatchIndex[batchId];
            // Get the index of the last element (batch) in the s_activeBatchIds array.
            uint256 lastIndex = s_activeBatchIds.length - 1;
            // Check if the index to remove is not the last index.
            if (index != lastIndex) {
                // Get the last batch ID from the s_activeBatchIds array and swap it with the batch to remove.
                uint256 lastBatchId = s_activeBatchIds[lastIndex];
                s_activeBatchIds[index] = lastBatchId; // This is how you relace the value of an array at a specific index.
                // Update the index mapping for the last batch ID to point to the index of the removed batch. We need the index mapping to point to the correct index in the s_activeBatchIds array after the swap.
                s_activeBatchIndex[lastBatchId] = index;
            }

            // uint256[] private numbers = [1, 2, 3, 4, 5] 
            // numbers[1] = 5; // This replaces the value at index 1 with 5



            s_activeBatchIds.pop();
            delete s_isActiveBatch[batchId];
            delete s_activeBatchIndex[batchId];
        }
    }

    /**
     * @dev Updates token balances - required override for ERC1155Supply
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
