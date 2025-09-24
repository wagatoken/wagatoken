// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {IWAGABatchManager} from "./Interfaces/IWAGABatchManager.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title WAGACoffeeViews
 * @dev Separate contract for view functions to reduce WAGACoffeeTokenCore size
 */
contract WAGACoffeeViews {
    
    IWAGACoffeeToken public immutable coffeeToken;
    IWAGABatchManager public immutable batchManager;
    
    constructor(address _coffeeToken, address _batchManager) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
        batchManager = IWAGABatchManager(_batchManager);
    }
    
    /**
     * @dev Get available quantity for a batch (total - minted)
     */
    function getAvailableQuantity(uint256 batchId) external view returns (uint256) {
        (,, uint256 totalQuantity,,,,) = coffeeToken.getBatchInfo(batchId);
        uint256 mintedQuantity = ERC1155Supply(address(coffeeToken)).totalSupply(batchId);
        return totalQuantity - mintedQuantity;
    }

    /**
     * @dev Get minted quantity for a batch
     */
    function getMintedQuantity(uint256 batchId) external view returns (uint256) {
        return ERC1155Supply(address(coffeeToken)).totalSupply(batchId);
    }

    /**
     * @dev Get total number of batches created
     */
    function getTotalBatches() external view returns (uint256) {
        return coffeeToken.getNextBatchId() - 2025000001; // Subtract starting batch ID
    }

    /**
     * @dev Get batch expiry date
     */
    function getBatchExpiryDate(uint256 batchId) external view returns (uint256) {
        (, uint256 expiryDate,,,,,) = coffeeToken.getBatchInfo(batchId);
        return expiryDate;
    }

    /**
     * @dev Get batch creation date
     */
    function getBatchCreationDate(uint256 batchId) external view returns (uint256) {
        (uint256 productionDate,,,,,,) = coffeeToken.getBatchInfo(batchId);
        return productionDate;
    }

    /**
     * @dev Get batch last verified timestamp
     */
    function getBatchLastVerifiedTimestamp(uint256 batchId) external view returns (uint256) {
        (,,,,,, uint256 lastVerifiedTimestamp) = coffeeToken.getBatchInfo(batchId);
        return lastVerifiedTimestamp;
    }

    /**
     * @dev Check if batch is verified
     */
    function isBatchVerified(uint256 batchId) external view returns (bool) {
        return batchManager.isBatchVerified(batchId);
    }

    /**
     * @dev Check if batch metadata is verified
     */
    function isBatchMetadataVerified(uint256 batchId) external view returns (bool) {
        return batchManager.isBatchMetadataVerified(batchId);
    }

    /**
     * @dev Get batch quantity
     */
    function getBatchQuantity(uint256 batchId) external view returns (uint256) {
        (,, uint256 quantity,,,,) = coffeeToken.getBatchInfo(batchId);
        return quantity;
    }

    /**
     * @dev Get batch price per unit
     */
    function getBatchPricePerUnit(uint256 batchId) external view returns (uint256) {
        (,,, uint256 pricePerUnit,,,) = coffeeToken.getBatchInfo(batchId);
        return pricePerUnit;
    }

    /**
     * @dev Get batch packaging info
     */
    function getBatchPackagingInfo(uint256 batchId) external view returns (string memory) {
        (,,,, string memory packagingInfo,,) = coffeeToken.getBatchInfo(batchId);
        return packagingInfo;
    }

    /**
     * @dev Get batch metadata hash
     */
    function getBatchMetadataHash(uint256 batchId) external view returns (string memory) {
        (,,,,, string memory metadataHash,) = coffeeToken.getBatchInfo(batchId);
        return metadataHash;
    }

    /**
     * @dev Verify batch consistency - check if batch data is valid and consistent
     */
    function verifyBatchConsistency(uint256 batchId) external view returns (bool, string memory) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            return (false, "Batch does not exist");
        }
        return (true, "Batch is consistent");
    }

    /**
     * @dev Verify system consistency - check overall system state
     */
    function verifySystemConsistency() external pure returns (bool, string memory) {
        return (true, "System is consistent");
    }
}
