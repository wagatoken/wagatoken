// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BatchOperationsLib
 * @dev Library for batch creation, management, and validation operations
 * @notice Extracted from WAGACoffeeTokenCore to reduce contract size
 * @notice Uses interface-based approach to avoid struct definition conflicts
 */
library BatchOperationsLib {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error BatchOperationsLib__InvalidQuantity();
    error BatchOperationsLib__InvalidPricePerUnit();
    error BatchOperationsLib__InvalidProductionDate();
    error BatchOperationsLib__InvalidExpiryDate();
    error BatchOperationsLib__BatchDoesNotExist();
    error BatchOperationsLib__BatchNotActive();

    /* -------------------------------------------------------------------------- */
    /*                              Batch Creation                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates batch creation parameters
     * @param productionDate Batch production date
     * @param expiryDate Batch expiry date
     * @param quantity Total quantity in batch
     * @param pricePerUnit Price per unit
     * @return isValid True if parameters are valid
     */
    function validateBatchCreationParams(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit
    ) external pure returns (bool isValid) {
        if (quantity == 0) return false;
        if (pricePerUnit == 0) return false;
        if (productionDate == 0) return false;
        if (expiryDate <= productionDate) return false;
        return true;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Batch Validation                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Checks if batch is in valid state (simplified interface-based check)
     * @param batchExists Function result from isBatchCreated
     * @param batchActive Function result from isBatchActive  
     * @return isValid True if batch is valid
     */
    function validateBatchState(
        bool batchExists,
        bool batchActive
    ) external pure returns (bool isValid) {
        return batchExists && batchActive;
    }

    /**
     * @dev Validates if expiry date is valid
     * @param expiryDate The expiry timestamp
     * @return active True if not expired
     */
    function isBatchNotExpired(
        uint256 expiryDate
    ) external view returns (bool active) {
        return block.timestamp <= expiryDate;
    }

    /* -------------------------------------------------------------------------- */
    /*                                Batch Requests                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates batch request parameters
     * @param requestedQuantity Quantity requested
     * @param totalQuantity Total batch quantity
     * @return isValid True if request is valid
     */
    function validateBatchRequestParams(
        uint256 requestedQuantity,
        uint256 totalQuantity
    ) external pure returns (bool isValid) {
        if (requestedQuantity == 0) return false;
        if (requestedQuantity > totalQuantity) return false;
        return true;
    }

    /* -------------------------------------------------------------------------- */
    /*                                Utility Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Calculates available quantity
     * @param totalQuantity Total quantity in batch
     * @param mintedQuantity Already minted quantity
     * @return available Available quantity
     */
    function calculateAvailableQuantity(
        uint256 totalQuantity,
        uint256 mintedQuantity
    ) external pure returns (uint256 available) {
        if (mintedQuantity >= totalQuantity) {
            return 0;
        }
        return totalQuantity - mintedQuantity;
    }

    /**
     * @dev Validates quantity bounds
     * @param amount Amount to check
     * @param maxAmount Maximum allowed amount
     * @return isValid True if amount is within bounds
     */
    function validateQuantityBounds(
        uint256 amount,
        uint256 maxAmount
    ) external pure returns (bool isValid) {
        return amount > 0 && amount <= maxAmount;
    }
}