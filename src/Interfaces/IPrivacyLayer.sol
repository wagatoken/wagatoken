// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title IPrivacyLayer
 * @dev Privacy layer interface focusing on 3 core data types
 */
interface IPrivacyLayer {
    
    enum PrivacyLevel {
        PUBLIC,      // All data visible
        SELECTIVE,   // ZK-verified claims only
        PRIVATE      // Minimal verified claims
    }

    struct PrivacyConfig {
        bool pricingPrivate;
        bool qualityPrivate; 
        bool supplyChainPrivate;
        PrivacyLevel level;
        string pricingClaim;        // e.g., "Competitively Priced"
        string qualityClaim;        // e.g., "Premium Quality"
        string supplyChainClaim;    // e.g., "Single-Origin Ethiopian"
    }

    /**
     * @dev Configure privacy for a batch
     */
    function configurePrivacy(
        uint256 batchId,
        PrivacyConfig calldata config
    ) external;

    /**
     * @dev Configure privacy for a batch with explicit caller
     * Used by WAGABatchManager to pass the original caller
     */
    function configurePrivacyWithCaller(
        address originalCaller,
        uint256 batchId,
        PrivacyConfig calldata config
    ) external;

    /**
     * @dev Get privacy configuration for a batch
     */
    function getPrivacyConfig(
        uint256 batchId
    ) external view returns (PrivacyConfig memory);

    /**
     * @dev Update public claims after ZK proof verification
     */
    function updatePublicClaims(
        uint256 batchId,
        string calldata pricingClaim,
        string calldata qualityClaim,
        string calldata supplyChainClaim
    ) external;
}
