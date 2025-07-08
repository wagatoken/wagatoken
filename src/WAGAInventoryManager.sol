// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAChainlinkFunctionsBase} from "./WAGAChainlinkFunctionsBase.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {WAGAUpkeepLib} from "./Libraries/WAGAUpkeepLib.sol";

/**
 * @title WAGAInventoryManager
 * @dev Manages coffee inventory with Chainlink Functions for verification and Chainlink Automation for upkeep tasks
 */
contract WAGAInventoryManager is
    AccessControl,
    WAGAChainlinkFunctionsBase,
    AutomationCompatibleInterface
{
    using WAGAUpkeepLib for uint8;

    // Custom errors

    error WAGAInventoryManager__InvalidPerformDataLength_performUpkeep();
    error WAGAInventoryManager__TooManyBatches_performUpkeep();
    error WAGAInventoryManager__UnknownUpkeepType_performUpkeep();
    error WAGAInventoryManager__RequestAlreadyCompleted_fulfillRequest();
    error WAGAInventoryManager__InvalidThresholdValue_updateThresholds();
    error WAGAInventoryManager__BatchDoesNotExist_performUpkeep();

    bytes32 public constant INVENTORY_MANAGER_ROLE =
        keccak256("INVENTORY_MANAGER_ROLE");

    WAGACoffeeToken public coffeeToken;

    struct VerificationRequest {
        uint256 batchId;
        uint256 expectedQuantity;
        uint256 expectedPrice;
        string expectedPackaging;
        string expectedMetadataHash;
        bool completed;
        bool verified;
        // uint256 lastVerifiedTimestamp; // Timestamp of the last verification
    }

    mapping(bytes32 => VerificationRequest) private s_verificationRequests;
    mapping(uint256 => uint256) private s_lastBatchAuditTime;

    uint256 public s_batchAuditInterval = 7 days; // what does the audit consist of?
    uint256 public s_expiryWarningThreshold = 30 days; // Time before expiry to warn: Should be at least 60 days.
    uint256 public s_lowInventoryThreshold = 10; // Threshold for low inventory warning - number of items
    uint256 public s_longStorageThreshold = 180 days; // Threshold for long storage warning - number of days
    uint256 public s_maxBatchesPerUpkeep = 50; // Maximum number of batches to process in a single upkeep

    uint256 public immutable intervalSeconds; // Interval for Chainlink Automation upkeep
    // Last timestamp when upkeep was performed
    uint256 private s_lastTimeStamp;

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
    event BatchMetadataMismatch(uint256 indexed batchId);
    event UpkeepPerformed(uint8 upkeepType, uint256[] batchIds);
    event LowInventoryWarning(uint256 indexed batchId, uint256 currentQuantity);
    event LongStorageWarning(uint256 indexed batchId, uint256 daysInStorage);

    constructor(
        address coffeeTokenAddress, // Address of the WAGACoffeeToken contract
        address router, // chainlink functions router address
        uint64 subscriptionId, // chainlink functions subscription ID
        bytes32 donId, // chainlink functions DON ID
        uint256 _intervalSeconds // Interval for Chainlink Automation upkeep
    ) WAGAChainlinkFunctionsBase(router, subscriptionId, donId) {
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        _grantRole(INVENTORY_MANAGER_ROLE, msg.sender); // @audit: Should this role be called Inventory_Manager? Why not Admin? We have an inventory manager role already in the WAGACoffeeToken contract. so this may be confusing.
        coffeeToken.setInventoryManager(address(this)); //@audit: This is redundant.  Inventory Manager is already set to this contract upon deployment of the WAGACoffeeToken

        intervalSeconds = _intervalSeconds;
        s_lastTimeStamp = block.timestamp;
    }

    /**
     * @dev Requests inventory verification using Chainlink Functions
     */
    function requestInventoryVerification(
        uint256 batchId,
        uint256 expectedQuantity,
        uint256 expectedPrice, // @audit: why not encode in the source code?
        string calldata expectedPackaging, // @audit: why not encode in the source code?
        string calldata expectedMetadataHash, // @audit: why not encode in the source code?
        string calldata source
    ) public onlyRole(INVENTORY_MANAGER_ROLE) returns (bytes32 requestId) {
        // expectedQuantity = coffeeToken.getBatchQuantity(batchId);
        // expectedPrice = coffeeToken.getBatchPrice(batchId);
        // expectedPackaging = coffeeToken.getBatchPackaging(batchId);
        // expectedMetadataHash = coffeeToken.getBatchMetadataHash(batchId);
        bytes memory sourceBytes = bytes(source);
        requestId = _sendRequest(sourceBytes, subscriptionId, 300000, donId);
        s_verificationRequests[requestId] = VerificationRequest({
            batchId: batchId,
            expectedQuantity: expectedQuantity,
            expectedPrice: expectedPrice,
            expectedPackaging: expectedPackaging,
            expectedMetadataHash: expectedMetadataHash,
            completed: false,
            verified: false
        });
        emit VerificationRequested(requestId, batchId, expectedQuantity);
        return requestId;
    }

    /**
     * @dev Handles responses from Chainlink Functions
     */
    function _fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory /* err */
    ) internal override {
        // Retrieve the verification request
        VerificationRequest storage request = s_verificationRequests[requestId];
        // Check if the request has already been completed
        if (request.completed) {
            revert WAGAInventoryManager__RequestAlreadyCompleted_fulfillRequest();
        }

        // Parse the response
        (
            uint256 verifiedQuantity,
            uint256 verifiedPrice,
            string memory verifiedPackaging,
            string memory verifiedMetadataHash
        ) = _parseResponse(response);

        // Set the request to completed
        request.completed = true;

        // Verify the batch metadata
        coffeeToken.verifyBatchMetadata(
            request.batchId,
            verifiedPrice,
            verifiedPackaging,
            verifiedMetadataHash
        );
        (, , , , , , , bool isMetadataVerified,) = coffeeToken.s_batchInfo(
            request.batchId
        );
        // Check if the verified inventory and metadata matches the expected values
        if (
            verifiedQuantity < request.expectedQuantity && !isMetadataVerified
        ) {
            revert(); // Define error for quantity and metadata mismatch
        }

        // Set the verified status to true
        request.verified = true;
        // Update the batch verification status
        coffeeToken.updateBatchStatus(request.batchId, true);
        // Update the batch inventory with the verified quantity
        coffeeToken.updateInventory(request.batchId, verifiedQuantity);
        // set the lastBatchAuditTime
        s_lastBatchAuditTime[request.batchId] = block.timestamp;
        emit VerificationCompleted(
            requestId,
            request.batchId,
            request.verified
        );
        emit InventorySynced(request.batchId, verifiedQuantity);
    }

    /**
     * @dev Chainlink Automation check function
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        if ((block.timestamp - s_lastTimeStamp) <= intervalSeconds) {
            return (false, "");
        }
        // Get the active batch IDs from the coffeeToken contract
        // This is a list of all batches that are currently active and not expired.


        
        uint256[] memory activeBatchIds = coffeeToken.getActiveBatchIds();
        if (activeBatchIds.length == 0) {
            return (false, "");
        }
        // Define the number of batches to be processed in a single upkeep
        // Ternary Operator: If the number of active batches exceeds the maximum(s_maxBatchesPerUpkeep) allowed per upkeep, then the limit is set to the maximum. Otherwise, it is set to the number of active batches. So the limit is the minimum of the two values.
        uint256 limit = activeBatchIds.length > s_maxBatchesPerUpkeep
            ? s_maxBatchesPerUpkeep
            : activeBatchIds.length;
            // Initialize an array to hold batch IDs that need critical attention
        uint256[] memory criticalBatchIds = new uint256[](limit);
        uint256 criticalCount = 0; // tracks how many critical batches are found
        // A batch is considered critical if it has expired or if it is not verified and has a current quantity greater than 0.
        for (uint256 i = 0; i < limit; i++) {
            uint256 batchId = activeBatchIds[i];
            (
                ,
                uint256 expiryDate,
                bool isVerified,
                uint256 currentQuantity,
                ,
                ,
                ,
                ,

            ) = coffeeToken.s_batchInfo(batchId);
            if (
                block.timestamp > expiryDate ||
                (!isVerified && currentQuantity > 0)
            ) {
                criticalBatchIds[criticalCount] = batchId; // store the batch ID at index criticalCount in the criticalBatchIds array
                criticalCount++;
            }
        }
        // Use inline assembly to set the length of the criticalBatchIds array to the number of critical batches found
        if (criticalCount > 0) {
            assembly {
                mstore(criticalBatchIds, criticalCount)
            }
            return (
                true, // bool upkeepNeeded
                // bytes performData
                abi.encode(
                    WAGAUpkeepLib.UPKEEP_VERIFICATION_CHECK,
                    criticalBatchIds
                )
            );
        }
        return (false, "");
    }

    /**
     * @dev Chainlink Automation perform function
     */
    function performUpkeep(bytes calldata performData) external override {
        if (performData.length < 32) {
            revert WAGAInventoryManager__InvalidPerformDataLength_performUpkeep();
        }
        (uint8 upkeepType, uint256[] memory batchIds) = abi.decode(
            performData,
            (uint8, uint256[])
        );
        if (batchIds.length > s_maxBatchesPerUpkeep) {
            revert WAGAInventoryManager__TooManyBatches_performUpkeep();
        }
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (!coffeeToken.isBatchCreated(batchIds[i])) {
                revert WAGAInventoryManager__BatchDoesNotExist_performUpkeep();
            }
        }
        if (upkeepType == WAGAUpkeepLib.UPKEEP_EXPIRY_CHECK) {
            performExpiryCheck(batchIds);
        } else if (upkeepType == WAGAUpkeepLib.UPKEEP_VERIFICATION_CHECK) {
            for (uint256 i = 0; i < batchIds.length; i++) {
                this.requestInventoryVerification(
                    batchIds[i],
                    0,
                    0,
                    "",
                    "",
                    ""
                );
            }
        } else if (upkeepType == WAGAUpkeepLib.UPKEEP_LOW_INVENTORY_CHECK) {
            performLowInventoryCheck(batchIds);
        } else if (upkeepType == WAGAUpkeepLib.UPKEEP_LONG_STORAGE_CHECK) {
            performLongStorageCheck(batchIds);
        } else if (upkeepType == WAGAUpkeepLib.UPKEEP_INVENTORY_AUDIT) {
            performBatchAudit(batchIds);
        } else {
            revert WAGAInventoryManager__UnknownUpkeepType_performUpkeep();
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

            (, uint256 expiryDate, , , , , , , ) = coffeeToken.s_batchInfo(batchId);

            if (block.timestamp > expiryDate) {
                coffeeToken.markBatchExpired(batchId);
            }
        }
    }

    /**
     * @dev Performs verification checks on specific batches
     * @param batchIds Array of batch IDs to check
     */
    function performVerificationCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];

            (, , bool isVerified, uint256 currentQuantity, , , , ,) = coffeeToken
                .s_batchInfo(batchId);

            if (!isVerified && currentQuantity > 0) {
                coffeeToken.updateBatchStatus(batchId, true);
            }
        }
    }

    /**
     * @dev Performs low inventory checks on specific batches
     * @param batchIds Array of batch IDs to check
     */
    function performLowInventoryCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];

            (, , , uint256 currentQuantity, , , , ,) = coffeeToken.s_batchInfo(
                batchId
            );

            if (currentQuantity > 0 && currentQuantity <= 10) {
                emit LowInventoryWarning(batchId, currentQuantity);
            }
        }
    }

    /**
     * @dev Performs long storage checks on specific batches
     * @param batchIds Array of batch IDs to check
     */
    function performLongStorageCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];

            (uint256 productionDate, , , , , , , ,) = coffeeToken.s_batchInfo(
                batchId
            );

            if (block.timestamp - productionDate > 180 days) {
                uint256 daysInStorage = (block.timestamp - productionDate) /
                    1 days;
                emit LongStorageWarning(batchId, daysInStorage);
            }
        }
    }

    /**
     * @dev Performs inventory audits on specific batches
     * @param batchIds Array of batch IDs to audit
     */
    function performBatchAudit(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            s_lastBatchAuditTime[batchIds[i]] = block.timestamp;
        }
    }

    function updateThresholds(
        uint256 _batchAuditInterval,
        uint256 _expiryWarningThreshold,
        uint256 _lowInventoryThreshold,
        uint256 _longStorageThreshold,
        uint256 _maxBatchesPerUpkeep
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_maxBatchesPerUpkeep == 0 || _maxBatchesPerUpkeep > 100) {
            revert WAGAInventoryManager__InvalidThresholdValue_updateThresholds();
        }
        s_batchAuditInterval = _batchAuditInterval;
        s_expiryWarningThreshold = _expiryWarningThreshold;
        s_lowInventoryThreshold = _lowInventoryThreshold;
        s_longStorageThreshold = _longStorageThreshold;
        s_maxBatchesPerUpkeep = _maxBatchesPerUpkeep;
    }
}
