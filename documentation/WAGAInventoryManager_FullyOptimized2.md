
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAChainlinkFunctionsBase} from "./WAGAChainlinkFunctionsBase.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {WAGAUpkeepLib} from "src/Libraries/WAGAUpkeepLib.sol";

/**
 * @title WAGAInventoryManager (Fully Optimized)
 * @dev Manages coffee inventory with Chainlink Functions and Automation
 */
contract WAGAInventoryManager2 is
    AccessControl,
    WAGAChainlinkFunctionsBase,
    AutomationCompatibleInterface
{
    using WAGAUpkeepLib for uint8;

    bytes32 public constant INVENTORY_MANAGER_ROLE = keccak256("INVENTORY_MANAGER_ROLE");

    WAGACoffeeToken public coffeeToken;

    uint256 public immutable intervalSeconds;
    uint256 public lastTimeStamp;

    mapping(uint256 => uint256) public lastBatchAuditTime;

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

        intervalSeconds = _intervalSeconds;
        lastTimeStamp = block.timestamp;
    }

    /**
     * @dev Chainlink Automation check function
     * @return upkeepNeeded Boolean indicating if upkeep is needed
     * @return performData Encoded data for performUpkeep to use
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
            return (true, abi.encode(WAGAUpkeepLib.UPKEEP_EXPIRY_CHECK, criticalBatchIds));
        }

        return (false, "");
    }

    /**
     * @dev Chainlink Automation function for performing regular maintenance
     * @param performData Data from checkUpkeep specifying what to perform
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
            performVerificationCheck(batchIds);
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
