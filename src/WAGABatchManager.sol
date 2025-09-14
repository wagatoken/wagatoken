// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Interfaces/IWAGACoffeeToken.sol";
import "./WAGACoffeeTokenCore.sol";
import "./Interfaces/IPrivacyLayer.sol";
import "./Interfaces/IWAGABatchManager.sol";

/**
 * @title WAGABatchManager
 * @dev Manages additional batch metadata for WAGA Coffee system
 * @dev No longer inherits WAGAViewFunctions to avoid state duplication
 */
contract WAGABatchManager is IWAGABatchManager {
    /* -------------------------------------------------------------------------- */
    /*                                   Constants                                */
    /* -------------------------------------------------------------------------- */

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error WAGABatchManager__CallerDoesNotHaveRequiredRole_callerHasRoleFromCoffeeToken();
    error WAGABatchManager__BatchDoesNotExist_createBatchInfo();
    error WAGABatchManager__BatchDoesNotExist_updateBatchMetadata();
    error WAGABatchManager__BatchDoesNotExist_getBatchInfo();

    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    IWAGACoffeeToken public immutable coffeeToken;
    WAGACoffeeTokenCore public immutable coffeeTokenContract;
    IPrivacyLayer public immutable privacyLayer;

    // Additional batch metadata (extending what's in WAGAViewFunctions)
    mapping(uint256 => string) public batchOrigin;
    mapping(uint256 => string) public additionalPackagingInfo;
    mapping(uint256 => address) public batchCreator;
    mapping(uint256 => uint256) public batchCreationTimestamp;
    mapping(uint256 => uint8) public batchFlags; // Bit-packed flags

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

    /* -------------------------------------------------------------------------- */
    /*                                Modifiers                                   */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        _checkCallerHasRoleFromCoffeeToken(roleType, msg.sender);
        _;
    }

    modifier callerHasRoleFromCoffeeTokenWithCaller(bytes32 roleType, address caller) {
        _checkCallerHasRoleFromCoffeeToken(roleType, caller);
        _;
    }

    function _checkCallerHasRoleFromCoffeeToken(bytes32 roleType, address caller) internal view {
        // Use the actual contract for direct role checking
        if (!coffeeTokenContract.hasRole(roleType, caller)) {
            revert WAGABatchManager__CallerDoesNotHaveRequiredRole_callerHasRoleFromCoffeeToken();
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(address _coffeeToken, address _privacyLayer) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
        coffeeTokenContract = WAGACoffeeTokenCore(_coffeeToken);
        privacyLayer = IPrivacyLayer(_privacyLayer);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register additional batch metadata after creation
     * Called by WAGACoffeeTokenCore after batch creation
     */
    function registerBatchCreation(
        uint256 batchId,
        string calldata origin,
        address creator
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        
        batchOrigin[batchId] = origin;
        batchCreator[batchId] = creator;
        batchCreationTimestamp[batchId] = block.timestamp;
        
        emit BatchInfoUpdated(batchId, origin, "");
    }

    /* -------------------------------------------------------------------------- */
    /*                               Helper Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if caller has a specific role from coffee token
     */
    function _hasRoleFromCoffeeToken(bytes32 roleType) internal view returns (bool) {
        return coffeeTokenContract.hasRole(roleType, msg.sender);
    }

    /**
     * @dev Mark a batch as expired (only admin)
     */
    function markBatchExpired(
        uint256 batchId
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        _setBatchFlag(batchId, 3, true); // Use bit 3 for expired
    }

    /**
     * @dev Reset verification flags for a batch (only admin)
     */
    function resetBatchVerificationFlags(
        uint256 batchId
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        _setBatchFlag(batchId, 0, false); // isVerified
        _setBatchFlag(batchId, 1, false); // isMetadataVerified
    }

    /**
     * @dev Update batch active status (only admin)
     * @dev Note: This only sets local flags - core status is managed by WAGACoffeeTokenCore
     */
    function updateBatchStatus(
        uint256 batchId,
        bool isActive
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        _setBatchFlag(batchId, 2, isActive); // isActive flag (local tracking only)
    }

    /**
     * @dev Verify batch metadata (only admin) - handles packaging and metadata verification
     * @dev Price verification is handled by WAGACoffeeTokenCore
     */
    function verifyBatchMetadata(
        uint256 batchId,
        string calldata verifiedPackaging,
        string calldata verifiedMetadataHash
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        
        // Store the verified packaging info in additional metadata
        additionalPackagingInfo[batchId] = verifiedPackaging;
        
        // Mark metadata as verified using flag
        _setBatchFlag(batchId, 1, true); // isMetadataVerified
        
        emit BatchMetadataUpdated(batchId, verifiedMetadataHash);
    }

    /**
     * @dev Returns whether batch metadata is verified
     */
    function isBatchMetadataVerified(
        uint256 batchId
    ) external view returns (bool) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        return getBatchFlag(batchId, 1); // isMetadataVerified flag
    }

    /**
     * @dev Updates inventory after verification - minimal implementation for MVP
     */
    function updateInventory(uint256 batchId, uint256 verifiedQuantity) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        
        // For MVP, just mark inventory as updated/verified - actual inventory is managed by core token
        _setBatchFlag(batchId, 4, true); // Using flag position 4 for inventory verification
        
        emit BatchInventoryUpdated(batchId, verifiedQuantity);
    }

    /**
     * @dev Get additional metadata managed by BatchManager only
     * @dev For core batch data, use WAGACoffeeTokenCore.getBasicBatchInfo() directly
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
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }

        origin = batchOrigin[batchId];
        creator = batchCreator[batchId];
        timestamp = batchCreationTimestamp[batchId];
        isExpired = getBatchFlag(batchId, 3);
        isMetadataVerified = getBatchFlag(batchId, 1);
    }

    /* -------------------------------------------------------------------------- */
    /*                            ZK Privacy Functions                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get privacy configuration for a batch (ZK processing)
     */
    function getBatchPrivacyConfig(
        uint256 batchId
    ) external view returns (IPrivacyLayer.PrivacyConfig memory) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        return privacyLayer.getPrivacyConfig(batchId);
    }

    /**
     * @dev Update ZK claims after proof verification (preserves existing ZK logic)
     */
    function updateZKClaims(
        uint256 batchId,
        string calldata pricingClaim,
        string calldata qualityClaim,
        string calldata supplyChainClaim
    ) external callerHasRoleFromCoffeeToken(VERIFIER_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        privacyLayer.updatePublicClaims(batchId, pricingClaim, qualityClaim, supplyChainClaim);
    }

    /**
     * @dev Check if caller can view pricing data (ZK role verification)
     */
    function canViewPricingData(
        uint256 batchId,
        address caller
    ) external view returns (bool) {
        IPrivacyLayer.PrivacyConfig memory config = privacyLayer.getPrivacyConfig(batchId);
        return !config.pricingPrivate || _hasSpecificRoleForAddress(caller, DISTRIBUTOR_ROLE) || 
               _hasSpecificRoleForAddress(caller, DEFAULT_ADMIN_ROLE);
    }

    /**
     * @dev Check if caller can view supply chain details (ZK role verification)
     */
    function canViewSupplyChainData(
        uint256 batchId,
        address caller
    ) external view returns (bool) {
        IPrivacyLayer.PrivacyConfig memory config = privacyLayer.getPrivacyConfig(batchId);
        return !config.supplyChainPrivate || _hasSpecificRoleForAddress(caller, VERIFIER_ROLE) || 
               _hasSpecificRoleForAddress(caller, DEFAULT_ADMIN_ROLE);
    }

    /**
     * @dev Internal helper for role checking with specific address
     */
    function _hasSpecificRoleForAddress(
        address account,
        bytes32 roleType
    ) internal view returns (bool) {
        return coffeeTokenContract.hasRole(roleType, account);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Internal Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set a specific flag for a batch
     */
    function _setBatchFlag(
        uint256 batchId,
        uint8 flagBit,
        bool value
    ) internal {
        uint8 currentFlags = batchFlags[batchId];
        if (value) {
            batchFlags[batchId] = uint8(currentFlags | (1 << flagBit));
        } else {
            batchFlags[batchId] = uint8(currentFlags & ~(1 << flagBit));
        }
    }

    /**
     * @dev Get a specific flag for a batch
     */
    function getBatchFlag(
        uint256 batchId,
        uint8 flagBit
    ) internal view returns (bool) {
        uint8 currentFlags = batchFlags[batchId];
        return (currentFlags & (1 << flagBit)) != 0;
    }
}
