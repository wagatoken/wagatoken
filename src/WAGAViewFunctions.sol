// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract WAGAViewFunctions {
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error WAGAViewFunctions__BatchDoesNotExist_getBatchQuantity();
   
   
    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */
    /**
     * @notice Essential batch information stored on-chain
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @param isVerified Whether batch has been verified by Proof of Reserve Manager
     * @param currentQuantity Current available quantity of tokens for this batch
     * @param pricePerUnit Price per unit in wei
     * @param packagingInfo Must be "250g" or "500g"
     * @param metadataHash IPFS CID or SHA-256 hash of off-chain metadata
     * @param isMetadataVerified Whether metadata has been verified
     */

    struct BatchInfo {
        uint256 productionDate;
        uint256 expiryDate;
        bool isVerified;
        uint256 currentQuantity;
        uint256 pricePerUnit;
        string packagingInfo;
        string metadataHash;
        bool isMetadataVerified;
        uint256 lastVerifiedTimestamp; // Timestamp of last metadata verification
    }

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Batch information storage
    mapping(uint256 batchId => BatchInfo) public s_batchInfo;

    // Optimized active batch tracking system
    mapping(uint256 => bool) public s_isActiveBatch; // O(1) status lookup
    uint256[] public s_activeBatchIds; // Direct enumeration array
    mapping(uint256 batchId => uint256 index) public s_activeBatchIndex; // O(1) removal support

    // Historical tracking
    uint256[] public allBatchIds;

    uint256 public _nextBatchId = 2025000001; // Start from 1 for batch IDs

    /* -------------------------------------------------------------------------- */
    /*                           EXTERNAL VIEW FUNCTIONS                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Returns all currently active batch IDs
     * @return Array of active batch IDs
     */
    function getActiveBatchIds() external view returns (uint256[] memory) {
        return s_activeBatchIds;
    }

    /**
     * @notice Returns the count of active batches
     * @return Number of currently active batches
     */
    function getActiveBatchCount() external view returns (uint256) {
        return s_activeBatchIds.length;
    }

    /**
     * @notice Returns complete batch information
     * @param batchId ID of the batch to query
     * @return productionDate Batch production timestamp
     * @return expiryDate Batch expiry timestamp
     * @return isVerified Whether batch is verified
     * @return currentQuantity Current quantity available
     * @return pricePerUnit Price per unit in wei
     * @return packagingInfo Packaging size information
     * @return metadataHash Hash of off-chain metadata
     * @return isMetadataVerified Whether metadata is verified
     */
    function getbatchInfo(
        uint256 batchId
    )
        external
        view
        returns (
            uint256 productionDate,
            uint256 expiryDate,
            bool isVerified,
            uint256 currentQuantity,
            uint256 pricePerUnit,
            string memory packagingInfo,
            string memory metadataHash,
            bool isMetadataVerified
        )
    {
        BatchInfo storage info = s_batchInfo[batchId];
        return (
            info.productionDate,
            info.expiryDate,
            info.isVerified,
            info.currentQuantity,
            info.pricePerUnit,
            info.packagingInfo,
            info.metadataHash,
            info.isMetadataVerified
        );
    }

    /**
     * @notice Checks if a batch is currently active
     * @param batchId ID of the batch to check
     * @return True if batch is active
     */
    function isBatchActive(uint256 batchId) external view returns (bool) {
        return s_isActiveBatch[batchId];
    }

    /**
     * @notice Returns current quantity for a batch
     * @param batchId ID of the batch to query
     * @return Current quantity available
     */
    function getBatchQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert WAGAViewFunctions__BatchDoesNotExist_getBatchQuantity();
        }
        return s_batchInfo[batchId].currentQuantity;
    }

    /**
     * @notice Returns the next batch ID that will be assigned
     * @return Next batch ID
     */
    function getNextBatchId() external view returns (uint256) {
        return _nextBatchId;
    }

    /**
     * @notice Returns the inventory manager address
     * @return Current inventory manager address
     */

    function getAllCreatedBatches() external view returns (uint256[] memory) {
        // Assuming you have an array or mapping that tracks all batch IDs
        // For example, if you have: uint256[] private _allBatchIds;
        return allBatchIds;
    }

    function getBatchExpiryDate(
        uint256 batchId
    ) external view returns (uint256) {
        // Replace with your actual storage logic for expiry timestamps
        return s_batchInfo[batchId].expiryDate;
    }

    function getBatchCreationDate(
        uint256 batchId
    ) external view returns (uint256) {
        // Replace with your actual storage logic for creation timestamps
        return s_batchInfo[batchId].productionDate;
    }

    function getBatchLastVerifiedTimestamp(
        uint256 batchId
    ) external view returns (uint256) {
        // Replace with your actual storage logic for last verified timestamps
        return s_batchInfo[batchId].lastVerifiedTimestamp;
    }

      /**
     * @notice Checks if a batch has been created
     * @param batchId ID of the batch to check
     * @return True if batch exists
     */
    function isBatchCreated(uint256 batchId) public view returns (bool) {
        return s_batchInfo[batchId].productionDate != 0;
    }

}
