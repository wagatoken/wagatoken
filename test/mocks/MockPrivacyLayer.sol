// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../src/Interfaces/IPrivacyLayer.sol";

/**
 * @title MockPrivacyLayer
 * @dev Mock implementation of IPrivacyLayer for testing
 */
contract MockPrivacyLayer is IPrivacyLayer {
    
    // Mapping to store privacy configurations for each batch
    mapping(uint256 => PrivacyConfig) private batchPrivacyConfigs;
    
    // Event tracking for testing purposes
    event PrivacyConfigured(uint256 indexed batchId, address indexed caller);
    event PrivacyConfiguredWithCaller(uint256 indexed batchId, address indexed originalCaller, address indexed actualCaller);
    event PublicClaimsUpdated(uint256 indexed batchId);

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

    // Helper functions for testing
    
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
}
