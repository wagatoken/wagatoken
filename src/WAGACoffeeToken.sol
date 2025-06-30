// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// review ended at getActiveBatchIds, line 354
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol"; // Track Supply per Id
import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol"; // Store custom metadata URIs
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol"; // String conversion utilities

/**
 * @title WAGACoffeeToken
 * @dev ERC1155 token contract for WAGA Coffee that implements a batch-based coffee token system
 * with role-based access control, supply tracking, and URI storage capabilities.
 *
 * This contract manages coffee batches as ERC1155 tokens, where each token ID (batchId) represents a unique batch
 * of coffee with its own metadata, production details, and verification status.
 */
contract WAGACoffeeToken is
    ERC1155,
    AccessControl,
    ERC1155Supply,
    ERC1155URIStorage
{
    using Strings for uint256;

    // Custom Errors
    error WAGACoffeeToken__InvalidInventoryManagerAddress_setInventoryManager();
    error WAGACoffeeToken__InvalidredemptionContractAddress_setRedemptionContract();
    error WAGACoffeeToken__InvalidIPFSUri_createBatch();
    error WAGACoffeeToken__InvalidPackagingSize_createBatch();
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
    error WAGACoffeeToken__UnauthorizedCaller_verifyBatchMetadata(address caller);

    // Role definitions for access control
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // Proof of Reserve Contract
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant INVENTORY_MANAGER_ROLE =
        keccak256("INVENTORY_MANAGER_ROLE");
    bytes32 public constant REDEMPTION_ROLE = keccak256("REDEMPTION_ROLE");
    bytes32 public constant PROOF_OF_RESERVE_ROLE = keccak256("PROOF_OF_RESERVE_ROLE");

    // Addresses for inventory manager and redemption contract
    address private s_inventoryManager;
    address private s_redemptionManager;
    address private s_proofOfReserveManager;

    /**
     * @dev Struct containing essential batch information stored on-chain
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @param isVerified Whether the batch has been verified by the inventory manager (Proof of Reserve Manager instead - check)
     * @param currentQuantity Current available quantity of tokens for this batch
     * @param pricePerUnit Price per unit (e.g., per bag), in wei or stable unit
     * @param packagingInfo Limited to "250g" or "500g"
     * @param metadataHash Hash of the off-chain metadata (e.g., SHA-256 or IPFS CID)
     * @param isMetadataVerified Whether metadata has been verified for this batch
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

    // Mappings for batch information and status
    mapping(uint256 batchId => BatchInfo) public batchInfo;
    mapping(uint256 batchId => bool) public activeBatches;

    // Array to track all batch IDs
    uint256[] public allBatchIds;

    // Counter for generating unique batch IDs
    uint256 private _nextBatchId;

    // Events for batch lifecycle
    event BatchCreated(uint256 indexed batchId, string ipfsUri);
    event BatchStatusUpdated(uint256 indexed batchId, bool isVerified);
    event InventoryUpdated(uint256 indexed batchId, uint256 newQuantity);
    event BatchExpired(uint256 indexed batchId);
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

    modifier onlyInventoryManagerOrProofOfReserve() {
        if (!hasRole(INVENTORY_MANAGER_ROLE, msg.sender) && !hasRole(PROOF_OF_RESERVE_ROLE, msg.sender)) {
            revert WAGACoffeeToken__UnauthorizedCaller_updateBatchStatus(msg.sender);
        }
        _;
    }

    /**
     * @dev Initializes the contract with the deployer as the default admin
     */
    constructor(
        address _inventoryManager,
        address _redemptionContract,
        address _proofOfReserveManager
    ) ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // @audit: Do we need two roles for the deployer?
        _grantRole(ADMIN_ROLE, msg.sender);
        setInventoryManager(_inventoryManager);
        setRedemptionManager(_redemptionContract);
        setProofOfReserveManager(_proofOfReserveManager);
    }

    /**
     * @dev Sets or updates the inventory manager address and grants appropriate role
     * @param _inventoryManager Address of the new inventory manager
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - New address cannot be zero address
     */
    function setInventoryManager(
        address _inventoryManager
    ) public onlyRole(ADMIN_ROLE) {
        // Check if the new address is valid
        // require(_inventoryManager != address(0), "Invalid address");
        if (_inventoryManager == address(0)) {
            revert WAGACoffeeToken__InvalidInventoryManagerAddress_setInventoryManager();
        }
        // Check if we already have an inventory manager set, if so, revoke their role
        if (s_inventoryManager != address(0)) {
            _revokeRole(INVENTORY_MANAGER_ROLE, s_inventoryManager);
        }
        // Effect: Set the new inventory manager address
        s_inventoryManager = _inventoryManager;
        _grantRole(INVENTORY_MANAGER_ROLE, _inventoryManager);
        emit InventoryManagerUpdated(_inventoryManager, msg.sender); // Emit an event for the update
    }

    /**
     * @dev Sets or updates the redemption contract address and grants appropriate role
     * @param _redemptionContract Address of the new redemption contract
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - New address cannot be zero address
     */
    function setRedemptionManager(
        address _redemptionContract
    ) public onlyRole(ADMIN_ROLE) {
        // Check if the new address is valid
        if (_redemptionContract == address(0)) {
            revert WAGACoffeeToken__InvalidredemptionContractAddress_setRedemptionContract();
        }
        // require(_redemptionContract != address(0), "Invalid address");
        // Check if we already have a redemption contract set, if so, revoke their role
        if (s_redemptionManager != address(0)) {
            _revokeRole(REDEMPTION_ROLE, s_redemptionManager);
        }
        // Effect: Set the new redemption contract address
        s_redemptionManager = _redemptionContract;
        _grantRole(REDEMPTION_ROLE, _redemptionContract);
        emit RedemptionMangerUpdated(_redemptionContract, msg.sender); // Emit an event for the update
    }



    /**
     * @dev Sets or updates the proof of reserve manager address and grants appropriate role
     * @param _proofOfReserveManager Address of the new proof of reserve manager
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - New address cannot be zero address
     */

    function setProofOfReserveManager(
        address _proofOfReserveManager
    ) public onlyRole(ADMIN_ROLE) {
        // Check if the new address is valid
        if (_proofOfReserveManager == address(0)) {
            revert WAGACoffeeToken__InvalidredemptionContractAddress_setRedemptionContract();
        }
        // Check if we already have a proof of reserve manager set, if so, revoke their role
        if (s_proofOfReserveManager != address(0)) {
            _revokeRole(PROOF_OF_RESERVE_ROLE, s_proofOfReserveManager);
        }
        // Effect: Set the new proof of reserve manager address
        s_proofOfReserveManager = _proofOfReserveManager;
        _grantRole(PROOF_OF_RESERVE_ROLE, _proofOfReserveManager);
    }

    /**
     * @dev Creates a new batch of coffee tokens with associated metadata
     * @param ipfsUri IPFS URI containing detailed batch metadata
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @param pricePerUnit Price per unit (e.g., per bag), in wei or stable unit
     * @param packagingInfo Limited to "250g" or "500g"
     * @param metadataHash Hash of the off-chain metadata (e.g., SHA-256 or IPFS CID)
     * @return batchId The ID of the newly created batch
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - IPFS URI must not be empty
     * - Packaging info must be either "250g" or "500g"
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
        // require(bytes(ipfsUri).length > 0, "IPFS URI cannot be empty");
        // Check if the IPFS URI is valid
        if (bytes(ipfsUri).length <= 0) {
            revert WAGACoffeeToken__InvalidIPFSUri_createBatch();
        }
        // require(
        //     keccak256(bytes(packagingInfo)) == keccak256("250g") ||
        //         keccak256(bytes(packagingInfo)) == keccak256("500g"),
        //     "Invalid packaging size"
        // );
        // Check if the packaging info is valid
        if (
            keccak256(bytes(packagingInfo)) != keccak256("250g") ||
            keccak256(bytes(packagingInfo)) != keccak256("500g")
        ) {
            revert WAGACoffeeToken__InvalidPackagingSize_createBatch();
        }
        // Effect: Create the batch info struct and store it
        batchInfo[batchId] = BatchInfo({
            productionDate: productionDate,
            expiryDate: expiryDate,
            isVerified: false,
            currentQuantity: 0,
            pricePerUnit: pricePerUnit, // in wei
            packagingInfo: packagingInfo, // "250g" or "500g"
            metadataHash: metadataHash, // IPFS CID
            isMetadataVerified: false
        });
        // Set the URI for the batch token(s)
        _setURI(batchId, ipfsUri);
        emit BatchCreated(batchId, ipfsUri);
        // Track the batch as active though it is not verified yet
        activeBatches[batchId] = true; // @audit: What do we do when the batch is expired or sold out? Check Inventory manager
        allBatchIds.push(batchId); // @audit: What do we do when the batch is expired or sold out? Can we remove it from the array?
        return batchId;
    }

    /**
     * @dev Updates the verification status of a batch
     * @param batchId ID of the batch to update
     * @param isVerified New verification status
     * Requirements:
     * - Caller must have INVENTORY_MANAGER_ROLE
     * - Batch must exist
     */
    function updateBatchStatus(
        uint256 batchId,
        bool isVerified
    ) external onlyInventoryManagerOrProofOfReserve {
        if (batchInfo[batchId].productionDate == 0) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateBatchStatus();
        }
        batchInfo[batchId].isVerified = isVerified;
        emit BatchStatusUpdated(batchId, isVerified);
    }

    /**
     * @dev Updates the current inventory quantity for a batch
     * @param batchId ID of the batch to update
     * @param newQuantity New quantity value
     * Requirements:
     * - Caller must have INVENTORY_MANAGER_ROLE
     * - Batch must exist
     */
    function updateInventory(
        uint256 batchId,
        uint256 newQuantity
    ) external onlyRole(INVENTORY_MANAGER_ROLE) {
        // require(batchInfo[batchId].productionDate != 0, "Batch does not exist");
        // Check if the batch exists
        if (batchInfo[batchId].productionDate == 0) {
            revert WAGACoffeeToken__BatchDoesNotExist_updateInventory();
        }
        // Effect: Update the current quantity for the batch
        batchInfo[batchId].currentQuantity = newQuantity;
        // Emit an event to notify about the inventory update
        emit InventoryUpdated(batchId, newQuantity);
    }

    /**
     * @dev Sets a new price per unit for a batch
     * @param batchId ID of the batch to update
     * @param newPrice New price per unit
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - Batch must exist
     */
    function setPricePerUnit(
        uint256 batchId,
        uint256 newPrice
    ) external onlyRole(ADMIN_ROLE) {
        // require(batchInfo[batchId].productionDate != 0, "Batch does not exist");
        // Check if the batch exists
        uint256 productionDate = batchInfo[batchId].productionDate;
        uint256 expiryDate = batchInfo[batchId].expiryDate;

        if (activeBatches[batchId] == false) {
            revert WAGACoffeeToken__BatchIsInactive_setPricePerUint(
                productionDate,
                expiryDate
            );
        }
        // get the current price and update it
        uint256 oldPrice = batchInfo[batchId].pricePerUnit;
        batchInfo[batchId].pricePerUnit = newPrice;
        emit BatchPriceUpdated(batchId, oldPrice, newPrice);
    }

    /**
     * @dev Verifies batch metadata against expected values
     * @param batchId ID of the batch to verify
     * @param expectedPrice Expected price per unit
     * @param expectedPackaging Expected packaging info
     * @param expectedMetadataHash Expected metadata hash
     * Requirements:
     * - Caller must have INVENTORY_MANAGER_ROLE
     * - Batch must exist
     */
     // @audit: This function should probably not be restricted to the inventory manager but made public for distribution partners
    function verifyBatchMetadata(
        uint256 batchId,
        uint256 expectedPrice,
        string memory expectedPackaging,
        string memory expectedMetadataHash
    ) external onlyInventoryManagerOrProofOfReserve {
        BatchInfo storage info = batchInfo[batchId];
        if (info.productionDate == 0) {
            revert WAGACoffeeToken__BatchDoesNotExist_verifyBatchMetadata();
        }
        if (
            info.pricePerUnit != expectedPrice &&
            keccak256(bytes(info.packagingInfo)) != keccak256(bytes(expectedPackaging)) &&
            keccak256(bytes(info.metadataHash)) != keccak256(bytes(expectedMetadataHash))
        ) {
            revert WAGACoffeeToken__MetadataMisMatch_verifyBatchMetaData();
        }
        info.isMetadataVerified = true;
        emit BatchMetadataVerified(batchId);
    }

    /**
     * @dev Retrieves an array of all currently active batch IDs
     * @return uint256[] Array of active batch IDs
     */
     // @audit: Need to review the utility of this function as it may be gas intensive. Also, why do we have it as external view?
    function getActiveBatchIds() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allBatchIds.length; i++) {
            if (activeBatches[allBatchIds[i]]) {
                activeCount++;
            }
        }
        // uint256[] memory activeBatchIds = new uint256[](3);
        uint256[] memory activeBatchIds = new uint256[](activeCount); // determine size based on active count
        // Fill the activeBatchIds array with active batch IDs
        uint256 index = 0;
        for (uint256 i = 0; i < allBatchIds.length; i++) { //@audit: should be i < activeCount
            if (activeBatches[allBatchIds[i]]) {
                activeBatchIds[index] = allBatchIds[i];
                index++;
            }
        }

        return activeBatchIds;
    }

    /**
     * @dev Marks a batch as expired, preventing further operations
     * @param batchId ID of the batch to mark as expired
     * Requirements:
     * - Caller must have INVENTORY_MANAGER_ROLE
     * - Batch must be currently active
     */
    function markBatchExpired(
        uint256 batchId
    ) external onlyRole(INVENTORY_MANAGER_ROLE) {
        require(activeBatches[batchId], "Batch is not active");
        activeBatches[batchId] = false;
        emit BatchExpired(batchId);
    }

    /**
     * @dev Mints new tokens for a verified batch
     * @param to Address to receive the minted tokens
     * @param batchId ID of the batch to mint tokens for
     * @param amount Number of tokens to mint
     * Requirements:
     * - Caller must have MINTER_ROLE
     * - Batch must exist and be verified
     */
    function mintBatch(
        address to,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        require(batchInfo[batchId].productionDate != 0, "Batch does not exist");
        require(batchInfo[batchId].isVerified, "Batch is not verified");
        _mint(to, batchId, amount, "");
        batchInfo[batchId].currentQuantity += amount;
    }

    /**
     * @dev Burns tokens during redemption process
     * @param account Address to burn tokens from
     * @param batchId ID of the batch to burn tokens from
     * @param amount Number of tokens to burn
     * Requirements:
     * - Caller must have REDEMPTION_ROLE
     */
    function burnForRedemption(
        address account,
        uint256 batchId,
        uint256 amount
    ) external onlyRole(REDEMPTION_ROLE) {
        _burn(account, batchId, amount);
        batchInfo[batchId].currentQuantity -= amount;
    }

    /**
     * @dev Checks if a batch has been created
     * @param batchId ID of the batch to check
     * @return bool True if the batch exists, false otherwise
     */
    function isBatchCreated(uint256 batchId) external view returns (bool) {
        return batchInfo[batchId].productionDate != 0;
    }

    /**
     * @dev Returns the URI for a given token ID
     * @param tokenId ID of the token to query
     * @return string URI containing the token's metadata
     */
    function uri(
        uint256 tokenId
    ) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return ERC1155URIStorage.uri(tokenId);
    }

    /**
     * @dev Internal function to update token balances
     * Required override to handle both ERC1155 and ERC1155Supply functionality
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    /**
     * @dev Checks if the contract supports an interface
     * @param interfaceId Interface identifier to check
     * @return bool True if the interface is supported
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns the next batch ID that will be used
     * @return uint256 The next batch ID
     */
    function getNextBatchId() external view returns (uint256) {
        return _nextBatchId;
    }

    // getters
    function getInventoryManager() external view returns (address) {
        return s_inventoryManager;
    }
    function getRedemptionManager() external view returns (address) {
        return s_redemptionManager;
    }
}
