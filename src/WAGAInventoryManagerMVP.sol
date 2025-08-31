// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGACoffeeTokenCore} from "./WAGACoffeeTokenCore.sol";
import {WAGAProofOfReserve} from "./WAGAProofOfReserve.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WAGAInventoryManagerMVP
 * @dev Simplified inventory manager for Real ZK MVP - focuses on core functionality
 * @notice This contract performs 3 essential checks: expiry, verification, and low inventory
 * @dev Designed for gas efficiency and stack depth optimization
 */
contract WAGAInventoryManagerMVP is Ownable {

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error WAGAInventoryManagerMVP__InvalidCoffeeTokenAddress();
    error WAGAInventoryManagerMVP__InvalidProofOfReserveAddress();
    error WAGAInventoryManagerMVP__BatchDoesNotExist();
    error WAGAInventoryManagerMVP__InvalidThresholdValue();
    error WAGAInventoryManagerMVP__EmptyBatchList();
    error WAGAInventoryManagerMVP__MaxBatchesExceeded();

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */
    
    event BatchExpired(uint256 indexed batchId, uint256 expiryDate);
    event LowInventoryWarning(uint256 indexed batchId, uint256 currentQuantity);
    event VerificationRequested(uint256 indexed batchId, bytes32 requestId);
    event ThresholdUpdated(string thresholdType, uint256 oldValue, uint256 newValue);
    event BatchProcessed(uint256 indexed batchId, string checkType);

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */
    
    // Core contract references
    WAGACoffeeTokenCore public immutable coffeeToken;
    WAGAProofOfReserve public immutable proofOfReserve;
    
    // Configuration thresholds
    uint256 public lowInventoryThreshold = 10; // Default: 10 units
    uint256 public verificationInterval = 7 days; // Default: 7 days
    uint256 public maxBatchesPerCheck = 50; // Default: 50 batches per transaction
    
    // Default source code for Chainlink Functions
    string public defaultSourceCode = "console.log('Basic inventory verification for batchId:', args[0]); return Functions.encodeUint256(1);";
    
    // Tracking mappings
    mapping(uint256 => uint256) public lastVerificationTime;
    mapping(uint256 => bool) public isExpiredBatch;

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */
    
    constructor(
        address _coffeeToken,
        address _proofOfReserve
    ) Ownable(msg.sender) {
        if (_coffeeToken == address(0)) {
            revert WAGAInventoryManagerMVP__InvalidCoffeeTokenAddress();
        }
        if (_proofOfReserve == address(0)) {
            revert WAGAInventoryManagerMVP__InvalidProofOfReserveAddress();
        }
        
        coffeeToken = WAGACoffeeTokenCore(_coffeeToken);
        proofOfReserve = WAGAProofOfReserve(_proofOfReserve);
    }

    /* -------------------------------------------------------------------------- */
    /*                             Core MVP Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Check and process expired batches (Priority 1 - Critical)
     * @param batchIds Array of batch IDs to check for expiry
     * @dev Marks batches as expired if past their expiry date
     */
    function checkExpiredBatches(uint256[] calldata batchIds) external {
        _validateBatchIds(batchIds);
        
        uint256 currentTime = block.timestamp;
        
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            
            if (!coffeeToken.isBatchCreated(batchId)) {
                continue; // Skip non-existent batches
            }
            
            // Get batch expiry date
            (, uint256 expiryDate,,,,,,,) = coffeeToken.getbatchInfo(batchId);
            
            // Check if batch is expired
            if (currentTime > expiryDate && !isExpiredBatch[batchId]) {
                // Mark as expired
                coffeeToken.markBatchExpired(batchId);
                isExpiredBatch[batchId] = true;
                
                emit BatchExpired(batchId, expiryDate);
                emit BatchProcessed(batchId, "EXPIRY_CHECK");
            }
        }
    }

    /**
     * @notice Trigger verification for specific batches (Priority 2 - Critical)
     * @param batchIds Array of batch IDs to verify
     * @dev Calls ProofOfReserve for ZK verification of inventory
     */
    function triggerBatchVerification(uint256[] calldata batchIds) external {
        _validateBatchIds(batchIds);
        
        uint256 currentTime = block.timestamp;
        
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            
            if (!coffeeToken.isBatchCreated(batchId)) {
                continue; // Skip non-existent batches
            }
            
            // Check if verification is needed
            if (currentTime >= lastVerificationTime[batchId] + verificationInterval) {
                // Reset verification flags
                coffeeToken.resetBatchVerificationFlags(batchId);
                
                // Request verification from ProofOfReserve
                bytes32 requestId = proofOfReserve.requestInventoryVerification(batchId, defaultSourceCode);
                
                // Update last verification time
                lastVerificationTime[batchId] = currentTime;
                
                emit VerificationRequested(batchId, requestId);
                emit BatchProcessed(batchId, "VERIFICATION_CHECK");
            }
        }
    }

    /**
     * @notice Check and warn about low inventory batches (Priority 3 - Warning)
     * @param batchIds Array of batch IDs to check for low inventory
     * @dev Emits warnings for batches with quantity below threshold
     */
    function checkLowInventory(uint256[] calldata batchIds) external {
        _validateBatchIds(batchIds);
        
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            
            if (!coffeeToken.isBatchCreated(batchId)) {
                continue; // Skip non-existent batches
            }
            
            // Get current quantity
            (,,, uint256 quantity,,,,,) = coffeeToken.getbatchInfo(batchId);
            
            // Check if quantity is low
            if (quantity > 0 && quantity <= lowInventoryThreshold) {
                emit LowInventoryWarning(batchId, quantity);
                emit BatchProcessed(batchId, "LOW_INVENTORY_CHECK");
            }
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                           Convenience Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Get all active batches that need checking
     * @return Array of active batch IDs
     */
    function getActiveBatches() external view returns (uint256[] memory) {
        return coffeeToken.getActiveBatchIds();
    }

    /**
     * @notice Check if a batch needs verification
     * @param batchId The batch ID to check
     * @return True if verification is needed
     */
    function needsVerification(uint256 batchId) external view returns (bool) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            return false;
        }
        return block.timestamp >= lastVerificationTime[batchId] + verificationInterval;
    }

    /**
     * @notice Get batch status summary
     * @param batchId The batch ID to check
     * @return isExpired Whether the batch is expired
     * @return isLowInventory Whether the batch has low inventory
     * @return needsVerif Whether the batch needs verification
     */
    function getBatchStatus(uint256 batchId) external view returns (
        bool isExpired,
        bool isLowInventory,
        bool needsVerif
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            return (false, false, false);
        }
        
        (, uint256 expiryDate,, uint256 quantity,,,,,) = coffeeToken.getbatchInfo(batchId);
        
        isExpired = block.timestamp > expiryDate;
        isLowInventory = quantity > 0 && quantity <= lowInventoryThreshold;
        needsVerif = block.timestamp >= lastVerificationTime[batchId] + verificationInterval;
    }

    /* -------------------------------------------------------------------------- */
    /*                           Configuration Functions                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Update low inventory threshold
     * @param newThreshold New threshold value
     */
    function setLowInventoryThreshold(uint256 newThreshold) external onlyOwner {
        if (newThreshold == 0) {
            revert WAGAInventoryManagerMVP__InvalidThresholdValue();
        }
        
        uint256 oldThreshold = lowInventoryThreshold;
        lowInventoryThreshold = newThreshold;
        
        emit ThresholdUpdated("LOW_INVENTORY", oldThreshold, newThreshold);
    }

    /**
     * @notice Update verification interval
     * @param newInterval New interval in seconds
     */
    function setVerificationInterval(uint256 newInterval) external onlyOwner {
        if (newInterval == 0) {
            revert WAGAInventoryManagerMVP__InvalidThresholdValue();
        }
        
        uint256 oldInterval = verificationInterval;
        verificationInterval = newInterval;
        
        emit ThresholdUpdated("VERIFICATION_INTERVAL", oldInterval, newInterval);
    }

    /**
     * @notice Update maximum batches per check
     * @param newMax New maximum value
     */
    function setMaxBatchesPerCheck(uint256 newMax) external onlyOwner {
        if (newMax == 0) {
            revert WAGAInventoryManagerMVP__InvalidThresholdValue();
        }
        
        uint256 oldMax = maxBatchesPerCheck;
        maxBatchesPerCheck = newMax;
        
        emit ThresholdUpdated("MAX_BATCHES_PER_CHECK", oldMax, newMax);
    }

    /**
     * @notice Update default source code for Chainlink Functions
     * @param newSourceCode New source code string
     */
    function setDefaultSourceCode(string calldata newSourceCode) external onlyOwner {
        defaultSourceCode = newSourceCode;
        emit ThresholdUpdated("DEFAULT_SOURCE_CODE", 0, 1); // Placeholder values for string update
    }

    /* -------------------------------------------------------------------------- */
    /*                             Internal Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @notice Validate batch IDs array
     * @param batchIds Array of batch IDs to validate
     */
    function _validateBatchIds(uint256[] calldata batchIds) internal view {
        if (batchIds.length == 0) {
            revert WAGAInventoryManagerMVP__EmptyBatchList();
        }
        if (batchIds.length > maxBatchesPerCheck) {
            revert WAGAInventoryManagerMVP__MaxBatchesExceeded();
        }
    }
}
