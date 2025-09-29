// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IWAGACoffeeToken
 * @dev Interface for the WAGACoffeeToken contract
 * 
 * This interface defines the essential functions for interacting with the WAGACoffeeToken
 * contract, particularly focusing on batch management and token operations.
 */
interface IWAGACoffeeToken {
    /**
     * @dev Mints new tokens for a specific batch
     * @param to Address to receive the minted tokens
     * @param batchId ID of the batch to mint tokens for
     * @param amount Number of tokens to mint
     * Requirements:
     * - Caller must have MINTER_ROLE
     * - Batch must exist and be verified
     */
    function mintBatch(address to, uint256 batchId, uint256 amount) external;

    /**
     * @dev Checks if a batch has been created
     * @param batchId ID of the batch to check
     * @return bool True if the batch exists, false otherwise
     */
    function isBatchCreated(uint256 batchId) external view returns (bool);

    /**
     * @dev Get the quantity of a specific batch
     * @param batchId ID of the batch
     * @return uint256 Quantity of the batch
     */
    function getBatchQuantity(uint256 batchId) external view returns (uint256);

    /**
     * @dev Creates a new batch request for verification workflow
     * @param batchId ID of the batch to request
     * @param requestedQuantity Amount of tokens requested
     * @param requestDetails Additional details for the request
     * @return uint256 The request index for this batch
     */
    function createBatchRequest(
        uint256 batchId,
        uint256 requestedQuantity,
        string memory requestDetails
    ) external returns (uint256);

    /**
     * @dev Get batch request details by batch ID and request index
     */
    function getBatchRequest(uint256 batchId, uint256 requestIndex) external view returns (
        uint256 requestBatchId,
        address requester,
        uint256 requestedQuantity,
        string memory requestDetails,
        uint256 requestTimestamp,
        bool isFulfilled,
        uint256 fulfilledQuantity,
        uint256 fulfilledTimestamp
    );

    /**
     * @dev Creates a new batch for blockchain-first workflow
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @param quantity Number of coffee bags in the batch
     * @param pricePerUnit Price per unit in wei
     * @param origin Origin of the coffee
     * @param packagingInfo Packaging size ("250g" or "500g")
     * @param metadataURI IPFS URI for batch metadata
     * @return uint256 The ID of the newly created batch
     * Requirements:
     * - Caller must have PROCESSOR_ROLE
     */
    function createBatch(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin,
        string memory packagingInfo,
        string memory metadataURI
    ) external returns (uint256);

    /**
     * @dev Updates the IPFS URI for an existing batch
     * @param batchId ID of the batch to update
     * @param ipfsUri New IPFS URI for batch metadata
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - Batch must exist
     * - IPFS URI must not be empty
     */
    function updateBatchIPFS(
        uint256 batchId,
        string memory ipfsUri
    ) external;

    /**
     * @dev Get complete batch information
     */
    function getBatchInfo(uint256 batchId) external view returns (
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory packagingInfo,
        string memory metadataHash,
        uint256 lastVerifiedTimestamp
    );

    /**
     * @dev Get next batch ID that will be assigned
     */
    function getNextBatchId() external view returns (uint256);

    /**
     * @dev Get minted quantity for a batch
     */
    function getMintedQuantity(uint256 batchId) external view returns (uint256);

    /**
     * @dev Get available quantity for a batch
     */
    function getAvailableQuantity(uint256 batchId) external view returns (uint256);

    // ========== ACCESS CONTROL FUNCTIONS ==========
    
    /**
     * @dev Check if an account has a specific role
     * @param role The role to check
     * @param account The account to check
     * @return bool True if the account has the role
     */
    function hasRole(bytes32 role, address account) external view returns (bool);

    // ========== SELLER REGISTRATION FUNCTIONS ==========
    
    /**
     * @dev Get seller ID for an address
     * @param sellerAddress The seller's address
     * @return uint64 The seller ID
     */
    function getSellerId(address sellerAddress) external view returns (uint64);
    
    /**
     * @dev Get seller address from ID
     * @param sellerId The seller ID
     * @return address The seller's address
     */
    function getSellerAddress(uint64 sellerId) external view returns (address);
    
    /**
     * @dev Check if an address is a registered seller
     * @param account The address to check
     * @return bool True if registered
     */
    function isRegisteredSeller(address account) external view returns (bool);
}

