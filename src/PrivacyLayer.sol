// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAAccessControl} from "./WAGAAccessControl.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";
import {IWAGAZKManager} from "./Interfaces/IWAGAZKManager.sol";

/**
 * @title PrivacyLayer
 * @dev Simplified privacy layer for WAGA MVP with lightweight data protection
 */
contract PrivacyLayer is WAGAAccessControl, IPrivacyLayer {
    IWAGACoffeeToken public coffeeToken;

    constructor(address _coffeeToken, address _zkManager) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
        zkManager = IWAGAZKManager(_zkManager);
    }
    
    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    struct ProtectedData {
        bytes32 dataHash;           // Hash of sensitive data
        bytes32 salt;               // Salt for protection
        uint256 timestamp;          // When data was protected
        address dataOwner;          // Who owns this data
    }

    // ZK-based compliance claims for EUDR data
    struct ZKComplianceClaims {
        string deforestationClaim;      // ZK proof claim for deforestation compliance
        string geolocationClaim;        // ZK proof claim for geolocation verification
        string permitValidityClaim;     // ZK proof claim for permit validity
        string certificateAuthenticityClaim; // ZK proof claim for certificate authenticity
        string originVerificationClaim; // ZK proof claim for origin verification
        string boeComplianceClaim;      // ZK proof claim for BoE compliance
        uint256 lastUpdated;            // Timestamp of last claim update
    }

    // Selective disclosure rules for EUDR data access
    struct SelectiveDisclosureRules {
        bool deforestationPrivate;       // Whether deforestation data is private
        bool geolocationPrivate;         // Whether geolocation data is private
        bool permitDataPrivate;          // Whether permit data is private
        bool certificateDataPrivate;     // Whether certificate data is private
        bool originDataPrivate;          // Whether origin data is private
        bool boeDataPrivate;             // Whether BoE data is private
        uint8 minRoleLevel;              // Minimum role level required for access
    }

    /* -------------------------------------------------------------------------- */
    /*                                  Storage                                   */
    /* -------------------------------------------------------------------------- */

    mapping(uint256 => IPrivacyLayer.PrivacyConfig) public batchPrivacyConfig;
    mapping(uint256 => mapping(string => ProtectedData)) public protectedBatchData;

    // EUDR compliance ZK claims storage
    mapping(uint256 => ZKComplianceClaims) public eudrComplianceClaims;
    mapping(uint256 => SelectiveDisclosureRules) public eudrDisclosureRules;

    // ZK manager for compliance validation
    IWAGAZKManager public zkManager;

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error PrivacyLayer__MustBeAdminOrProcessor_configurePrivacy();
    error PrivacyLayer__MustBeAdminOrProcessor_protectSensitiveData();
    error PrivacyLayer__MustBeBatchCreatorOrAdmin_updateEUDRComplianceClaims();
    error PrivacyLayer__MustBeBatchCreatorOrAdmin_configureEUDRDisclosureRules();

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event PrivacyConfigured(
        uint256 indexed batchId,
        IPrivacyLayer.PrivacyLevel level,
        address indexed configurator
    );

    event DataProtected(
        uint256 indexed batchId,
        string dataType,
        bytes32 dataHash,
        address indexed owner
    );

    event PublicClaimsUpdated(
        uint256 indexed batchId,
        string pricingClaim,
        string qualityClaim,
        string supplyChainClaim
    );

    // EUDR Compliance Events
    event EUDRComplianceClaimsUpdated(
        uint256 indexed batchId,
        address indexed updater
    );

    event EUDRDisclosureRulesConfigured(
        uint256 indexed batchId,
        uint8 minRoleLevel,
        address indexed configurator
    );

    event SelectiveDisclosureAccessed(
        uint256 indexed batchId,
        address indexed accessor,
        string dataType,
        bool granted
    );

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Configure privacy for a batch
     */
    function configurePrivacy(
        uint256 batchId,
        IPrivacyLayer.PrivacyConfig calldata config
    ) external onlyBatchCreator {
        batchPrivacyConfig[batchId] = config;
        emit PrivacyConfigured(batchId, config.level, msg.sender);
    }

    /**
     * @dev Configure privacy with explicit caller for internal contract calls
     * This function is used by WAGABatchManager to pass the original caller
     */
    function configurePrivacyWithCaller(
        address originalCaller,
        uint256 batchId,
        IPrivacyLayer.PrivacyConfig calldata config
    ) external {
        // Check that the original caller has PROCESSOR_ROLE on the coffee token contract
        (bool success, bytes memory result) = address(coffeeToken).staticcall(
            abi.encodeWithSignature("hasRole(bytes32,address)", keccak256("ADMIN_ROLE"), originalCaller)
        );
        bool hasAdminRole = success && result.length > 0 && abi.decode(result, (bool));

        (success, result) = address(coffeeToken).staticcall(
            abi.encodeWithSignature("hasRole(bytes32,address)", keccak256("PROCESSOR_ROLE"), originalCaller)
        );
        bool hasProcessorRole = success && result.length > 0 && abi.decode(result, (bool));

        if (!hasAdminRole && !hasProcessorRole) {
            revert PrivacyLayer__MustBeAdminOrProcessor_configurePrivacy();
        }

        batchPrivacyConfig[batchId] = config;
        emit PrivacyConfigured(batchId, config.level, originalCaller);
    }

    /**
     * @dev Protect sensitive data with lightweight hashing
     */
    function protectSensitiveData(
        uint256 batchId,
        string calldata dataType,
        bytes calldata sensitiveData
    ) external onlyBatchCreator returns (bytes32 dataHash) {
        // Generate salt for this data
        bytes32 salt = keccak256(abi.encodePacked(batchId, dataType, block.timestamp, msg.sender));
        
        // Create protected hash (lightweight protection for MVP)
        dataHash = keccak256(abi.encodePacked(sensitiveData, salt, block.timestamp));
        
        protectedBatchData[batchId][dataType] = ProtectedData({
            dataHash: dataHash,
            salt: salt,
            timestamp: block.timestamp,
            dataOwner: msg.sender
        });
        
        emit DataProtected(batchId, dataType, dataHash, msg.sender);
        return dataHash;
    }

    /**
     * @dev Update public claims for ZK verification
     */
    function updatePublicClaims(
        uint256 batchId,
        string calldata pricingClaim,
        string calldata qualityClaim,
        string calldata supplyChainClaim
    ) external onlyBatchCreator {
        // Get current config and update claims
        IPrivacyLayer.PrivacyConfig storage config = batchPrivacyConfig[batchId];
        config.pricingClaim = pricingClaim;
        config.qualityClaim = qualityClaim;
        config.supplyChainClaim = supplyChainClaim;
        
        emit PublicClaimsUpdated(batchId, pricingClaim, qualityClaim, supplyChainClaim);
    }

    /**
     * @dev Protect sensitive data with explicit caller (for Ethiopian compliance)
     */
    function protectDataWithCaller(
        address originalCaller,
        uint256 batchId,
        string calldata dataType,
        string calldata dataHash
    ) external {
        // Check that the original caller has appropriate role
        (bool success, bytes memory result) = address(coffeeToken).staticcall(
            abi.encodeWithSignature("hasRole(bytes32,address)", keccak256("ADMIN_ROLE"), originalCaller)
        );
        bool hasAdminRole = success && result.length > 0 && abi.decode(result, (bool));

        (success, result) = address(coffeeToken).staticcall(
            abi.encodeWithSignature("hasRole(bytes32,address)", keccak256("PROCESSOR_ROLE"), originalCaller)
        );
        bool hasProcessorRole = success && result.length > 0 && abi.decode(result, (bool));

        if (!hasAdminRole && !hasProcessorRole) {
            revert PrivacyLayer__MustBeAdminOrProcessor_protectSensitiveData();
        }

        // Create salt and hash for protecting the data
        bytes32 salt = keccak256(abi.encodePacked(batchId, dataType, block.timestamp));
        bytes32 dataHashBytes = keccak256(abi.encodePacked(dataHash));
        
        ProtectedData memory protectedData = ProtectedData({
            dataHash: dataHashBytes,
            salt: salt,
            timestamp: block.timestamp,
            dataOwner: originalCaller
        });
        
        protectedBatchData[batchId][dataType] = protectedData;
        emit DataProtected(batchId, dataType, dataHashBytes, originalCaller);
    }

    /* -------------------------------------------------------------------------- */
    /*                        EUDR COMPLIANCE FUNCTIONS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update EUDR compliance ZK claims based on verified proofs
     * @param batchId The batch identifier
     * @param claims The ZK compliance claims to update
     */
    function updateEUDRComplianceClaims(
        uint256 batchId,
        ZKComplianceClaims calldata claims
    ) external {
        // Only batch creator or admin can update claims
        if (!_isBatchCreator(batchId, msg.sender) && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert PrivacyLayer__MustBeBatchCreatorOrAdmin_updateEUDRComplianceClaims();
        }

        eudrComplianceClaims[batchId] = ZKComplianceClaims({
            deforestationClaim: claims.deforestationClaim,
            geolocationClaim: claims.geolocationClaim,
            permitValidityClaim: claims.permitValidityClaim,
            certificateAuthenticityClaim: claims.certificateAuthenticityClaim,
            originVerificationClaim: claims.originVerificationClaim,
            boeComplianceClaim: claims.boeComplianceClaim,
            lastUpdated: block.timestamp
        });

        emit EUDRComplianceClaimsUpdated(batchId, msg.sender);
    }

    /**
     * @dev Configure selective disclosure rules for EUDR data
     * @param batchId The batch identifier
     * @param rules The selective disclosure rules
     */
    function configureEUDRDisclosureRules(
        uint256 batchId,
        SelectiveDisclosureRules calldata rules
    ) external {
        // Only batch creator or admin can configure rules
        if (!_isBatchCreator(batchId, msg.sender) && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert PrivacyLayer__MustBeBatchCreatorOrAdmin_configureEUDRDisclosureRules();
        }

        eudrDisclosureRules[batchId] = rules;

        emit EUDRDisclosureRulesConfigured(batchId, rules.minRoleLevel, msg.sender);
    }

    /**
     * @dev Check if a user can access specific EUDR compliance data
     * @param batchId The batch identifier
     * @param accessor The address requesting access
     * @param dataType The type of data being requested
     * @return canAccess Whether access is granted
     */
    function canAccessEUDRData(
        uint256 batchId,
        address accessor,
        string calldata dataType
    ) external returns (bool canAccess) {
        SelectiveDisclosureRules memory rules = eudrDisclosureRules[batchId];
        uint8 userRoleLevel = _getEnhancedRoleLevel(accessor);

        // Check minimum role level
        if (userRoleLevel > rules.minRoleLevel) {
            emit SelectiveDisclosureAccessed(batchId, accessor, dataType, false);
            return false;
        }

        // Check data type specific privacy settings
        bool isPrivate = _isDataTypePrivate(dataType, rules);

        if (isPrivate && userRoleLevel >= 2) { // Level 2+ can access private data
            emit SelectiveDisclosureAccessed(batchId, accessor, dataType, true);
            return true;
        } else if (!isPrivate) { // Public data
            emit SelectiveDisclosureAccessed(batchId, accessor, dataType, true);
            return true;
        }

        emit SelectiveDisclosureAccessed(batchId, accessor, dataType, false);
        return false;
    }

    /**
     * @dev Get EUDR compliance claims for a batch (with access control)
     * @param batchId The batch identifier
     * @param accessor The address requesting the claims
     * @return claims The ZK compliance claims (filtered based on access)
     */
    function getEUDRComplianceClaims(
        uint256 batchId,
        address accessor
    ) external returns (ZKComplianceClaims memory claims) {
        ZKComplianceClaims memory fullClaims = eudrComplianceClaims[batchId];
        SelectiveDisclosureRules memory rules = eudrDisclosureRules[batchId];
        uint8 userRoleLevel = _getEnhancedRoleLevel(accessor);

        // Filter claims based on access level
        claims = ZKComplianceClaims({
            deforestationClaim: _filterClaim(fullClaims.deforestationClaim, rules.deforestationPrivate, userRoleLevel),
            geolocationClaim: _filterClaim(fullClaims.geolocationClaim, rules.geolocationPrivate, userRoleLevel),
            permitValidityClaim: _filterClaim(fullClaims.permitValidityClaim, rules.permitDataPrivate, userRoleLevel),
            certificateAuthenticityClaim: _filterClaim(fullClaims.certificateAuthenticityClaim, rules.certificateDataPrivate, userRoleLevel),
            originVerificationClaim: _filterClaim(fullClaims.originVerificationClaim, rules.originDataPrivate, userRoleLevel),
            boeComplianceClaim: _filterClaim(fullClaims.boeComplianceClaim, rules.boeDataPrivate, userRoleLevel),
            lastUpdated: fullClaims.lastUpdated
        });

        return claims;
    }

    /**
     * @dev Validate EUDR compliance using ZK proofs
     * @param batchId The batch identifier
     * @return isCompliant Whether the batch meets EUDR compliance requirements
     */
    function validateEUDRZKCompliance(uint256 batchId) external view returns (bool isCompliant) {
        if (address(zkManager) == address(0)) {
            return false;
        }

        // Check if all required EUDR proofs are verified
        return zkManager.hasAllRequiredProofs(batchId) &&
               eudrComplianceClaims[batchId].lastUpdated > 0;
    }

    /* -------------------------------------------------------------------------- */
    /*                              View Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get privacy configuration for a batch
     */
    function getPrivacyConfig(
        uint256 batchId
    ) external view returns (IPrivacyLayer.PrivacyConfig memory) {
        return batchPrivacyConfig[batchId];
    }

    /**
     * @dev Get protected data info (hash only, not actual data)
     */
    function getProtectedDataInfo(
        uint256 batchId,
        string calldata dataType
    ) external view returns (ProtectedData memory) {
        return protectedBatchData[batchId][dataType];
    }

    /**
     * @dev Get public claims for display based on user role
     */
    function getPublicClaims(
        uint256 batchId,
        address viewer
    ) external view returns (
        string memory pricingDisplay,
        string memory qualityDisplay,
        string memory supplyChainDisplay
    ) {
        IPrivacyLayer.PrivacyConfig memory config = batchPrivacyConfig[batchId];

        // Determine viewer role and get appropriate claims
        uint8 viewerRole = _getViewerRole(viewer);

        pricingDisplay = _getPricingClaim(config, viewerRole);
        qualityDisplay = _getQualityClaim(config, viewerRole);
        supplyChainDisplay = _getSupplyChainClaim(config, viewerRole);
    }

    /**
     * @dev Get viewer's role level - separated for stack optimization
     */
    function _getViewerRole(address viewer) internal view returns (uint8) {
        if (hasRole(ADMIN_ROLE, viewer) || hasRole(PROCESSOR_ROLE, viewer)) {
            return 1; // Full access
        } else if (hasRole(DISTRIBUTOR_ROLE, viewer)) {
            return 2; // Limited access
        }
        return 3; // Public access
    }

    /**
     * @dev Get pricing claim based on role - separated for stack optimization
     */
    function _getPricingClaim(
        IPrivacyLayer.PrivacyConfig memory config,
        uint8 viewerRole
    ) internal pure returns (string memory) {
        if (viewerRole == 1) { // Full access
            return config.pricingClaim;
        } else if (viewerRole == 2) { // Distributor
            return config.pricingPrivate ? "Contact for Pricing" : config.pricingClaim;
        } else { // Public
            return config.pricingPrivate ? "Competitively Priced" : config.pricingClaim;
        }
    }

    /**
     * @dev Get quality claim based on role - separated for stack optimization
     */
    function _getQualityClaim(
        IPrivacyLayer.PrivacyConfig memory config,
        uint8 viewerRole
    ) internal pure returns (string memory) {
        if (viewerRole == 1) { // Full access
            return config.qualityClaim;
        } else { // Distributor or Public
            return config.qualityPrivate ? "Quality Verified" : config.qualityClaim;
        }
    }

    /**
     * @dev Get supply chain claim based on role - separated for stack optimization
     */
    function _getSupplyChainClaim(
        IPrivacyLayer.PrivacyConfig memory config,
        uint8 viewerRole
    ) internal pure returns (string memory) {
        if (viewerRole == 1) { // Full access
            return config.supplyChainClaim;
        } else { // Distributor or Public
            return config.supplyChainPrivate ? "Traceable Origin" : config.supplyChainClaim;
        }
    }

    /**
     * @dev Check if user can access full data for a batch
     */
    function canAccessFullData(
    uint256 /*batchId*/,
        address viewer
    ) external view returns (bool) {
        // Only batch creators (admin/processor) can access full data
        return hasRole(ADMIN_ROLE, viewer) || hasRole(PROCESSOR_ROLE, viewer);
    }

    /**
     * @dev Verify protected data matches expected hash
     */
    function verifyProtectedData(
        uint256 batchId,
        string calldata dataType,
        bytes calldata originalData
    ) external view returns (bool isValid) {
        ProtectedData memory protectedData = protectedBatchData[batchId][dataType];
        if (protectedData.dataHash == bytes32(0)) return false;
        
        bytes32 computedHash = keccak256(abi.encodePacked(originalData, protectedData.salt, protectedData.timestamp));
        return computedHash == protectedData.dataHash;
    }

    /* -------------------------------------------------------------------------- */
    /*                            INTERNAL HELPER FUNCTIONS                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if an address is the creator of a batch
     * @param batchId The batch identifier
     * @param account The address to check
     * @return isCreator Whether the address is the batch creator
     */
    function _isBatchCreator(uint256 batchId, address account) internal view returns (bool isCreator) {
        // This would need to be implemented based on how batch creators are tracked
        // For now, return false - should be overridden in child contracts
        return false;
    }

    /**
     * @dev Get enhanced role level including compliance-specific roles
     * @param account The address to check
     * @return roleLevel The role level (1=admin/processor, 2=distributor/verifier, 3=public)
     */
    function _getEnhancedRoleLevel(address account) internal view returns (uint8 roleLevel) {
        if (hasRole(ADMIN_ROLE, account) || hasRole(PROCESSOR_ROLE, account)) {
            return 1; // Full access - can see all data
        } else if (hasRole(DISTRIBUTOR_ROLE, account) || hasRole(ZK_VERIFIER_ROLE, account)) {
            return 2; // Limited access - can see some private data
        }
        return 3; // Public access - can only see public data
    }

    /**
     * @dev Check if a data type is marked as private in disclosure rules
     * @param dataType The data type to check
     * @param rules The selective disclosure rules
     * @return isPrivate Whether the data type is private
     */
    function _isDataTypePrivate(string calldata dataType, SelectiveDisclosureRules memory rules) internal pure returns (bool isPrivate) {
        if (_stringsEqual(dataType, "deforestation")) return rules.deforestationPrivate;
        if (_stringsEqual(dataType, "geolocation")) return rules.geolocationPrivate;
        if (_stringsEqual(dataType, "permit")) return rules.permitDataPrivate;
        if (_stringsEqual(dataType, "certificate")) return rules.certificateDataPrivate;
        if (_stringsEqual(dataType, "origin")) return rules.originDataPrivate;
        if (_stringsEqual(dataType, "boe")) return rules.boeDataPrivate;
        return true; // Default to private for unknown data types
    }

    /**
     * @dev Filter a claim based on privacy settings and user role
     * @param claim The original claim
     * @param isPrivate Whether the claim is private
     * @param userRoleLevel The user's role level
     * @return filteredClaim The filtered claim text
     */
    function _filterClaim(string memory claim, bool isPrivate, uint8 userRoleLevel) internal pure returns (string memory filteredClaim) {
        if (!isPrivate || userRoleLevel <= 2) {
            return claim; // Show full claim if not private or user has sufficient access
        }

        // Return generic message for private data that user cannot access
        if (_stringsEqual(claim, "")) {
            return "Data Not Available";
        }
        return "Compliance Verified - Details Protected";
    }

    /**
     * @dev Simple string equality check
     * @param a First string
     * @param b Second string
     * @return equal Whether strings are equal
     */
    function _stringsEqual(string memory a, string memory b) internal pure returns (bool equal) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
