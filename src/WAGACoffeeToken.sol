// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {ERC1155URIStorage} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {WAGAProofOfReserve} from "./WAGAProofOfReserve.sol";

/**
 * @title WAGACoffeeToken
 * @dev ERC1155 token contract for WAGA Coffee that implements a batch-based coffee token system
 * with role-based access control, supply tracking, and URI storage capabilities.
 * 
 * This contract manages coffee batches as ERC1155 tokens, where each token ID () represents a unique batch
 * of coffee with its own metadata, production details, and verification status.
 */
contract WAGACoffeeToken is ERC1155, AccessControl, ERC1155Supply, ERC1155URIStorage {
    using Strings for uint256;
   
    /**
     * @dev Role definitions for access control
     * MINTER_ROLE - Authorized to mint new tokens (typically assigned to ProofOfReserve contract)
     * ADMIN_ROLE - Can manage system configuration and create new batches
     * INVENTORY_MANAGER_ROLE - Manages batch verification and inventory updates
     * REDEMPTION_ROLE - Authorized to burn tokens during redemption process
     */
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant INVENTORY_MANAGER_ROLE = keccak256("INVENTORY_MANAGER_ROLE");
    bytes32 public constant REDEMPTION_ROLE = keccak256("REDEMPTION_ROLE");
   
    /**
     * @dev Address of the inventory manager contract/wallet
     * Responsible for managing batch verification and inventory updates
     */
    address public inventoryManager;

    /**
     * @dev Address of the redemption contract
     * Handles the token burning process when coffee is redeemed
     */
    address public redemptionContract;
   
    /**
     * @dev Struct containing essential batch information stored on-chain
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @param isVerified Whether the batch has been verified by the inventory manager
     * @param currentQuantity Current available quantity of tokens for this batch
     */
    // @review: Should we add the price info here ?
    struct BatchInfo {
        uint256 productionDate;
        uint256 expiryDate;
        bool isVerified;
        uint256 currentQuantity; 
        /* @review: Add price info */
        /*Pakaging info*/ 

    }
   
    /**
     * @dev Maps batch ID to its corresponding batch information
     */
    mapping(uint256 => BatchInfo) public batchInfo;
   
    /**
     * @dev Tracking system for batch status and enumeration
     * activeBatches - Quick lookup for whether a batch is currently active
     * allBatchIds - Complete list of all batch IDs ever created
     */
    mapping(uint256 => bool) public activeBatches;
    uint256[] public allBatchIds;
   
    /**
     * @dev Counter for generating unique batch IDs
     * Automatically increments with each new batch creation
     */
    uint256 private _nextBatchId;
   
    // Events
    event BatchCreated(uint256 indexed batchId, string ipfsUri);
    event BatchStatusUpdated(uint256 indexed batchId, bool isVerified);
    event InventoryUpdated(uint256 indexed batchId, uint256 newQuantity);
    event BatchExpired(uint256 indexed batchId);
   
    /**
     * @dev Initializes the contract with the deployer as the default admin
     */
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
   
    /**
     * @dev Sets or updates the inventory manager address and grants appropriate role
     * @param _inventoryManager Address of the new inventory manager
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - New address cannot be zero address
     * - checks if there is an existing inventory manager
     * - if there is, revokes the role
     * - sets the new _inventory manager and grants the role
     */
    function setInventoryManager(address _inventoryManager) external onlyRole(ADMIN_ROLE) {
        require(_inventoryManager != address(0), "Invalid address"); // check if address is not zero
        if (inventoryManager != address(0)) {
            _revokeRole(INVENTORY_MANAGER_ROLE, inventoryManager);
        } // check if there is an existing inventory manager
        inventoryManager = _inventoryManager;
        _grantRole(INVENTORY_MANAGER_ROLE, _inventoryManager);
    }

    /**
     * @dev Sets or updates the redemption contract address and grants appropriate role
     * @param _redemptionContract Address of the new redemption contract
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - New address cannot be zero address
     * - checks if there is an existing redemption contract
     * - if there is, revokes the role
     * - sets the new _redemption contract and grants the role
     */
    function setRedemptionContract(address _redemptionContract) external onlyRole(ADMIN_ROLE) {
        require(_redemptionContract != address(0), "Invalid address");
        if (redemptionContract != address(0)) {
            _revokeRole(REDEMPTION_ROLE, redemptionContract);
        }
        redemptionContract = _redemptionContract;
        _grantRole(REDEMPTION_ROLE, _redemptionContract);
    }

    /**
     * @dev Creates a new batch of coffee tokens with associated metadata
     * @param ipfsUri IPFS URI containing detailed batch metadata
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @return batchId The ID of the newly created batch
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - IPFS URI must not be empty
     * Emits a {BatchCreated} event
     */
    function createBatch(
        string memory ipfsUri,
        uint256 productionDate,
        uint256 expiryDate
        /* @review: Add price info */
        /* @review: Add packaging info */
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        uint256 batchId = _nextBatchId++;
        require(bytes(ipfsUri).length > 0, "IPFS URI cannot be empty");
       
        // Store minimal batch information on-chain
        batchInfo[batchId] = BatchInfo({
            productionDate: productionDate,
            expiryDate: expiryDate,
            isVerified: false,
            currentQuantity: 0 // do we input the volume in kg or the number of bags
            /* @review: Add price info */
        });
       
        // Set URI for the batch that points to IPFS metadata
        _setURI(batchId, ipfsUri);
       
        emit BatchCreated(batchId, ipfsUri);

        activeBatches[batchId] = true;
        allBatchIds.push(batchId);

        return batchId;
    }

    /**
     * @dev Updates the verification status of a batch
     * @param batchId ID of the batch to update
     * @param isVerified New verification status
     * Requirements:
     * - Caller must have INVENTORY_MANAGER_ROLE
     * - Batch must exist
     * Emits a {BatchStatusUpdated} event
     */
    function updateBatchStatus(uint256 batchId, bool isVerified) external onlyRole(INVENTORY_MANAGER_ROLE) {
        require(batchInfo[batchId].productionDate != 0, "Batch does not exist");
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
     * Emits an {InventoryUpdated} event
     */
    function updateInventory(uint256 batchId, uint256 newQuantity) external onlyRole(INVENTORY_MANAGER_ROLE) {
        require(batchInfo[batchId].productionDate != 0, "Batch does not exist");
        batchInfo[batchId].currentQuantity = newQuantity;
        emit InventoryUpdated(batchId, newQuantity);
    }

    /**
     * @dev Retrieves an array of all currently active batch IDs
     * @return uint256[] Array of active batch IDs
     * Note: This function filters out expired or inactive batches
     */
    function getActiveBatchIds() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allBatchIds.length; i++) {
            if (activeBatches[allBatchIds[i]]) {
                activeCount++;
            }
        }

        uint256[] memory activeBatchIds = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allBatchIds.length; i++) {
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
     * Emits a {BatchExpired} event
     */
    function markBatchExpired(uint256 batchId) external onlyRole(INVENTORY_MANAGER_ROLE) {
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
     * Note: Updates the current quantity of the batch
     */
    // @verif: What amount for how many tokens ?
    // @verif: Should check that the amount is less than or equal to the current quantity
    function mintBatch(address to, uint256 batchId, uint256 amount) external onlyRole(MINTER_ROLE) {
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
     * Note: Updates the current quantity of the batch
     */
    function burnForRedemption(address account, uint256 batchId, uint256 amount) external onlyRole(REDEMPTION_ROLE) {
        _burn(account, batchId, amount); // send to zero address
        batchInfo[batchId].currentQuantity -= amount;
    }

    // need to add a `burnForExpiry` function

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
     * Note: Overrides both ERC1155 and ERC1155URIStorage implementations
     */
    function uri(uint256 tokenId /*batchID*/) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return ERC1155URIStorage.uri(tokenId);
    }

    /**
     * @dev Internal function to update token balances
     * Required override to handle both ERC1155 and ERC1155Supply functionality
     */
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    /**
     * @dev Checks if the contract supports an interface
     * @param interfaceId Interface identifier to check
     * @return bool True if the interface is supported
     * Note: Handles both ERC1155 and AccessControl interfaces
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
     * @dev Returns the next batch ID that will be used
     * @return uint256 The next batch ID
     */
    function getNextBatchId() external view returns (uint256) {
        return _nextBatchId;
    }
}

