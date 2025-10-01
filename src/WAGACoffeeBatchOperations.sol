// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {WAGAViewFunctions} from "./WAGAViewFunctions.sol";
import {IWAGABatchManager} from "./Interfaces/IWAGABatchManager.sol";
import {WAGAZKManager} from "./WAGAZKManager.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";

/**
 * @title WAGACoffeeBatchOperations
 * @dev Handles complex batch operations and business logic for WAGA Coffee system
 * @notice Uses Central Authority pattern - queries WAGAConfigManager for all access control
 * This contract manages batch creation, requests, and integrations with managers
 * while the Core contract handles pure ERC1155 token operations
 */
contract WAGACoffeeBatchOperations is WAGAViewFunctions {

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Central authority for access control (no inheritance!)
    WAGAConfigManager public immutable authority;
    
    // Core token contract
    IWAGACoffeeToken public immutable coreContract;
    
    // Manager contracts
    IWAGABatchManager public batchManager;
    WAGAZKManager public zkManager;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchCreated(uint256 indexed batchId, address indexed creator, uint256 quantity, uint256 pricePerUnit, string metadataURI);
    event BatchRequestCreated(uint256 indexed batchId, uint256 indexed requestIndex, address indexed requester, uint256 requestedQuantity);
    event MintedQuantityInconsistency(uint256 indexed batchId, uint256 burnAmount, uint256 currentMintedQuantity);

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error CallerNotAuthorized();
    error BatchDoesNotExist();
    error InvalidQuantity();
    error InsufficientInventory();

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(address _authority, address _coreContract) {
        authority = WAGAConfigManager(_authority);
        coreContract = IWAGACoffeeToken(_coreContract);
    }

    /* -------------------------------------------------------------------------- */
    /*                                 Modifiers                                  */
    /* -------------------------------------------------------------------------- */

    modifier onlyRole(bytes32 role) {
        if (!authority.hasRole(role, msg.sender)) {
            revert CallerNotAuthorized();
        }
        _;
    }

    modifier onlyBatchCreator() {
        bytes32 batchCreatorRole = keccak256("BATCH_CREATOR_ROLE");
        bytes32 adminRole = keccak256("DEFAULT_ADMIN_ROLE");
        
        if (!(authority.hasRole(batchCreatorRole, msg.sender) || 
              authority.hasRole(adminRole, msg.sender))) {
            revert CallerNotAuthorized();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Creates a new batch with full business logic
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
        
        // Add to all batches tracking
        allBatchIds.push(newBatchId);

        // Register with BatchManager
        if (address(batchManager) != address(0)) {
            batchManager.registerBatchCreation(newBatchId, origin, msg.sender);
        }

        // Configure privacy with default public settings
        if (address(zkManager) != address(0)) {
            zkManager.configureDefaultPrivacy(newBatchId);
        }

        // Update batch IPFS metadata in core contract
        if (bytes(metadataURI).length > 0) {
            // Register batch with core and set metadata
            (bool success,) = address(coreContract).call(
                abi.encodeWithSignature("registerBatch(uint256,string)", newBatchId, metadataURI)
            );
            require(success, "Failed to register batch with core");
        } else {
            // Register batch without metadata
            (bool success,) = address(coreContract).call(
                abi.encodeWithSignature("registerBatch(uint256,string)", newBatchId, "")
            );
            require(success, "Failed to register batch with core");
        }

        emit BatchCreated(newBatchId, msg.sender, quantity, pricePerUnit, metadataURI);
        return newBatchId;
    }

    /**
     * @dev Creates a new batch request for verification workflow
     */
    function createBatchRequest(
        uint256 batchId,
        uint256 requestedQuantity,
        string memory requestDetails
    ) external returns (uint256) {
        // Check if batch exists
        if (!isBatchCreated(batchId)) {
            revert("Batch does not exist");
        }
        
        // Check if requester has appropriate role (processor or verifier)
        bytes32 processorRole = keccak256("PROCESSOR_ROLE");
        bytes32 verifierRole = keccak256("VERIFIER_ROLE");
        if (!authority.hasRole(processorRole, msg.sender) && !authority.hasRole(verifierRole, msg.sender)) {
            revert("Caller must have PROCESSOR_ROLE or VERIFIER_ROLE");
        }
        
        // Get the next request index for this batch
        uint256 requestIndex = s_batchRequestCount[batchId];
        
        // Create the batch request
        batchRequestsByIndex[batchId][requestIndex] = BatchRequest({
            batchId: batchId,
            requester: msg.sender,
            requestedQuantity: requestedQuantity,
            requestDetails: requestDetails,
            requestTimestamp: block.timestamp,
            isFulfilled: false,
            fulfilledQuantity: 0,
            fulfilledTimestamp: 0
        });
        
        // Increment the request count
        s_batchRequestCount[batchId]++;
        
        emit BatchRequestCreated(batchId, requestIndex, msg.sender, requestedQuantity);
        return requestIndex;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Manager Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set manager contract addresses
     */
    function setManagerAddresses(address _batchManager, address _zkManager) external onlyRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        batchManager = IWAGABatchManager(_batchManager);
        zkManager = WAGAZKManager(_zkManager);
    }

    /**
     * @dev Set batch manager address
     */
    function setBatchManager(address _batchManager) external onlyRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        batchManager = IWAGABatchManager(_batchManager);
    }

    /**
     * @dev Get the ZK manager address
     */
    function getZKManager() external view returns (WAGAZKManager) {
        return zkManager;
    }

    /**
     * @dev Emergency function to fix state consistency between mintedQuantity and totalSupply
     * @param batchId Batch to fix
     */
    function fixStateConsistency(uint256 batchId) external onlyRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        uint256 actualSupply = coreContract.getMintedQuantity(batchId);
        BatchInfo storage batch = s_batchInfo[batchId];
        
        if (batch.mintedQuantity != actualSupply) {
            emit MintedQuantityInconsistency(batchId, 0, batch.mintedQuantity);
            batch.mintedQuantity = actualSupply;
        }
    }

    /**
     * @dev Check if state is consistent for a batch
     * @param batchId Batch to check
     * @return isConsistent Whether mintedQuantity equals totalSupply in core contract
     */
    function checkStateConsistency(uint256 batchId) external view returns (bool isConsistent) {
        return s_batchInfo[batchId].mintedQuantity == coreContract.getMintedQuantity(batchId);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Integration Functions                         */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update minted quantity when core contract mints tokens
     * @param batchId Batch that was minted
     * @param amount Amount that was minted
     */
    function notifyMint(uint256 batchId, uint256 amount) external {
        require(msg.sender == address(coreContract), "Only core contract can notify mint");
        s_batchInfo[batchId].mintedQuantity += amount;
    }

    /**
     * @dev Update minted quantity when core contract burns tokens
     * @param batchId Batch that was burned
     * @param amount Amount that was burned
     */
    function notifyBurn(uint256 batchId, uint256 amount) external {
        require(msg.sender == address(coreContract), "Only core contract can notify burn");
        BatchInfo storage batch = s_batchInfo[batchId];
        
        if (batch.mintedQuantity >= amount) {
            batch.mintedQuantity -= amount;
        } else {
            batch.mintedQuantity = 0;
            emit MintedQuantityInconsistency(batchId, amount, batch.mintedQuantity);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              View Functions                                */
    /* -------------------------------------------------------------------------- */

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
     * @dev Get available quantity for a batch
     * @notice Returns quantity - mintedQuantity
     */
    function getAvailableQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        BatchInfo storage info = s_batchInfo[batchId];
        return info.quantity - info.mintedQuantity;
    }

    /**
     * @dev Get the core contract address
     */
    function getCoreContract() external view returns (address) {
        return address(coreContract);
    }
}