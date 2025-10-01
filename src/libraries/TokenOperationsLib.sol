// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title TokenOperationsLib
 * @dev Library for ERC1155 token operations including minting, burning, and transfers
 * @notice Extracted from WAGACoffeeTokenCore to reduce contract size
 */
library TokenOperationsLib {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */
    
    event TokensMinted(uint256 indexed batchId, address indexed to, uint256 amount);
    event TokensBurned(uint256 indexed batchId, address indexed from, uint256 amount);
    event TokensTransferred(uint256 indexed batchId, address indexed from, address indexed to, uint256 amount);
    
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error TokenOperationsLib__InvalidAmount();
    error TokenOperationsLib__InvalidAddress();
    error TokenOperationsLib__InsufficientBalance();
    error TokenOperationsLib__InsufficientSupply();
    error TokenOperationsLib__BatchNotFound();
    error TokenOperationsLib__ExceedsMaxSupply();

    /* -------------------------------------------------------------------------- */
    /*                                  Structs                                  */
    /* -------------------------------------------------------------------------- */

    struct MintData {
        uint256 batchId;
        address to;
        uint256 amount;
        bytes data;
    }

    struct BatchMintData {
        uint256[] batchIds;
        address[] to;
        uint256[] amounts;
        bytes data;
    }

    /* -------------------------------------------------------------------------- */
    /*                               Minting Logic                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates mint parameters
     * @param mintData The mint data structure
     */
    function validateMintData(
        MintData memory mintData
    ) external pure returns (bool) {
        // Validation
        if (mintData.to == address(0)) return false;
        if (mintData.amount == 0) return false;
        return true;
    }

    /**
     * @dev Validates burn parameters
     * @param contractAddress The contract address for balance checking
     * @param batchId The batch ID
     * @param from The address to burn from
     * @param amount The amount to burn
     */
    function validateBurnData(
        address contractAddress,
        uint256 batchId,
        address from,
        uint256 amount
    ) external view returns (bool) {
        // Validation
        if (from == address(0)) return false;
        if (amount == 0) return false;

        // Check balance before burning
        uint256 balance = IERC1155(contractAddress).balanceOf(from, batchId);
        return balance >= amount;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Batch Operations                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates batch mint parameters
     * @param batchMintData The batch mint data structure
     */
    function validateBatchMintData(
        BatchMintData memory batchMintData
    ) external pure returns (bool) {
        // Validation
        uint256 length = batchMintData.batchIds.length;
        if (length != batchMintData.to.length || length != batchMintData.amounts.length) {
            return false;
        }

        // Validate each batch and recipient
        for (uint256 i = 0; i < length; i++) {
            if (batchMintData.to[i] == address(0)) return false;
            if (batchMintData.amounts[i] == 0) return false;
        }
        return true;
    }

    /* -------------------------------------------------------------------------- */
    /*                            Transfer Operations                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Safe transfer with additional validation
     * @param contractAddress The contract address
     * @param from Source address
     * @param to Destination address
     * @param batchId The batch ID
     * @param amount Amount to transfer
     * @param data Additional data
     */
    function safeTransferFromWithValidation(
        address contractAddress,
        address from,
        address to,
        uint256 batchId,
        uint256 amount,
        bytes memory data
    ) external {
        // Validation
        if (from == address(0) || to == address(0)) revert TokenOperationsLib__InvalidAddress();
        if (amount == 0) revert TokenOperationsLib__InvalidAmount();

        // Check balance
        uint256 balance = IERC1155(contractAddress).balanceOf(from, batchId);
        if (balance < amount) revert TokenOperationsLib__InsufficientBalance();

        // Perform transfer using the contract's safeTransferFrom
        IERC1155(contractAddress).safeTransferFrom(from, to, batchId, amount, data);
        
        emit TokensTransferred(batchId, from, to, amount);
    }

    /**
     * @dev Batch safe transfer with validation
     * @param contractAddress The contract address
     * @param from Source address
     * @param to Destination address
     * @param batchIds Array of batch IDs
     * @param amounts Array of amounts
     * @param data Additional data
     */
    function safeBatchTransferFromWithValidation(
        address contractAddress,
        address from,
        address to,
        uint256[] memory batchIds,
        uint256[] memory amounts,
        bytes memory data
    ) external {
        // Validation
        if (from == address(0) || to == address(0)) revert TokenOperationsLib__InvalidAddress();
        if (batchIds.length != amounts.length) revert TokenOperationsLib__InvalidAmount();

        // Check balances
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (amounts[i] == 0) revert TokenOperationsLib__InvalidAmount();
            uint256 balance = IERC1155(contractAddress).balanceOf(from, batchIds[i]);
            if (balance < amounts[i]) revert TokenOperationsLib__InsufficientBalance();
        }

        // Perform batch transfer
        IERC1155(contractAddress).safeBatchTransferFrom(from, to, batchIds, amounts, data);

        // Emit events for each transfer
        for (uint256 i = 0; i < batchIds.length; i++) {
            emit TokensTransferred(batchIds[i], from, to, amounts[i]);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              Utility Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Gets total supply for a batch
     * @param contractAddress The contract address
     * @param batchId The batch ID
     * @return supply Total supply for the batch
     */
    function getTotalSupply(
        address contractAddress,
        uint256 batchId
    ) external view returns (uint256 supply) {
        return ERC1155Supply(contractAddress).totalSupply(batchId);
    }

    /**
     * @dev Checks if a batch exists (has supply > 0)
     * @param contractAddress The contract address
     * @param batchId The batch ID
     * @return exists True if batch exists
     */
    function exists(
        address contractAddress,
        uint256 batchId
    ) external view returns (bool) {
        return ERC1155Supply(contractAddress).exists(batchId);
    }

    /**
     * @dev Gets balance for multiple accounts and batches
     * @param contractAddress The contract address
     * @param accounts Array of account addresses
     * @param batchIds Array of batch IDs
     * @return balances Array of balances
     */
    function balanceOfBatch(
        address contractAddress,
        address[] memory accounts,
        uint256[] memory batchIds
    ) external view returns (uint256[] memory balances) {
        return IERC1155(contractAddress).balanceOfBatch(accounts, batchIds);
    }

    /* -------------------------------------------------------------------------- */
    /*                           Supply Management                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Updates minted quantity for a batch
     * @param batchInfo Storage reference to batch info mapping
     * @param batchId The batch ID
     * @param mintedAmount Amount that was minted
     */
    function updateMintedQuantity(
        mapping(uint256 => uint256) storage batchInfo,
        uint256 batchId,
        uint256 mintedAmount
    ) external {
        // This would need to be adapted based on the actual batch info structure
        // For now, assuming batchInfo maps batchId to available quantity
        if (batchInfo[batchId] < mintedAmount) {
            revert TokenOperationsLib__InsufficientSupply();
        }
        batchInfo[batchId] -= mintedAmount;
    }

    /**
     * @dev Calculates maximum mintable amount for a batch
     * @param batchTotalQuantity Total quantity in batch
     * @param alreadyMinted Amount already minted
     * @return maxMintable Maximum amount that can still be minted
     */
    function calculateMaxMintable(
        uint256 batchTotalQuantity,
        uint256 alreadyMinted
    ) external pure returns (uint256 maxMintable) {
        if (alreadyMinted >= batchTotalQuantity) {
            return 0;
        }
        return batchTotalQuantity - alreadyMinted;
    }
}