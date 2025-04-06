# WAGAInventoryManager.sol

```solidity
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
contract WAGAInventoryManager is AccessControl, WAGAChainlinkFunctionsBase, AutomationCompatibleInterface {
    using WAGAUpkeepLib for uint8;

    bytes32 public constant INVENTORY_MANAGER_ROLE = keccak256("INVENTORY_MANAGER_ROLE");

    WAGACoffeeToken public coffeeToken;

    struct VerificationRequest {
        uint256 batchId;
        uint256 expectedQuantity;
        uint256 expectedPrice;
        string expectedPackaging;
        string expectedMetadataHash;
        bool completed;
        bool verified;
    }

    mapping(bytes32 => VerificationRequest) public verificationRequests;
    mapping(uint256 => uint256) public lastBatchAuditTime;

    uint256 public batchAuditInterval = 7 days;
    uint256 public expiryWarningThreshold = 30 days;
    uint256 public lowInventoryThreshold = 10;
    uint256 public longStorageThreshold = 180 days;

    uint256 public immutable intervalSeconds;
    uint256 public lastTimeStamp;

    event VerificationRequested(bytes32 indexed requestId, uint256 indexed batchId, uint256 expectedQuantity);
    event VerificationCompleted(bytes32 indexed requestId, uint256 indexed batchId, bool verified);
    event InventorySynced(uint256 indexed batchId, uint256 actualQuantity);
    event BatchMetadataMismatch(uint256 indexed batchId);
    event UpkeepPerformed(uint8 upkeepType, uint256[] batchIds);
    event LowInventoryWarning(uint256 indexed batchId, uint256 currentQuantity);
    event LongStorageWarning(uint256 indexed batchId, uint256 daysInStorage);

    constructor(
        address coffeeTokenAddress,
        address router,
        uint64 subscriptionId,
        bytes32 donId,
        uint256 _intervalSeconds
    ) WAGAChainlinkFunctionsBase(router, subscriptionId, donId) {
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        _grantRole(INVENTORY_MANAGER_ROLE, msg.sender);
        coffeeToken.setInventoryManager(address(this));

        intervalSeconds = _intervalSeconds;
        lastTimeStamp = block.timestamp;
    }

    /**
     * @dev Requests inventory verification using Chainlink Functions
     */
    function requestInventoryVerification(
        uint256 batchId,
        uint256 expectedQuantity,
        uint256 expectedPrice,
        string calldata expectedPackaging,
        string calldata expectedMetadataHash,
        string calldata source
    ) public onlyRole(INVENTORY_MANAGER_ROLE) returns (bytes32 requestId) {
        bytes memory sourceBytes = bytes(source);
        requestId = _sendRequest(sourceBytes, subscriptionId, 300000, donId);
        verificationRequests[requestId] = VerificationRequest({
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
    function _fulfillRequest(bytes32 requestId, bytes memory response, bytes memory /* err */) internal override {
        VerificationRequest storage request = verificationRequests[requestId];
        require(!request.completed, "Request already completed");
        request.completed = true;

        uint256 actualQuantity = _parseResponse(response);

        if (actualQuantity >= request.expectedQuantity) {
            request.verified = true;
            coffeeToken.updateBatchStatus(request.batchId, true);
        }

        coffeeToken.updateInventory(request.batchId, actualQuantity);
        lastBatchAuditTime[request.batchId] = block.timestamp;

        emit VerificationCompleted(requestId, request.batchId, request.verified);
        emit InventorySynced(request.batchId, actualQuantity);

        // Perform metadata verification
        try coffeeToken.verifyBatchMetadata(
            request.batchId,
            request.expectedPrice,
            request.expectedPackaging,
            request.expectedMetadataHash
        ) {
            // Metadata verified successfully
        } catch {
            emit BatchMetadataMismatch(request.batchId);
        }
    }

    /**
     * @dev Chainlink Automation check function
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool timeUpkeepNeeded = (block.timestamp - lastTimeStamp) > intervalSeconds;

        if (!timeUpkeepNeeded) {
            return (false, "");
        }

        uint256[] memory activeBatchIds = coffeeToken.getActiveBatchIds();
        if (activeBatchIds.length == 0) {
            return (false, "");
        }

        uint256[] memory criticalBatchIds = new uint256[](activeBatchIds.length);
        uint256 criticalCount = 0;

        for (uint256 i = 0; i < activeBatchIds.length; i++) {
            uint256 batchId = activeBatchIds[i];

            (, uint256 expiryDate, bool isVerified, uint256 currentQuantity, , , , ) = coffeeToken.batchInfo(batchId);

            if (block.timestamp > expiryDate || (!isVerified && currentQuantity > 0)) {
                criticalBatchIds[criticalCount] = batchId;
                criticalCount++;
            }
        }

        if (criticalCount > 0) {
            assembly {
                mstore(criticalBatchIds, criticalCount)
            }
            return (true, abi.encode(WAGAUpkeepLib.UPKEEP_VERIFICATION_CHECK, criticalBatchIds));
        }

        return (false, "");
    }

    /**
     * @dev Chainlink Automation perform function
     */
    function performUpkeep(bytes calldata performData) external override {
        lastTimeStamp = block.timestamp;

        (uint8 upkeepType, uint256[] memory batchIds) = abi.decode(performData, (uint8, uint256[]));

        for (uint256 i = 0; i < batchIds.length; i++) {
            require(coffeeToken.isBatchCreated(batchIds[i]), "Batch does not exist");
        }

        if (upkeepType == WAGAUpkeepLib.UPKEEP_EXPIRY_CHECK) {
            performExpiryCheck(batchIds);
        } else if (upkeepType == WAGAUpkeepLib.UPKEEP_VERIFICATION_CHECK) {
            for (uint256 i = 0; i < batchIds.length; i++) {
                this.requestInventoryVerification(batchIds[i], 0, 0, "", "", "");
            }
        } else if (upkeepType == WAGAUpkeepLib.UPKEEP_LOW_INVENTORY_CHECK) {
            performLowInventoryCheck(batchIds);
        } else if (upkeepType == WAGAUpkeepLib.UPKEEP_LONG_STORAGE_CHECK) {
            performLongStorageCheck(batchIds);
        } else if (upkeepType == WAGAUpkeepLib.UPKEEP_INVENTORY_AUDIT) {
            performBatchAudit(batchIds);
        } else {
            revert("Unknown upkeep type");
        }

        emit UpkeepPerformed(upkeepType, batchIds);
    }

    // Additional functions like performExpiryCheck, performLowInventoryCheck, performLongStorageCheck, and performBatchAudit remain unchanged


    /**
     * @dev Performs expiry checks on specific batches
     * @param batchIds Array of batch IDs to check
     */
    function performExpiryCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];

            (, uint256 expiryDate, , , , , , ) = coffeeToken.batchInfo(batchId);

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

            (, , bool isVerified, uint256 currentQuantity, , , , ) = coffeeToken.batchInfo(batchId);

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

            (, , , uint256 currentQuantity, , , , ) = coffeeToken.batchInfo(batchId);

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

            (uint256 productionDate, , , , , , , ) = coffeeToken.batchInfo(batchId);

            if (block.timestamp - productionDate > 180 days) {
                uint256 daysInStorage = (block.timestamp - productionDate) / 1 days;
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
            lastBatchAuditTime[batchIds[i]] = block.timestamp;
        }
    }


}
```