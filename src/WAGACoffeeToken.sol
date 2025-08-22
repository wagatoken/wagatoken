// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {WAGAViewFunctions} from "./WAGAViewFunctions.sol";
import {WAGACoffeeRedemption} from "./WAGACoffeeRedemption.sol";

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
    // AccessControl,
    ERC1155Supply,
    ERC1155URIStorage,
    WAGAConfigManager,
    WAGAViewFunctions
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
    error WAGACoffeeToken__BatchDoesNotExist_updateBatchLastVerifiedTimestamp();
    error WAGACoffeeToken__BatchDoesNotExist_resetBatchVerificationFlags();
    error WAGACoffeeToken__BatchHasActiveRedemptions_resetBatchVerificationFlags();
    error WAGACoffeeToken__ContractNotInitialized();
    error WAGACoffeeToken__ContractAlreadyInitialized_initialize();

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              
    /* -------------------------------------------------------------------------- */

    // Reference to redemption contract for safety checks
    address private s_redemptionContract;

    // Initialization flag
    bool public isInitialized;

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

    event TokensMinted(
        address indexed to,
        uint256 indexed batchId,
        uint256 amount
    );

    /* -------------------------------------------------------------------------- */
    /*                                  MODIFIERS                                 */
    /* -------------------------------------------------------------------------- */

    modifier onlyInitialized() {
        if (!isInitialized) {
            revert WAGACoffeeToken__ContractNotInitialized();
        }
        _;
    }

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
     * @notice Initializes the contract with zero addresses for two-phase deployment
     */
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Grant DEFAULT_ADMIN_ROLE first
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Second phase initialization with all contract addresses
     * @param _inventoryManager Address for inventory management
     * @param _redemptionContract Address for token redemption
     * @param _proofOfReserveManager Address for proof of reserve operations
     */
    function initialize(
        address _inventoryManager,
        address _redemptionContract,
        address _proofOfReserveManager
    ) external onlyRole(ADMIN_ROLE) {
        if (isInitialized) {
            revert WAGACoffeeToken__ContractAlreadyInitialized_initialize();
        }

        setInventoryManager(_inventoryManager);
        setRedemptionManager(_redemptionContract);
        setProofOfReserveManager(_proofOfReserveManager);
        _grantRole(MINTER_ROLE, _proofOfReserveManager);
        _grantRole(REDEMPTION_ROLE, _redemptionContract);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(FULFILLER_ROLE, msg.sender);

        // Initialize the redemption contract reference
        s_redemptionContract = _redemptionContract;

        isInitialized = true;
    }

    /* -------------------------------------------------------------------------- */
    /*                              EXTERNAL FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

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
        uint256 quantity,
        uint256 pricePerUnit,
        string memory packagingInfo,
        string memory metadataHash
    ) external onlyRole(ADMIN_ROLE) onlyInitialized returns (uint256) {
        // uint256 batchId = _nextBatchId++;
        uint256 batchId = _nextBatchId;
        _nextBatchId++; // Increment after assignment

        if (expiryDate == 0 || pricePerUnit == 0 || productionDate == 0 || quantity == 0) {
            revert WAGACoffeeToken__ZeroMetaDataValues_createBatch();
        }
        // Fixed: Allow past production dates for already produced coffee
        if (productionDate <= block.timestamp || expiryDate <= productionDate) {
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
            quantity: quantity, // Number of coffee bags in batch
            pricePerUnit: pricePerUnit,
            packagingInfo: packagingInfo,
            metadataHash: metadataHash,
            isMetadataVerified: false,
            lastVerifiedTimestamp: 0 // Initialize to zero
        });

        _setURI(batchId, ipfsUri);
        emit BatchCreated(batchId, ipfsUri);

        _addToActiveBatches(batchId);
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

        uint256 currentQuantity = s_batchInfo[batchId].quantity;

        if (newQuantity == 0 && currentQuantity > 0) {
            _removeFromActiveBatches(batchId);
        } else if (newQuantity > 0 && currentQuantity == 0) {
            _addToActiveBatches(batchId);
        }

        s_batchInfo[batchId].quantity = newQuantity;
        emit InventoryUpdated(batchId, newQuantity);
    }
    /**
     * @notice Updates the last verified timestamp for a batch
     * @param batchId ID of the batch to update
     * @param timestamp New last verified timestamp
     */

    function updateBatchLastVerifiedTimestamp(
        uint256 batchId,
        uint256 timestamp
    ) external onlyRole(PROOF_OF_RESERVE_ROLE) {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchLastVerifiedTimestamp();
        }
        s_batchInfo[batchId].lastVerifiedTimestamp = timestamp;
    }

    /**
     * @notice Safely resets batch verification flags before inventory verification
     * @param batchId ID of the batch to reset flags for
     * @dev Only resets flags if batch has no active redemption requests
     */
    function resetBatchVerificationFlags(
        uint256 batchId
    ) external onlyInventoryManagerOrProofOfReserve onlyInitialized {
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_resetBatchVerificationFlags();
        }

        // Check if batch has active redemptions before resetting flags
        if (s_redemptionContract != address(0)) {
            try
                WAGACoffeeRedemption(s_redemptionContract)
                    .hasPendingRedemptions(batchId)
            returns (bool hasPending) {
                if (hasPending) {
                    revert WAGACoffeeToken__BatchHasActiveRedemptions_resetBatchVerificationFlags();
                }
            } catch {
                // If call fails, proceed with caution - don't reset flags
                revert WAGACoffeeToken__BatchHasActiveRedemptions_resetBatchVerificationFlags();
            }
        }

        s_batchInfo[batchId].isVerified = false;
        s_batchInfo[batchId].isMetadataVerified = false;

        // Emit event for tracking
        emit BatchStatusUpdated(batchId, false);
    }

    /**
     * @notice Updates the redemption contract address for safety checks
     * @param _redemptionContract New redemption contract address
     */
    function updateRedemptionContract(
        address _redemptionContract
    ) external onlyRole(ADMIN_ROLE) {
        s_redemptionContract = _redemptionContract;
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
    ) external onlyInventoryManagerOrProofOfReserve onlyInitialized {
        BatchInfo storage info = s_batchInfo[batchId];
        if (!isBatchCreated(batchId)) {
            revert WAGACoffeeToken__BatchDoesNotExist_verifyBatchMetadata();
        }
        // Fixed: Use OR logic - fail if ANY field mismatches
        if (
            info.pricePerUnit != verifiedPrice ||
            keccak256(bytes(info.packagingInfo)) !=
            keccak256(bytes(verifiedPackaging)) ||
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
        // @Yohannes not checking if batch is created
        if (!s_isActiveBatch[batchId]) {
            uint256 productionDate_1 = s_batchInfo[batchId].productionDate;
            uint256 expiryDate_1 = s_batchInfo[batchId].expiryDate;
            revert WAGACoffeeToken__BatchIsInactive_markBatchExpired(
                productionDate_1,
                expiryDate_1
            );
        }

        _removeFromActiveBatches(batchId);
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
            s_batchInfo[batchId].quantity == 0 &&
            !s_isActiveBatch[batchId]
        ) {
            _addToActiveBatches(batchId);
        }

        s_batchInfo[batchId].quantity += amount;
        _mint(to, batchId, amount, "");
        emit TokensMinted(to, batchId, amount);
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
        s_batchInfo[batchId].quantity -= amount;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   PUBLIC FUNCTIONS                         */
    /* -------------------------------------------------------------------------- */

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

    // /**
    //  * @notice Checks interface support
    //  * @param interfaceId Interface identifier
    //  * @return True if interface is supported
    //  */
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
    function _addToActiveBatches(uint256 batchId) internal {
        if (!s_isActiveBatch[batchId]) {
            s_isActiveBatch[batchId] = true;
            s_activeBatchIndex[batchId] = s_activeBatchIds.length;
            s_activeBatchIds.push(batchId);
        }
    }

    /**
     * @dev Removes a batch from the active tracking system using swap-and-pop
     * @param batchId ID of batch to remove
     */
    function _removeFromActiveBatches(uint256 batchId) internal {
        if (s_isActiveBatch[batchId]) {
            // Use the s_activeBatchIndex mapping to get the index of the batch to remove from the s_activeBatchIds Array. The s_activeBatchIndex mapping is used to track the index of each batch in the s_activeBatchIds array.
            uint256 index = s_activeBatchIndex[batchId];
            // Get the index of the last element (batch) in the s_activeBatchIds array.
            uint256 lastIndex = s_activeBatchIds.length - 1;
            // Check if the index to remove is not the last index.
            if (index != lastIndex) {
                // Get the last batch ID from the s_activeBatchIds array and swap it with the batch to remove.
                uint256 lastBatchId = s_activeBatchIds[lastIndex];
                s_activeBatchIds[index] = lastBatchId; // This is how you replace the value of an array at a specific index.
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
