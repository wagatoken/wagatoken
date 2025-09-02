// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IPrivacyLayer} from "./IPrivacyLayer.sol";

interface IWAGABatchManager {
    function createBatchInfo(
        uint256 batchId,
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string calldata origin,
        string calldata packagingInfo,
        IPrivacyLayer.PrivacyLevel privacyLevel
    ) external;

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
    ) external;
    function updateInventory(uint256 batchId, uint256 newQuantity) external;
    function updateBatchStatus(uint256 batchId, bool isActive) external;
    function verifyBatchMetadata(uint256 batchId, uint256 verifiedPrice, string calldata verifiedPackaging, string calldata verifiedMetadataHash) external;
    function isBatchMetadataVerified(uint256 batchId) external view returns (bool);
    function resetBatchVerificationFlags(uint256 batchId) external;
    function markBatchExpired(uint256 batchId) external;

    function getBatchInfo(
        uint256 batchId
    ) external view returns (
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin,
        string memory packagingInfo,
        address creator,
        uint256 timestamp
    );
}
