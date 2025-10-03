// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {WAGACoffeeTokenCore} from "./WAGACoffeeTokenCore.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";
import {MetadataManagementLib} from "./libraries/MetadataManagementLib.sol";

/**
 * @title WAGABatchMetadataManager
 * @dev Manages core batch metadata and verification status for WAGA Coffee system
 * @notice Uses Central Authority pattern - queries WAGAConfigManager for all access control
 * @dev Focuses solely on basic batch metadata, verification, and status management
 */
contract WAGABatchMetadataManager {
    using MetadataManagementLib for mapping(uint256 => string);
    
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */
    
    // Central authority for access control - NO inheritance saves space!
    WAGAConfigManager public immutable authority;
    IWAGACoffeeToken public immutable coffeeToken;
    WAGACoffeeTokenCore public immutable coffeeTokenContract;
    IPrivacyLayer public immutable privacyLayer;

    // Core batch metadata
    mapping(uint256 => string) public batchOrigin;
    mapping(uint256 => string) public additionalPackagingInfo;
    mapping(uint256 => string) public verifiedMetadataHashes;
    mapping(uint256 => address) public batchCreator;
    mapping(uint256 => uint256) public batchCreationTimestamp;
    mapping(uint256 => uint8) public batchFlags; // Bit-packed flags for verification status

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchInfoUpdated(
        uint256 indexed batchId,
        string origin,
        string packagingInfo
    );
    event BatchMetadataUpdated(uint256 indexed batchId, string metadataHash);
    event BatchInventoryUpdated(uint256 indexed batchId, uint256 verifiedQuantity);
    event BatchVerificationStatusChanged(uint256 indexed batchId, bool isVerified);

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error WAGABatchMetadataManager__CallerDoesNotHaveRequiredRole();
    error WAGABatchMetadataManager__OnlyBatchOperationsCanRegister();
    error WAGABatchMetadataManager__CreatorMustHaveRequiredRole();
    error WAGABatchMetadataManager__VerifiedMetadataHashRequired();
    error WAGABatchMetadataManager__BatchDoesNotExist();

    /* -------------------------------------------------------------------------- */
    /*                                 Modifiers                                  */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRole(bytes32 role) {
        if (!authority.hasRole(role, msg.sender)) {
            revert WAGABatchMetadataManager__CallerDoesNotHaveRequiredRole();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _coffeeToken, 
        address _privacyLayer,
        address _authority
    ) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
        coffeeTokenContract = WAGACoffeeTokenCore(_coffeeToken);
        privacyLayer = IPrivacyLayer(_privacyLayer);
        authority = WAGAConfigManager(_authority);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register basic batch metadata after creation
     */
    function registerBatchCreation(
        uint256 batchId,
        string calldata origin,
        address creator
    ) external {
        if (msg.sender != address(coffeeTokenContract.batchOperations())) {
            revert WAGABatchMetadataManager__OnlyBatchOperationsCanRegister();
        }
        if (!authority.hasRole(keccak256("BATCH_CREATOR_ROLE"), creator) && 
                !authority.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), creator)) {
            revert WAGABatchMetadataManager__CreatorMustHaveRequiredRole();
        }
        
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        
        batchOrigin[batchId] = origin;
        batchCreator[batchId] = creator;
        batchCreationTimestamp[batchId] = block.timestamp;
        
        emit BatchInfoUpdated(batchId, origin, "");
    }

    /**
     * @dev Verify batch metadata
     */
    function verifyBatchMetadata(
        uint256 batchId,
        string calldata verifiedPackaging,
        string calldata verifiedMetadataHash
    ) external callerHasRole(keccak256("VERIFIER_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        
        additionalPackagingInfo[batchId] = verifiedPackaging;
        if (bytes(verifiedMetadataHash).length == 0) {
            revert WAGABatchMetadataManager__VerifiedMetadataHashRequired();
        }
        verifiedMetadataHashes[batchId] = verifiedMetadataHash;
        
        _setBatchFlag(batchId, 1, true); // isMetadataVerified
        emit BatchMetadataUpdated(batchId, verifiedMetadataHash);
    }

    /**
     * @dev Mark batch as verified after successful verification
     */
    function markBatchAsVerified(
        uint256 batchId
    ) external callerHasRole(keccak256("VERIFIER_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        _setBatchFlag(batchId, 0, true); // isVerified
        emit BatchVerificationStatusChanged(batchId, true);
    }

    /**
     * @dev Update batch status
     */
    function updateBatchStatus(
        uint256 batchId,
        bool isActive
    ) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        _setBatchFlag(batchId, 2, isActive); // isActive flag
    }

    /**
     * @dev Mark batch as expired
     */
    function markBatchExpired(
        uint256 batchId
    ) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        _setBatchFlag(batchId, 3, true); // expired flag
    }

    /**
     * @dev Update inventory status
     */
    function updateInventory(uint256 batchId, uint256 verifiedQuantity) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        _setBatchFlag(batchId, 4, true); // inventory verified
        emit BatchInventoryUpdated(batchId, verifiedQuantity);
    }

    /**
     * @notice Reset verification flags for a batch (admin only)
     * @param batchId The batch to reset flags for
     */
    function resetBatchVerificationFlags(
        uint256 batchId
    ) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        _setBatchFlag(batchId, 0, false); // isVerified
        _setBatchFlag(batchId, 1, false); // isMetadataVerified
    }

    /**
     * @notice Get additional batch information managed by this contract
     * @param batchId The batch ID to query
     * @return origin Batch origin location
     * @return creator Address that created the batch
     * @return timestamp When the batch was created
     * @return isExpired Whether the batch is expired
     * @return isMetadataVerified Whether metadata is verified
     */
    function getBatchAdditionalInfo(
        uint256 batchId
    ) external view returns (
        string memory origin,
        address creator,
        uint256 timestamp,
        bool isExpired,
        bool isMetadataVerified
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }

        origin = batchOrigin[batchId];
        creator = batchCreator[batchId];
        timestamp = batchCreationTimestamp[batchId];
        isExpired = _getBatchFlag(batchId, 3);
        isMetadataVerified = _getBatchFlag(batchId, 1);
    }

    /**
     * @notice Update ZK claims for a batch (verifier only)
     * @param batchId The batch to update
     * @param pricingClaim ZK claim for pricing data
     * @param qualityClaim ZK claim for quality data
     * @param supplyChainClaim ZK claim for supply chain data
     */
    function updateZKClaims(
        uint256 batchId, 
        string calldata pricingClaim, 
        string calldata qualityClaim, 
        string calldata supplyChainClaim
    ) external callerHasRole(keccak256("VERIFIER_ROLE")) {
        MetadataManagementLib.updateZKClaims(
            batchId,
            pricingClaim,
            qualityClaim,
            supplyChainClaim,
            coffeeToken,
            privacyLayer
        );
    }

    /**
     * @notice Check if viewer can access pricing data for a batch
     * @param batchId The batch ID
     * @param viewer The address requesting access
     * @return True if viewer has access to pricing data
     */
    function canViewPricingData(uint256 batchId, address viewer) external view returns (bool) {
        return MetadataManagementLib.canViewPricingData(
            batchId,
            viewer,
            batchCreator[batchId],
            authority
        );
    }

    /**
     * @notice Check if viewer can access supply chain data for a batch
     * @param batchId The batch ID
     * @param viewer The address requesting access
     * @return True if viewer has access to supply chain data
     */
    function canViewSupplyChainData(uint256 batchId, address viewer) external view returns (bool) {
        return MetadataManagementLib.canViewSupplyChainData(
            batchId,
            viewer,
            batchCreator[batchId],
            authority
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                               View Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get basic batch metadata
     */
    function getBatchBasicInfo(
        uint256 batchId
    ) external view returns (
        string memory origin,
        address creator,
        uint256 timestamp,
        bool isVerified,
        bool isMetadataVerified,
        bool isActive,
        bool isExpired
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }

        origin = batchOrigin[batchId];
        creator = batchCreator[batchId];
        timestamp = batchCreationTimestamp[batchId];
        isVerified = getBatchFlag(batchId, 0);
        isMetadataVerified = getBatchFlag(batchId, 1);
        isActive = getBatchFlag(batchId, 2);
        isExpired = getBatchFlag(batchId, 3);
    }

    /**
     * @dev Check if batch metadata is verified
     */
    function isBatchMetadataVerified(uint256 batchId) external view returns (bool) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        return getBatchFlag(batchId, 1);
    }

    /**
     * @dev Check if batch is verified
     */
    function isBatchVerified(uint256 batchId) external view returns (bool) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        return getBatchFlag(batchId, 0);
    }

    /**
     * @dev Get verified metadata hash
     */
    function getVerifiedMetadataHash(uint256 batchId) external view returns (string memory) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchMetadataManager__BatchDoesNotExist();
        }
        return verifiedMetadataHashes[batchId];
    }

    /* -------------------------------------------------------------------------- */
    /*                              Internal Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set a specific flag for a batch
     */
    function _setBatchFlag(uint256 batchId, uint8 flagBit, bool value) internal {
        uint8 currentFlags = batchFlags[batchId];
        if (value) {
            batchFlags[batchId] = uint8(currentFlags | (1 << flagBit));
        } else {
            batchFlags[batchId] = uint8(currentFlags & ~(1 << flagBit));
        }
    }

    /**
     * @dev Get a specific flag bit for a batch
     * @param batchId The batch ID
     * @param flagBit The bit position (0-7)
     * @return The boolean value of the flag
     */
    function _getBatchFlag(uint256 batchId, uint8 flagBit) internal view returns (bool) {
        return (batchFlags[batchId] & (1 << flagBit)) != 0;
    }

    /**
     * @dev Get a specific flag for a batch
     */
    function getBatchFlag(uint256 batchId, uint8 flagBit) public view returns (bool) {
        uint8 currentFlags = batchFlags[batchId];
        return (currentFlags & (1 << flagBit)) != 0;
    }
}