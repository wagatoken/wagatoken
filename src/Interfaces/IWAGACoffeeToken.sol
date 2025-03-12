// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
     * @dev Creates a new batch of coffee tokens with associated metadata
     * @param ipfsUri IPFS URI containing detailed batch metadata
     * @param productionDate Timestamp when the batch was produced
     * @param expiryDate Timestamp when the batch expires
     * @return uint256 The ID of the newly created batch
     * Requirements:
     * - Caller must have ADMIN_ROLE
     * - IPFS URI must not be empty
     */
    function createBatch(
        string memory ipfsUri,
        uint256 productionDate,
        uint256 expiryDate
    ) external returns (uint256);
}

