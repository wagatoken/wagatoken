// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IPrivacyLayer} from "./IPrivacyLayer.sol";

/**
 * @title IWAGABatchManager
 * @dev Interface for WAGABatchManager contract - manages only additional metadata and privacy functions
 * @dev Core batch data is managed by WAGACoffeeTokenCore
 */
interface IWAGABatchManager {
    /**
     * @dev Register additional batch metadata after creation
     * Called by WAGACoffeeTokenCore after batch creation
     */
    function registerBatchCreation(
        uint256 batchId,
        string calldata origin,
        address creator
    ) external;

    /**
     * @dev Administrative functions for batch management
     */
    function resetBatchVerificationFlags(uint256 batchId) external;
    function markBatchExpired(uint256 batchId) external;
    function updateBatchStatus(uint256 batchId, bool isActive) external;
    function updateInventory(uint256 batchId, uint256 verifiedQuantity) external;
    function verifyBatchMetadata(uint256 batchId, string calldata verifiedPackaging, string calldata verifiedMetadataHash) external;
    function isBatchMetadataVerified(uint256 batchId) external view returns (bool);

    /**
     * @dev Get additional metadata managed by BatchManager
     * @dev Core batch data should be accessed through WAGACoffeeTokenCore
     */
    function getBatchAdditionalInfo(
        uint256 batchId
    ) external view returns (
        string memory origin,
        address creator,
        uint256 timestamp,
        bool isExpired,
        bool isMetadataVerified
    );

    /**
     * @dev Privacy and ZK functions
     */
    function getBatchPrivacyConfig(uint256 batchId) external view returns (IPrivacyLayer.PrivacyConfig memory);
    function updateZKClaims(uint256 batchId, string calldata pricingClaim, string calldata qualityClaim, string calldata supplyChainClaim) external;
    function canViewPricingData(uint256 batchId, address caller) external view returns (bool);
    function canViewSupplyChainData(uint256 batchId, address caller) external view returns (bool);
}
