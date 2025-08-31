// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Interfaces/IWAGACoffeeToken.sol";
import "./Interfaces/IPrivacyLayer.sol";
import "./WAGAViewFunctions.sol";

/**
 * @title WAGABatchManager
 * @dev Manages detailed batch information and metadata for WAGA Coffee system
 */
contract WAGABatchManager is WAGAViewFunctions {
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

    event BatchMetadataUpdated(
        uint256 indexed batchId,
        string metadataHash
    );

    /* -------------------------------------------------------------------------- */
    /*                                Modifiers                                   */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        // Use a try-catch or low-level call since interface might not have hasRole
        (bool success, bytes memory result) = address(coffeeToken).staticcall(
            abi.encodeWithSignature("hasRole(bytes32,address)", roleType, msg.sender)
        );
        
        if (!success || result.length == 0 || !abi.decode(result, (bool))) {
            revert WAGABatchManager__CallerDoesNotHaveRequiredRole_callerHasRoleFromCoffeeToken();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                               Helper Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if caller has a specific role from coffee token
     */
    function _hasRoleFromCoffeeToken(bytes32 roleType) internal view returns (bool) {
        (bool success, bytes memory result) = address(coffeeToken).staticcall(
            abi.encodeWithSignature("hasRole(bytes32,address)", roleType, msg.sender)
        );
        
        if (!success || result.length == 0) {
            return false;
        }
        
        return abi.decode(result, (bool));
    }

    /* -------------------------------------------------------------------------- */
    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _coffeeToken,
        address _privacyLayer
    ) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
        privacyLayer = IPrivacyLayer(_privacyLayer);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Create detailed batch information
     */
    function createBatchInfo(
        uint256 batchId,
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string calldata origin,
        string calldata packagingInfo,
        IPrivacyLayer.PrivacyLevel privacyLevel
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }

        // Store additional batch metadata in our dedicated mappings
        batchOrigin[batchId] = origin;
        additionalPackagingInfo[batchId] = packagingInfo;
        batchCreator[batchId] = msg.sender;
        batchCreationTimestamp[batchId] = block.timestamp;

        // Update the main batch info in WAGAViewFunctions state
        s_batchInfo[batchId].productionDate = productionDate;
        s_batchInfo[batchId].expiryDate = expiryDate;
        s_batchInfo[batchId].quantity = quantity;
        s_batchInfo[batchId].pricePerUnit = pricePerUnit;
        s_batchInfo[batchId].packagingInfo = packagingInfo;

        // Configure privacy for this batch
        IPrivacyLayer.PrivacyConfig memory privacyConfig = IPrivacyLayer.PrivacyConfig({
            pricingPrivate: privacyLevel != IPrivacyLayer.PrivacyLevel.PUBLIC,
            qualityPrivate: privacyLevel != IPrivacyLayer.PrivacyLevel.PUBLIC,
            supplyChainPrivate: privacyLevel != IPrivacyLayer.PrivacyLevel.PUBLIC,
            level: privacyLevel,
            pricingClaim: "Standard Pricing",
            qualityClaim: "Quality Verified",
            supplyChainClaim: "Supply Chain Verified"
        });

        privacyLayer.configurePrivacy(batchId, privacyConfig);

        // Set initial flags
        _setBatchFlag(batchId, 0, false); // isVerified
        _setBatchFlag(batchId, 1, false); // isMetadataVerified
        _setBatchFlag(batchId, 2, true);  // isActive

        emit BatchInfoUpdated(batchId, origin, packagingInfo);
    }

    /**
     * @dev Update batch metadata hash
     */
    function updateBatchMetadata(
        uint256 batchId,
        string calldata metadataHash
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_updateBatchMetadata();
        }

        s_batchInfo[batchId].metadataHash = metadataHash;
        _setBatchFlag(batchId, 1, true); // isMetadataVerified

        emit BatchMetadataUpdated(batchId, metadataHash);
    }

    /**
     * @dev Get batch information with privacy considerations
     */
    function getBatchInfo(uint256 batchId) external view returns (
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin,
        string memory packagingInfo,
        address creator,
        uint256 timestamp
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }

        BatchInfo memory info = s_batchInfo[batchId];
        IPrivacyLayer.PrivacyConfig memory config = privacyLayer.getPrivacyConfig(batchId);

        // Apply privacy filtering based on caller's role
        bool canViewPricing = !config.pricingPrivate || 
            _hasRoleFromCoffeeToken(DISTRIBUTOR_ROLE) ||
            _hasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE);

        bool canViewDetails = !config.supplyChainPrivate || 
            _hasRoleFromCoffeeToken(VERIFIER_ROLE) ||
            _hasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE);

        return (
            canViewDetails ? info.productionDate : 0,
            canViewDetails ? info.expiryDate : 0,
            info.quantity,
            canViewPricing ? info.pricePerUnit : 0,
            canViewDetails ? batchOrigin[batchId] : config.supplyChainClaim,
            canViewDetails ? info.packagingInfo : "Standard Packaging",
            batchCreator[batchId],
            batchCreationTimestamp[batchId]
        );
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
     * @dev Get a specific flag for a batch
     */
    function getBatchFlag(uint256 batchId, uint8 flagBit) external view returns (bool) {
        return (batchFlags[batchId] & (1 << flagBit)) != 0;
    }
}
