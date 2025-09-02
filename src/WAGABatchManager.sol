// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Interfaces/IWAGACoffeeToken.sol";
import "./WAGACoffeeTokenCore.sol";
import "./Interfaces/IPrivacyLayer.sol";
import "./WAGAViewFunctions.sol";

/**
 * @title WAGABatchManager
 * @dev Manages detailed batch information and metadata for WAGA Coffee system
 */
contract WAGABatchManager is WAGAViewFunctions {
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
        // Optionally, emit an event here if you want to track expiries
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
        s_batchInfo[batchId].isVerified = false;
        s_batchInfo[batchId].isMetadataVerified = false;
        s_batchInfo[batchId].lastVerifiedTimestamp = 0;
        _setBatchFlag(batchId, 0, false); // isVerified
        _setBatchFlag(batchId, 1, false); // isMetadataVerified
    }

    /**
     * @dev Update batch active status (only admin)
     */
    function updateBatchStatus(
        uint256 batchId,
        bool isActive
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        s_isActiveBatch[batchId] = isActive;
    }

    /**
     * @dev Update batch inventory (only admin)
     */
    function updateInventory(
        uint256 batchId,
        uint256 newQuantity
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        if (newQuantity == 0) {
            revert("WAGABatchManager__InvalidQuantity_updateInventory");
        }
        s_batchInfo[batchId].quantity = newQuantity;
    }
    /**
     * @dev Verify batch metadata (only admin)
     * @param batchId Batch identifier
     * @param verifiedPrice Verified price
     * @param verifiedPackaging Verified packaging
     * @param verifiedMetadataHash Verified metadata hash
     */
    function verifyBatchMetadata(
        uint256 batchId,
        uint256 verifiedPrice,
        string calldata verifiedPackaging,
        string calldata verifiedMetadataHash
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }

        BatchInfo storage info = s_batchInfo[batchId];
        if (
            info.pricePerUnit != verifiedPrice ||
            keccak256(bytes(info.packagingInfo)) !=
            keccak256(bytes(verifiedPackaging)) ||
            keccak256(bytes(info.metadataHash)) !=
            keccak256(bytes(verifiedMetadataHash))
        ) {
            revert("WAGABatchManager__MetadataMismatch_verifyBatchMetadata");
        }

        // Set isMetadataVerified flag and update timestamp
        info.isMetadataVerified = true;
        info.lastVerifiedTimestamp = block.timestamp;
        _setBatchFlag(batchId, 1, true); // isMetadataVerified
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
        return s_batchInfo[batchId].isMetadataVerified;
    }
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
    /*                               Helper Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if caller has a specific role from coffee token
     */
    function _hasRoleFromCoffeeToken(
        bytes32 roleType
    ) internal view returns (bool) {
        return coffeeTokenContract.hasRole(roleType, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
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
        IPrivacyLayer.PrivacyConfig memory privacyConfig = IPrivacyLayer
            .PrivacyConfig({
                pricingPrivate: privacyLevel !=
                    IPrivacyLayer.PrivacyLevel.PUBLIC,
                qualityPrivate: privacyLevel !=
                    IPrivacyLayer.PrivacyLevel.PUBLIC,
                supplyChainPrivate: privacyLevel !=
                    IPrivacyLayer.PrivacyLevel.PUBLIC,
                level: privacyLevel,
                pricingClaim: "Standard Pricing",
                qualityClaim: "Quality Verified",
                supplyChainClaim: "Supply Chain Verified"
            });

        privacyLayer.configurePrivacyWithCaller(msg.sender, batchId, privacyConfig);

        // Set initial flags
        _setBatchFlag(batchId, 0, false); // isVerified
        _setBatchFlag(batchId, 1, false); // isMetadataVerified
        _setBatchFlag(batchId, 2, true); // isActive

        emit BatchInfoUpdated(batchId, origin, packagingInfo);
    }

    /**
     * @dev Create detailed batch information with explicit caller for internal contract calls
     * This function is used by WAGACoffeeTokenCore to pass the original caller
     */
    function createBatchInfoWithCaller(
        address originalCaller,
        uint256 batchId,
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string calldata origin,
        string calldata packagingInfo,
        IPrivacyLayer.PrivacyLevel privacyLevel
    ) external {
        // Check that the caller has PROCESSOR_ROLE using the original caller
        _checkCallerHasRoleFromCoffeeToken(PROCESSOR_ROLE, originalCaller);

        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }

        // Store additional batch metadata in our dedicated mappings
        batchOrigin[batchId] = origin;
        additionalPackagingInfo[batchId] = packagingInfo;
        batchCreator[batchId] = originalCaller; // Use original caller
        batchCreationTimestamp[batchId] = block.timestamp;

        // Update the main batch info in WAGAViewFunctions state
        s_batchInfo[batchId].productionDate = productionDate;
        s_batchInfo[batchId].expiryDate = expiryDate;
        s_batchInfo[batchId].quantity = quantity;
        s_batchInfo[batchId].pricePerUnit = pricePerUnit;
        s_batchInfo[batchId].packagingInfo = packagingInfo;

        // Configure privacy for this batch
        IPrivacyLayer.PrivacyConfig memory privacyConfig = IPrivacyLayer
            .PrivacyConfig({
                pricingPrivate: privacyLevel !=
                    IPrivacyLayer.PrivacyLevel.PUBLIC,
                qualityPrivate: privacyLevel !=
                    IPrivacyLayer.PrivacyLevel.PUBLIC,
                supplyChainPrivate: privacyLevel !=
                    IPrivacyLayer.PrivacyLevel.PUBLIC,
                level: privacyLevel,
                pricingClaim: "Standard Pricing",
                qualityClaim: "Quality Verified",
                supplyChainClaim: "Supply Chain Verified"
            });

        privacyLayer.configurePrivacyWithCaller(originalCaller, batchId, privacyConfig);

        // Set initial flags
        _setBatchFlag(batchId, 0, false); // isVerified
        _setBatchFlag(batchId, 1, false); // isMetadataVerified
        _setBatchFlag(batchId, 2, true); // isActive

        // Also set the active status in the coffee token's view functions
        // We need to call this through the coffee token since it has the canonical view functions
        // For now, we'll rely on the coffee token's batch creation to handle activation

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
     * @dev Get batch information with privacy considerations - optimized for stack depth
     */
    function getBatchInfo(
        uint256 batchId
    )
        external
        view
        returns (
            uint256 productionDate,
            uint256 expiryDate,
            uint256 quantity,
            uint256 pricePerUnit,
            string memory origin,
            string memory packagingInfo,
            address creator,
            uint256 timestamp
        )
    {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }

        // Separate privacy processing to reduce stack depth
        return _getFilteredBatchInfo(batchId);
    }

    /**
     * @dev Internal function to handle privacy filtering - optimized for stack depth
     */
    function _getFilteredBatchInfo(
        uint256 batchId
    )
        internal
        view
        returns (
            uint256 productionDate,
            uint256 expiryDate,
            uint256 quantity,
            uint256 pricePerUnit,
            string memory origin,
            string memory packagingInfo,
            address creator,
            uint256 timestamp
        )
    {
        BatchInfo storage info = s_batchInfo[batchId];

        // Get privacy permissions
        (bool canViewPricing, bool canViewDetails) = _getPrivacyPermissions(batchId);

        // Build return values step by step to reduce stack usage
        productionDate = canViewDetails ? info.productionDate : 0;
        expiryDate = canViewDetails ? info.expiryDate : 0;
        quantity = info.quantity;
        pricePerUnit = canViewPricing ? info.pricePerUnit : 0;
        origin = _getFilteredOrigin(batchId, canViewDetails);
        packagingInfo = _getFilteredPackagingInfo(info, canViewDetails);
        creator = batchCreator[batchId];
        timestamp = batchCreationTimestamp[batchId];
    }

    /**
     * @dev Get filtered origin string - separated for stack optimization
     */
    function _getFilteredOrigin(
        uint256 batchId,
        bool canViewDetails
    ) internal view returns (string memory) {
        return canViewDetails ? batchOrigin[batchId] : "Origin Protected";
    }

    /**
     * @dev Get filtered packaging info - separated for stack optimization
     */
    function _getFilteredPackagingInfo(
        BatchInfo storage info,
        bool canViewDetails
    ) internal view returns (string memory) {
        return canViewDetails ? info.packagingInfo : "Standard Packaging";
    }

    /**
     * @dev Get privacy permissions for caller - separated for stack depth optimization
     */
    function _getPrivacyPermissions(
        uint256 batchId
    ) internal view returns (bool canViewPricing, bool canViewDetails) {
        IPrivacyLayer.PrivacyConfig memory config = privacyLayer.getPrivacyConfig(batchId);
        
        canViewPricing = !config.pricingPrivate || 
            _hasRoleFromCoffeeToken(DISTRIBUTOR_ROLE) ||
            _hasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE);

        canViewDetails = !config.supplyChainPrivate ||
            _hasRoleFromCoffeeToken(VERIFIER_ROLE) ||
            _hasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE);
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
    ) external view returns (bool) {
        return (batchFlags[batchId] & (1 << flagBit)) != 0;
    }
}
