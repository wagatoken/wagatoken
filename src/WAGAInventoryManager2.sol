// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";
import {WAGAProofOfReserve} from "./WAGAProofOfReserve.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {WAGAUpkeepLib} from "./Libraries/WAGAUpkeepLib.sol";

/**
 * @title WAGAInventoryManager
 * @dev Manages coffee inventory with Chainlink Functions for verification and Chainlink Automation for upkeep tasks
 */
contract WAGAInventoryManager is AccessControl, AutomationCompatibleInterface {
    using WAGAUpkeepLib for uint8;

    /* -------------------------------------------------------------------------- */
    /*                                Custom errors                               */
    /* -------------------------------------------------------------------------- */
    error WAGAInventoryManager__InvalidPerformDataLength_performUpkeep();
    error WAGAInventoryManager__TooManyBatches_performUpkeep();
    error WAGAInventoryManager__UnknownUpkeepType_performUpkeep();
    error WAGAInventoryManager__InvalidThresholdValue_updateThresholds();
    error WAGAInventoryManager__BatchDoesNotExist_performUpkeep();

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    bytes32 public constant INVENTORY_MANAGER_ROLE =
        keccak256("INVENTORY_MANAGER_ROLE");

    WAGACoffeeToken public coffeeToken;
    WAGAProofOfReserve public proofOfReserve;

    mapping(uint256 => uint256) private s_lastBatchAuditTime;

    uint256 public s_batchAuditInterval = 7 days;
    uint256 public s_expiryWarningThreshold = 60 days;
    uint256 public s_lowInventoryThreshold = 10;
    uint256 public s_longStorageThreshold = 180 days;
    uint256 public s_maxBatchesPerUpkeep = 50;

    uint256 public immutable i_intervalSeconds;
    uint256 private s_lastTimeStamp;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event InventoryVerificationRequested(
        bytes32 indexed requestId,
        uint256 indexed batchId
    );
    event InventorySynced(uint256 indexed batchId, uint256 actualQuantity);
    event BatchMetadataMismatch(uint256 indexed batchId);
    event UpkeepPerformed(uint8 upkeepType, uint256[] batchIds);
    event LowInventoryWarning(uint256 indexed batchId, uint256 currentQuantity);
    event LongStorageWarning(uint256 indexed batchId, uint256 daysInStorage);

    constructor(
        address coffeeTokenAddress,
        address proofOfReserveAddress,
        uint256 _intervalSeconds
    ) {
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        proofOfReserve = WAGAProofOfReserve(proofOfReserveAddress);
        _grantRole(INVENTORY_MANAGER_ROLE, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        i_intervalSeconds = _intervalSeconds;
        s_lastTimeStamp = block.timestamp;
    }

    /**
     * @dev Requests inventory verification using WAGAProofOfReserve (no token minting)
     */
    function requestInventoryVerification(
        uint256 batchId,
        string calldata source
    ) public onlyRole(INVENTORY_MANAGER_ROLE) returns (bytes32 requestId) {
        requestId = proofOfReserve.requestInventoryVerification(
            batchId,
            source
        );
        emit InventoryVerificationRequested(requestId, batchId);
        return requestId;
    }

    /**
     * @dev Checks if upkeep is needed based on time interval and batch conditions
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Check if enough time has passed since last upkeep
        if (block.timestamp - s_lastTimeStamp < i_intervalSeconds) {
            return (false, "");
        }
        // Get Active batches
        uint256[] memory activeBatches = coffeeToken.getActiveBatchIds();
        if (activeBatches.length == 0) {
            return (false, "");
        }
        // Set all batch verification flags to false
        // for (uint256 i = 0; i < activeBatches.length; i++)
        // {
        //     uint256 batchId = activeBatches[i];
        //     coffeeToken.setBatchVerificationFlag(batchId, false);
        // }

        uint256 maxBatches = s_maxBatchesPerUpkeep;
        uint256 currentTime = block.timestamp;

        // Arrays to hold batch IDs for different upkeep types
        uint256[] memory expiryBatches = new uint256[](maxBatches);
        uint256[] memory verificationBatches = new uint256[](maxBatches);
        uint256[] memory lowInventoryBatches = new uint256[](maxBatches);
        uint256[] memory longStorageBatches = new uint256[](maxBatches);

        uint8 verificationCount = 0;
        uint8 expiryCount = 0;
        uint8 lowInventoryCount = 0;
        uint8 longStorageCount = 0;

        // Loop through active batches to check conditions
        for (uint256 i = 0; i < activeBatches.length; i++) {
            uint256 batchId = activeBatches[i];

            // Check for expired batches
            if (expiryCount < maxBatches) {
                uint256 expiryDate = coffeeToken.getBatchExpiryDate(batchId);
                if (currentTime + s_expiryWarningThreshold >= expiryDate) {
                    expiryBatches[expiryCount] = batchId;
                    expiryCount++;
                    continue;
                }
            }
            // Check for weekly Verification
            if (verificationCount < maxBatches) {
                uint256 LastVerified = coffeeToken
                    .getBatchLastVerifiedTimestamp(batchId);
                if (currentTime - LastVerified >= s_batchAuditInterval) {
                    verificationBatches[verificationCount] = batchId;
                    verificationCount++;
                    continue;
                }
            }

            // Check low inventory (third priority)
            if (lowInventoryCount < maxBatches) {
                uint256 quantity = coffeeToken.getBatchQuantity(batchId);
                if (quantity <= s_lowInventoryThreshold) {
                    lowInventoryBatches[lowInventoryCount] = batchId;
                    lowInventoryCount++;
                    continue; // Skip other checks for this batch
                }
            }

            // Check long storage (fourth priority)
            if (longStorageCount < maxBatches) {
                uint256 creationTimestamp = coffeeToken.getBatchCreationDate(
                    batchId
                );
                uint256 daysInStorage = (currentTime - creationTimestamp) /
                    1 days;
                if (daysInStorage >= s_longStorageThreshold) {
                    longStorageBatches[longStorageCount] = batchId;
                    longStorageCount++;
                    continue; // Skip other checks for this batch
                }
            }
        }
    }

    function performUpkeep(bytes calldata performData) external override {}
}
