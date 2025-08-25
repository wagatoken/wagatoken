// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

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
     * @dev Creates a new batch for blockchain-first workflow
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @param quantity Number of coffee bags in the batch
     * @param pricePerUnit Price per unit in wei
     * @param packagingInfo Packaging size ("250g" or "500g")
     * @param metadataHash Placeholder hash for metadata
     * @return uint256 The ID of the newly created batch
     * Requirements:
     * - Caller must have ADMIN_ROLE
     */
    function createBatch(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory packagingInfo,
        string memory metadataHash
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
}

