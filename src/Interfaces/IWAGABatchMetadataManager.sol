// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPrivacyLayer} from "./IPrivacyLayer.sol";

/**
 * @title IWAGABatchMetadataManager
 * @dev Interface for WAGABatchMetadataManager contract - manages core batch metadata and verification
 */
interface IWAGABatchMetadataManager {
    /**
     * @dev Register batch creation with metadata
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
    function markBatchAsVerified(uint256 batchId) external;
    function updateBatchStatus(uint256 batchId, bool isActive) external;
    function updateInventory(uint256 batchId, uint256 verifiedQuantity) external;
    function verifyBatchMetadata(uint256 batchId, string calldata verifiedPackaging, string calldata verifiedMetadataHash) external;
    
    /**
     * @dev View functions for batch metadata
     */
    function isBatchMetadataVerified(uint256 batchId) external view returns (bool);
    function isBatchVerified(uint256 batchId) external view returns (bool);
    function getVerifiedMetadataHash(uint256 batchId) external view returns (string memory);

    /**
     * @dev Get additional metadata managed by this contract
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
     * @dev ZK claims management
     */
    function updateZKClaims(uint256 batchId, string calldata pricingClaim, string calldata qualityClaim, string calldata supplyChainClaim) external;
    
    /**
     * @dev Privacy access control functions
     */
    function canViewPricingData(uint256 batchId, address viewer) external view returns (bool);
    function canViewSupplyChainData(uint256 batchId, address viewer) external view returns (bool);
}