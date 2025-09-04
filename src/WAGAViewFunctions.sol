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
     * @param quantity Number of coffee bags in this batch (gets verified and minted)
     * @param mintedQuantity Total tokens minted for this batch
     * @param pricePerUnit Price per unit in wei
     * @param packagingInfo Must be "250g" or "500g"
     * @param metadataHash IPFS CID or SHA-256 hash of off-chain metadata
     * @param isMetadataVerified Whether metadata has been verified
     * @param lastVerifiedTimestamp Timestamp of last metadata verification
     */

    struct BatchInfo {
        uint256 productionDate;
        uint256 expiryDate;
        bool isVerified; // This flag should be set to false before every Inventory Verification request.
        uint256 quantity; // Number of coffee bags in batch (for verification and minting)
        uint256 mintedQuantity; // Total tokens minted for this batch
        uint256 pricePerUnit;
        string packagingInfo;
        string metadataHash;
        bool isMetadataVerified; // This flag should be set to false before every Inventory Verification request.
        uint256 lastVerifiedTimestamp; // Timestamp of last metadata verification
    }

    /**
     * @notice Batch request structure for tracking redemption requests
     * @param batchId The batch identifier this request is for
     * @param requester Address that made the request
     * @param requestedQuantity Amount of tokens requested
     * @param requestDetails String details about the request
     * @param requestTimestamp When the request was made
     * @param isFulfilled Whether the request has been fulfilled
     * @param fulfilledQuantity Amount that was actually fulfilled
     * @param fulfilledTimestamp When the request was fulfilled
     */
    struct BatchRequest {
        uint256 batchId;
        address requester;
        uint256 requestedQuantity;
        string requestDetails;
        uint256 requestTimestamp;
        bool isFulfilled;
        uint256 fulfilledQuantity;
        uint256 fulfilledTimestamp;
    }

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Batch information storage
    mapping(uint256 batchId => BatchInfo) public s_batchInfo;

    // Batch request management
    mapping(uint256 => mapping(uint256 => BatchRequest)) public batchRequestsByIndex;
    mapping(uint256 => uint256) public s_batchRequestCount; // batchId => count

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
     * @return quantity Number of coffee bags in batch
     * @return pricePerUnit Price per unit in wei
     * @return packagingInfo Packaging size information
     * @return metadataHash Hash of off-chain metadata
     * @return isMetadataVerified Whether metadata is verified
     * @return lastVerifiedTimestamp Timestamp of last verification
     */
    function getbatchInfo(
        uint256 batchId
    )
        external
        view
        virtual
        returns (
            uint256 productionDate,
            uint256 expiryDate,
            bool isVerified,
            uint256 quantity,
            uint256 pricePerUnit,
            string memory packagingInfo,
            string memory metadataHash,
            bool isMetadataVerified,
            uint256 lastVerifiedTimestamp
        )
    {
        BatchInfo storage info = s_batchInfo[batchId];
        return (
            info.productionDate,
            info.expiryDate,
            info.isVerified,
            info.quantity,
            info.pricePerUnit,
            info.packagingInfo,
            info.metadataHash,
            info.isMetadataVerified,
            info.lastVerifiedTimestamp
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
     * @notice Returns quantity for a batch
     * @param batchId ID of the batch to query
     * @return Quantity of coffee bags in batch
     */
    function getBatchQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert WAGAViewFunctions__BatchDoesNotExist_getBatchQuantity();
        }
        return s_batchInfo[batchId].quantity;
    }

    /**
     * @notice Returns minted quantity for a batch
     * @param batchId ID of the batch to query
     * @return Minted quantity of tokens for batch
     */
    function getBatchMintedQuantity(uint256 batchId) external view returns (uint256) {
        if (!isBatchCreated(batchId)) {
            revert WAGAViewFunctions__BatchDoesNotExist_getBatchQuantity();
        }
        return s_batchInfo[batchId].mintedQuantity;
    }

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
    function isBatchCreated(uint256 batchId) public view virtual returns (bool) {
        return s_batchInfo[batchId].productionDate != 0;
    }

    /* -------------------------------------------------------------------------- */
    /*                        BATCH REQUEST FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Get the count of requests for a specific batch
     * @param batchId ID of the batch to query
     * @return Number of requests made for this batch
     */
    function getBatchRequestCount(uint256 batchId) external view returns (uint256) {
        return s_batchRequestCount[batchId];
    }

    /**
     * @notice Get details of a specific batch request
     * @param batchId ID of the batch
     * @param requestIndex Index of the request to query
     * @return requestBatchId The batch ID this request is for
     * @return requester Address that made the request
     * @return requestedQuantity Amount of tokens requested
     * @return requestDetails String details about the request
     * @return requestTimestamp When the request was made
     * @return isFulfilled Whether the request has been fulfilled
     * @return fulfilledQuantity Amount that was actually fulfilled
     * @return fulfilledTimestamp When the request was fulfilled
     */
    function getBatchRequest(
        uint256 batchId,
        uint256 requestIndex
    ) external view returns (
        uint256 requestBatchId,
        address requester,
        uint256 requestedQuantity,
        string memory requestDetails,
        uint256 requestTimestamp,
        bool isFulfilled,
        uint256 fulfilledQuantity,
        uint256 fulfilledTimestamp
    ) {
        BatchRequest storage request = batchRequestsByIndex[batchId][requestIndex];
        return (
            request.batchId,
            request.requester,
            request.requestedQuantity,
            request.requestDetails,
            request.requestTimestamp,
            request.isFulfilled,
            request.fulfilledQuantity,
            request.fulfilledTimestamp
        );
    }
}
