// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../src/Interfaces/IPrivacyLayer.sol";

/**
 * @title MockPrivacyLayer
 * @dev Mock implementation of IPrivacyLayer for testing
 */
contract MockPrivacyLayer is IPrivacyLayer {
    
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
    
    // Mapping to store privacy configurations for each batch
    mapping(uint256 => PrivacyConfig) private batchPrivacyConfigs;
    
    // Mapping to store protected data (similar to real PrivacyLayer)
    mapping(uint256 => mapping(string => ProtectedData)) public protectedBatchData;
    
    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */
    
    // Event tracking for testing purposes
    event PrivacyConfigured(uint256 indexed batchId, address indexed caller);
    event PrivacyConfiguredWithCaller(uint256 indexed batchId, address indexed originalCaller, address indexed actualCaller);
    event PublicClaimsUpdated(uint256 indexed batchId);
    event DataProtected(uint256 indexed batchId, string dataType, bytes32 dataHash, address indexed dataOwner);

    /**
     * @dev Configure privacy for a batch
     */
    function configurePrivacy(
        uint256 batchId,
        PrivacyConfig calldata config
    ) external override {
        batchPrivacyConfigs[batchId] = config;
        emit PrivacyConfigured(batchId, msg.sender);
    }

    /**
     * @dev Configure privacy for a batch with explicit caller
     * Used by WAGABatchManager to pass the original caller
     */
    function configurePrivacyWithCaller(
        address originalCaller,
        uint256 batchId,
        PrivacyConfig calldata config
    ) external override {
        batchPrivacyConfigs[batchId] = config;
        emit PrivacyConfiguredWithCaller(batchId, originalCaller, msg.sender);
    }

    /**
     * @dev Get privacy configuration for a batch
     */
    function getPrivacyConfig(
        uint256 batchId
    ) external view override returns (PrivacyConfig memory) {
        return batchPrivacyConfigs[batchId];
    }

    /**
     * @dev Update public claims after ZK proof verification
     */
    function updatePublicClaims(
        uint256 batchId,
        string calldata pricingClaim,
        string calldata qualityClaim,
        string calldata supplyChainClaim
    ) external override {
        PrivacyConfig storage config = batchPrivacyConfigs[batchId];
        config.pricingClaim = pricingClaim;
        config.qualityClaim = qualityClaim;
        config.supplyChainClaim = supplyChainClaim;
        emit PublicClaimsUpdated(batchId);
    }

    /**
     * @dev Protect sensitive data with explicit caller
     * Used by WAGABatchManager for Ethiopian compliance data
     */
    function protectDataWithCaller(
        address originalCaller,
        uint256 batchId,
        string calldata dataType,
        string calldata dataHash
    ) external override {
        // Create salt and hash for protecting the data (mock implementation)
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
    /*                              Helper Functions                              */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Check if privacy config exists for a batch
     */
    function hasPrivacyConfig(uint256 batchId) external view returns (bool) {
        PrivacyConfig memory config = batchPrivacyConfigs[batchId];
        // Check if any field is set (indicating the config was initialized)
        return config.level != PrivacyLevel.PUBLIC || 
               config.pricingPrivate || 
               config.qualityPrivate || 
               config.supplyChainPrivate ||
               bytes(config.pricingClaim).length > 0 ||
               bytes(config.qualityClaim).length > 0 ||
               bytes(config.supplyChainClaim).length > 0;
    }

    /**
     * @dev Reset privacy config for a batch (for testing cleanup)
     */
    function resetPrivacyConfig(uint256 batchId) external {
        delete batchPrivacyConfigs[batchId];
    }

    /**
     * @dev Check if protected data exists for a batch and data type
     */
    function hasProtectedData(uint256 batchId, string calldata dataType) external view returns (bool) {
        return protectedBatchData[batchId][dataType].timestamp > 0;
    }

    /**
     * @dev Get protected data for a batch and data type
     */
    function getProtectedData(uint256 batchId, string calldata dataType) external view returns (ProtectedData memory) {
        return protectedBatchData[batchId][dataType];
    }

    /**
     * @dev Reset protected data for a batch and data type (for testing cleanup)
     */
    function resetProtectedData(uint256 batchId, string calldata dataType) external {
        delete protectedBatchData[batchId][dataType];
    }

    /**
     * @dev Get the data owner for protected data
     */
    function getDataOwner(uint256 batchId, string calldata dataType) external view returns (address) {
        return protectedBatchData[batchId][dataType].dataOwner;
    }
}