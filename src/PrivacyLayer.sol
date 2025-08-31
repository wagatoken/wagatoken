// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAAccessControl} from "./WAGAAccessControl.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";

/**
 * @title PrivacyLayer
 * @dev Simplified privacy layer for WAGA MVP with lightweight data protection
 */
contract PrivacyLayer is WAGAAccessControl, IPrivacyLayer {
    
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
        
        // Admin and processor can see everything
        if (hasRole(ADMIN_ROLE, viewer) || hasRole(PROCESSOR_ROLE, viewer)) {
            return (config.pricingClaim, config.qualityClaim, config.supplyChainClaim);
        }
        
        // Distributor can see pricing for purchasing decisions
        if (hasRole(DISTRIBUTOR_ROLE, viewer)) {
            return (
                config.pricingPrivate ? "Contact for Pricing" : config.pricingClaim,
                config.qualityClaim,
                config.supplyChainClaim
            );
        }
        
        // Public sees only verified claims
        return (
            config.pricingPrivate ? "Competitively Priced" : config.pricingClaim,
            config.qualityPrivate ? "Quality Verified" : config.qualityClaim,
            config.supplyChainPrivate ? "Traceable Origin" : config.supplyChainClaim
        );
    }

    /**
     * @dev Check if user can access full data for a batch
     */
    function canAccessFullData(
        uint256 batchId,
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
