// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAAccessControl} from "./WAGAAccessControl.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";

/**
 * @title PrivacyLayer
 * @dev Simplified privacy layer for WAGA MVP with lightweight data protection
 */
contract PrivacyLayer is WAGAAccessControl, IPrivacyLayer {
    IWAGACoffeeToken public coffeeToken;

    constructor(address _coffeeToken) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
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

    /* -------------------------------------------------------------------------- */
    /*                                  Storage                                   */
    /* -------------------------------------------------------------------------- */

    mapping(uint256 => IPrivacyLayer.PrivacyConfig) public batchPrivacyConfig;
    mapping(uint256 => mapping(string => ProtectedData)) public protectedBatchData;

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

        require(
            hasAdminRole || hasProcessorRole,
            "PrivacyLayer: Must be admin or processor"
        );

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
     * @dev Update public claims after ZK proof verification
     */
    function updatePublicClaims(
        uint256 batchId,
        string calldata pricingClaim,
        string calldata qualityClaim,
        string calldata supplyChainClaim
    ) external onlyZKVerifier {
        batchPrivacyConfig[batchId].pricingClaim = pricingClaim;
        batchPrivacyConfig[batchId].qualityClaim = qualityClaim;
        batchPrivacyConfig[batchId].supplyChainClaim = supplyChainClaim;
        
        emit PublicClaimsUpdated(batchId, pricingClaim, qualityClaim, supplyChainClaim);
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
}
