// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAChainlinkFunctionsBase} from "./WAGAChainlinkFunctionsBase.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title WAGAInventoryManager
 * @dev Contract for managing coffee inventory with Chainlink Functions for PoR and Automation for regular checks
 */
contract WAGAInventoryManager is
    WAGAChainlinkFunctionsBase,
    AutomationCompatibleInterface
{
    bytes32 public constant INVENTORY_MANAGER_ROLE =
        keccak256("INVENTORY_MANAGER_ROLE");

    WAGACoffeeToken public coffeeToken;

    // Chainlink Automation variables
    uint256 public immutable intervalSeconds;
    uint256 public lastTimeStamp;
    
    // Constants for upkeep types
    uint8 private constant UPKEEP_EXPIRY_CHECK = 1;
    uint8 private constant UPKEEP_INVENTORY_AUDIT = 2;
    uint8 private constant UPKEEP_VERIFICATION_CHECK = 3;
    uint8 private constant UPKEEP_LOW_INVENTORY_CHECK = 4;
    uint8 private constant UPKEEP_LONG_STORAGE_CHECK = 5;

    // Inventory verification request structure
    struct VerificationRequest {
        uint256 batchId;
        uint256 expectedQuantity;
        bool completed;
        bool verified;
    }

    // Mapping from request ID to verification request
    mapping(bytes32 => VerificationRequest) public verificationRequests;
    
    // Mapping to track when a batch was last audited
    mapping(uint256 => uint256) public lastBatchAuditTime;
    
    // Configuration for how often batches should be audited (in seconds)
    uint256 public batchAuditInterval = 7 days;
    
    // Threshold for expiry warning (in seconds)
    uint256 public expiryWarningThreshold = 30 days;
    
    // Threshold for low inventory warning (in units)
    uint256 public lowInventoryThreshold = 10;
    
    // Threshold for long storage warning (in seconds)
    uint256 public longStorageThreshold = 180 days;

    // Events
    event VerificationRequested(
        bytes32 indexed requestId,
        uint256 indexed batchId,
        uint256 expectedQuantity
    );
    event VerificationCompleted(
        bytes32 indexed requestId,
        uint256 indexed batchId,
        bool verified
    );
    event InventorySynced(uint256 indexed batchId, uint256 actualQuantity);
    event BatchExpired(uint256 indexed batchId);
    event BatchExpiryWarning(uint256 indexed batchId, uint256 daysRemaining);
    event BatchVerificationNeeded(uint256 indexed batchId, uint256 currentQuantity);
    event LowInventoryWarning(uint256 indexed batchId, uint256 currentQuantity);
    event LongStorageWarning(uint256 indexed batchId, uint256 daysInStorage);
    event UpkeepPerformed(uint8 upkeepType, uint256[] batchIds);
    event AuditIntervalUpdated(uint256 newInterval);
    event ExpiryWarningThresholdUpdated(uint256 newThreshold);
    event LowInventoryThresholdUpdated(uint256 newThreshold);
    event LongStorageThresholdUpdated(uint256 newThreshold);

    constructor(
        address coffeeTokenAddress,
        address router,
        uint64 _subscriptionId,
        bytes32 _donId,
        uint256 _intervalSeconds
    ) WAGAChainlinkFunctionsBase(router, _subscriptionId, _donId) {
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        _grantRole(INVENTORY_MANAGER_ROLE, msg.sender);

        // Set this contract as the inventory manager in WAGACoffeeToken
        coffeeToken.setInventoryManager(address(this));

        intervalSeconds = _intervalSeconds;
        lastTimeStamp = block.timestamp;
    }

    /**
     * @dev Requests verification of inventory for a batch using Chainlink Functions
     * @param batchId Batch identifier
     * @param expectedQuantity Expected quantity in inventory
     * @param source JavaScript source code for Chainlink Functions
     */
    function requestInventoryVerification(
        uint256 batchId,
        uint256 expectedQuantity,
        string calldata source
    ) external onlyRole(INVENTORY_MANAGER_ROLE) returns (bytes32 requestId) {
        // Convert the source to bytes
        bytes memory sourceBytes = bytes(source);

        // Make the Chainlink Functions request
        requestId = _sendRequest(sourceBytes, subscriptionId, 300000, donId);

        // Store the verification request
        verificationRequests[requestId] = VerificationRequest({
            batchId: batchId,
            expectedQuantity: expectedQuantity,
            completed: false,
            verified: false
        });

        latestRequestId = requestId;

        emit VerificationRequested(requestId, batchId, expectedQuantity);

        return requestId;
    }

    /**
     * @dev Callback function for Chainlink Functions
     * @param requestId Request identifier
     * @param response Response from Chainlink Functions
     * @param err Error from Chainlink Functions
     */
    function _fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        latestResponse = response;
        latestError = err;

        VerificationRequest storage request = verificationRequests[requestId];
        require(!request.completed, "Request already completed");

        request.completed = true;

        // Parse the response to get the actual quantity
        uint256 actualQuantity = _parseResponse(response);

        // Verify if the actual quantity matches the expected quantity
        if (actualQuantity >= request.expectedQuantity) {
            request.verified = true;

            // Update the batch status in the coffee token contract
            coffeeToken.updateBatchStatus(request.batchId, true);
        }

        // Sync the inventory in the coffee token contract
        coffeeToken.updateInventory(request.batchId, actualQuantity);
        
        // Update the last audit time for this batch
        lastBatchAuditTime[request.batchId] = block.timestamp;

        emit VerificationCompleted(
            requestId,
            request.batchId,
            request.verified
        );
        emit InventorySynced(request.batchId, actualQuantity);
    }

    /**
     * @dev Manually verifies a batch (fallback for when Chainlink Functions fails)
     * @param batchId Batch identifier
     * @param actualQuantity Actual quantity in inventory
     */
    // @audit: Do we really need this function?
    function manuallyVerifyBatch(
        uint256 batchId,
        uint256 actualQuantity
    ) external onlyRole(INVENTORY_MANAGER_ROLE) {
        // Update the batch status in the coffee token contract
        coffeeToken.updateBatchStatus(batchId, true);

        // Sync the inventory in the coffee token contract
        coffeeToken.updateInventory(batchId, actualQuantity);
        
        // Update the last audit time for this batch
        lastBatchAuditTime[batchId] = block.timestamp;

        emit InventorySynced(batchId, actualQuantity);
    }

    /**
     * @dev Updates the batch audit interval
     * @param newInterval New interval in seconds
     */
    function updateBatchAuditInterval(uint256 newInterval) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newInterval > 0, "Interval must be greater than zero");
        batchAuditInterval = newInterval;
        emit AuditIntervalUpdated(newInterval);
    }
    
    /**
     * @dev Updates the expiry warning threshold
     * @param newThreshold New threshold in seconds
     */
    function updateExpiryWarningThreshold(uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        expiryWarningThreshold = newThreshold;
        emit ExpiryWarningThresholdUpdated(newThreshold);
    }
    
    /**
     * @dev Updates the low inventory threshold
     * @param newThreshold New threshold in units
     */
    function updateLowInventoryThreshold(uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        lowInventoryThreshold = newThreshold;
        emit LowInventoryThresholdUpdated(newThreshold);
    }
    
    /**
     * @dev Updates the long storage threshold
     * @param newThreshold New threshold in seconds
     */
    function updateLongStorageThreshold(uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        longStorageThreshold = newThreshold;
        emit LongStorageThresholdUpdated(newThreshold);
    }

    /**
     * @dev Chainlink Automation check function
     * checkData Data specifying what to check, can be empty for default checks
     * @return upkeepNeeded Boolean indicating if upkeep is needed
     * @return performData Encoded data for performUpkeep to use
     */
    function checkUpkeep(
        bytes calldata /*checkData*/
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // Check if the minimum interval has passed
        bool timeUpkeepNeeded = (block.timestamp - lastTimeStamp) > intervalSeconds;
        
        if (!timeUpkeepNeeded) {
            return (false, "");
        }
        
        uint256[] memory activeBatchIds = coffeeToken.getActiveBatchIds();
        if (activeBatchIds.length == 0) {
            return (false, "");
        }
        
        // Check for batches that need attention
        uint256[] memory expiryBatchIds = new uint256[](activeBatchIds.length);
        uint256 expiryCount = 0;
        
        uint256[] memory auditBatchIds = new uint256[](activeBatchIds.length); // check audit mechanism
        uint256 auditCount = 0;
        
        uint256[] memory verificationBatchIds = new uint256[](activeBatchIds.length);
        uint256 verificationCount = 0;
        
        uint256[] memory lowInventoryBatchIds = new uint256[](activeBatchIds.length);
        uint256 lowInventoryCount = 0;
        
        uint256[] memory longStorageBatchIds = new uint256[](activeBatchIds.length);
        uint256 longStorageCount = 0;
        
        for (uint256 i = 0; i < activeBatchIds.length; i++) {
            uint256 batchId = activeBatchIds[i];
            
            // Get batch info - now we use all the variables
            (uint256 productionDate, uint256 expiryDate, bool isVerified, uint256 currentQuantity) = 
                coffeeToken.batchInfo(batchId);
            
            // Check for expiry
            if (block.timestamp > expiryDate || 
                (expiryDate - block.timestamp) < expiryWarningThreshold) {
                expiryBatchIds[expiryCount] = batchId;
                expiryCount++;
            }
            
            // Check for batches that need auditing
            if (block.timestamp - lastBatchAuditTime[batchId] > batchAuditInterval) {
                auditBatchIds[auditCount] = batchId;
                auditCount++;
            }
            
            // Check for unverified batches with inventory
            if (!isVerified && currentQuantity > 0) {
                verificationBatchIds[verificationCount] = batchId;
                verificationCount++;
            }
            
            // Check for batches with low inventory
            if (currentQuantity > 0 && currentQuantity <= lowInventoryThreshold) {
                lowInventoryBatchIds[lowInventoryCount] = batchId;
                lowInventoryCount++;
            }
            
            // Check for batches that have been in storage too long
            if (block.timestamp - productionDate > longStorageThreshold) {
                longStorageBatchIds[longStorageCount] = batchId;
                longStorageCount++;
            }
        }
        
        // Determine which type of upkeep to perform, prioritizing the most critical
        if (expiryCount > 0) {
            // Resize the array to the actual count
            assembly {
                mstore(expiryBatchIds, expiryCount)
            }
            return (true, abi.encode(UPKEEP_EXPIRY_CHECK, expiryBatchIds));
        } else if (verificationCount > 0) {
            // Resize the array to the actual count
            assembly {
                mstore(verificationBatchIds, verificationCount)
            }
            return (true, abi.encode(UPKEEP_VERIFICATION_CHECK, verificationBatchIds));
        } else if (lowInventoryCount > 0) {
            // Resize the array to the actual count
            assembly {
                mstore(lowInventoryBatchIds, lowInventoryCount)
            }
            return (true, abi.encode(UPKEEP_LOW_INVENTORY_CHECK, lowInventoryBatchIds));
        } else if (longStorageCount > 0) {
            // Resize the array to the actual count
            assembly {
                mstore(longStorageBatchIds, longStorageCount)
            }
            return (true, abi.encode(UPKEEP_LONG_STORAGE_CHECK, longStorageBatchIds));
        } else if (auditCount > 0) {
            // Resize the array to the actual count
            assembly {
                mstore(auditBatchIds, auditCount)
            }
            return (true, abi.encode(UPKEEP_INVENTORY_AUDIT, auditBatchIds));
        }
        
        return (false, "");
    }

    /**
     * @dev Chainlink Automation function for performing regular maintenance
     * @param performData Data from checkUpkeep specifying what to perform
     */
    function performUpkeep(bytes calldata performData) external override {
        // Update the last timestamp regardless of what we do
        lastTimeStamp = block.timestamp;
        
        // If no data is provided, perform default actions
        if (performData.length == 0) {
            checkExpiredBatches();
            return;
        }
        
        // Decode the perform data
        (uint8 upkeepType, uint256[] memory batchIds) = abi.decode(performData, (uint8, uint256[]));
        
        // Validate batch IDs exist
        for (uint256 i = 0; i < batchIds.length; i++) {
            require(coffeeToken.isBatchCreated(batchIds[i]), "Batch does not exist");
        }
        
        if (upkeepType == UPKEEP_EXPIRY_CHECK) {
            performExpiryCheck(batchIds);
        } else if (upkeepType == UPKEEP_INVENTORY_AUDIT) {
            performBatchAudit(batchIds);
        } else if (upkeepType == UPKEEP_VERIFICATION_CHECK) {
            performVerificationCheck(batchIds);
        } else if (upkeepType == UPKEEP_LOW_INVENTORY_CHECK) {
            performLowInventoryCheck(batchIds);
        } else if (upkeepType == UPKEEP_LONG_STORAGE_CHECK) {
            performLongStorageCheck(batchIds);
        } else {
            revert("Unknown upkeep type");
        }
        
        emit UpkeepPerformed(upkeepType, batchIds);
    }

    /**
     * @dev Performs expiry checks on specific batches
     * @param batchIds Array of batch IDs to check
     */
    function performExpiryCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            
            // Skip if batch is not active
            if (!coffeeToken.activeBatches(batchId)) {
                continue;
            }
            
            // Get batch info
            (, uint256 expiryDate, , ) = coffeeToken.batchInfo(batchId);
            
            // Check if expired
            if (block.timestamp > expiryDate) {
                coffeeToken.markBatchExpired(batchId);
                emit BatchExpired(batchId);
            } 
            // Check if approaching expiry
            else if ((expiryDate - block.timestamp) < expiryWarningThreshold) {
                uint256 daysRemaining = (expiryDate - block.timestamp) / 1 days;
                emit BatchExpiryWarning(batchId, daysRemaining);
            }
        }
    }
    
    /**
     * @dev Performs inventory audit on specific batches
     * @param batchIds Array of batch IDs to audit
     * Note: This is a placeholder. In a real implementation, this would trigger
     * Chainlink Functions requests for each batch to verify inventory.
     */
    function performBatchAudit(uint256[] memory batchIds) internal {
        // In a real implementation, this would trigger inventory verification
        // for each batch. For now, we just update the last audit time.
        for (uint256 i = 0; i < batchIds.length; i++) {
            // This would be replaced with actual verification logic
            lastBatchAuditTime[batchIds[i]] = block.timestamp;
        }
        
        // Note: A real implementation would call requestInventoryVerification
        // for each batch, but that would require storing the JavaScript source
        // code or having a way to retrieve it.
    }
    
    /**
     * @dev Performs verification check on unverified batches with inventory
     * @param batchIds Array of batch IDs to check
     */
    function performVerificationCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            
            // Get batch info
            (, , bool isVerified, uint256 currentQuantity) = coffeeToken.batchInfo(batchId);
            
            // Emit event for unverified batches with inventory
            if (!isVerified && currentQuantity > 0) {
                emit BatchVerificationNeeded(batchId, currentQuantity);
            }
        }
    }
    
    /**
     * @dev Performs low inventory check on batches
     * @param batchIds Array of batch IDs to check
     */
    function performLowInventoryCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            
            // Get batch info
            (, , , uint256 currentQuantity) = coffeeToken.batchInfo(batchId);
            
            // Emit event for batches with low inventory
            if (currentQuantity > 0 && currentQuantity <= lowInventoryThreshold) {
                emit LowInventoryWarning(batchId, currentQuantity);
            }
        }
    }
    
    /**
     * @dev Performs long storage check on batches
     * @param batchIds Array of batch IDs to check
     */
    function performLongStorageCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            
            // Get batch info
            (uint256 productionDate, , , ) = coffeeToken.batchInfo(batchId);
            
            // Check if batch has been in storage too long
            if (block.timestamp - productionDate > longStorageThreshold) {
                uint256 daysInStorage = (block.timestamp - productionDate) / 1 days;
                emit LongStorageWarning(batchId, daysInStorage);
            }
        }
    }

    /**
     * @dev Check for expired batches (legacy method, kept for backward compatibility)
     */
    function checkExpiredBatches() internal {
        uint256[] memory activeBatchIds = coffeeToken.getActiveBatchIds();
        for (uint256 i = 0; i < activeBatchIds.length; i++) {
            uint256 batchId = activeBatchIds[i];
            (, uint256 expiryDate, , ) = coffeeToken.batchInfo(batchId);
            if (block.timestamp > expiryDate) {
                coffeeToken.markBatchExpired(batchId);
                emit BatchExpired(batchId);
            }
        }
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

