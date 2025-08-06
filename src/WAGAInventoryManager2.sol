// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";
import {WAGAProofOfReserve} from "./WAGAProofOfReserve.sol";
import {WAGAUpkeepLib} from "./Libraries/WAGAUpkeepLib.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WAGAInventoryManager
 * @dev Manages coffee inventory with Chainlink Functions for verification and Chainlink Automation for upkeep tasks
 */
contract WAGAInventoryManager is Ownable, AutomationCompatibleInterface {
    using WAGAUpkeepLib for uint8;

    /* -------------------------------------------------------------------------- */
    /*                                Custom errors                               */
    /* -------------------------------------------------------------------------- */
    error WAGAInventoryManager__InvalidPerformDataLength_performUpkeep();
    error WAGAInventoryManager__TooManyBatches_performUpkeep();
    error WAGAInventoryManager__UnknownUpkeepType_performUpkeep();
    error WAGAInventoryManager__InvalidThresholdValue_updateThresholds();
    error WAGAInventoryManager__EmptySourceCode_performVerificationCheck();
    error WAGAInventoryManager__ContractNotInitialized();

    error WAGAInventoryManager__BatchDoesNotExist_performVerificationCheck();
    error WAGAInventoryManager__BatchDoesNotExist_performExpiryCheck();
    error WAGAInventoryManager__BatchDoesNotExist_performLowInventoryCheck();
    error WAGAInventoryManager__BatchDoesNotExist_performLongStorageCheck();
    error WAGAInventoryManager__BatchDoesNotExist_performBatchAudit();

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // bytes32 public constant INVENTORY_MANAGER_ROLE =
    //     keccak256("INVENTORY_MANAGER_ROLE");

    // bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");hhhzo

    WAGACoffeeToken public coffeeToken;
    WAGAProofOfReserve public proofOfReserve;

    mapping(uint256 => uint256) private s_lastBatchAuditTime;

    // Source code storage for Chainlink Functions
    string private s_defaultSourceCode;
    mapping(uint256 => string) private s_batchSpecificSourceCode;

    // Initialization flag
    bool public isInitialized;

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
    ) Ownable(msg.sender) {
        // Initialize with zero addresses for two-phase deployment
        if (coffeeTokenAddress != address(0)) {
            coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        }
        if (proofOfReserveAddress != address(0)) {
            proofOfReserve = WAGAProofOfReserve(proofOfReserveAddress);
        }
        // _grantRole(INVENTORY_MANAGER_ROLE, msg.sender);
        // _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        i_intervalSeconds = _intervalSeconds;
        s_lastTimeStamp = block.timestamp;
    }

    /**
     * @notice Initialize the contract with contract addresses (two-phase deployment)
     * @param coffeeTokenAddress Address of the coffee token contract
     * @param proofOfReserveAddress Address of the proof of reserve contract
     * @param defaultSourceCode Default source code for Chainlink Functions
     */
    function initialize(
        address coffeeTokenAddress,
        address proofOfReserveAddress,
        string calldata defaultSourceCode
    ) external onlyOwner {
        require(!isInitialized, "Already initialized"); // write custom error later

        if (address(coffeeToken) == address(0)) {
            coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        }
        if (address(proofOfReserve) == address(0)) {
            proofOfReserve = WAGAProofOfReserve(proofOfReserveAddress);
        }

        s_defaultSourceCode = defaultSourceCode;
        isInitialized = true;
    }

    /**
     * @notice Modifier to ensure contract is initialized
     */
    modifier onlyInitialized() {
        if (!isInitialized) {
            revert WAGAInventoryManager__ContractNotInitialized();
        }
        _;
    }

    /**
     * @notice Sets default source code for Chainlink Functions
     * @param sourceCode The JavaScript source code
     */
    function setDefaultSourceCode(
        string calldata sourceCode
    ) external onlyOwner onlyInitialized {
        s_defaultSourceCode = sourceCode;
    }

    /**
     * @notice Sets batch-specific source code for Chainlink Functions
     * @param batchId The batch ID
     * @param sourceCode The JavaScript source code
     */
    function setBatchSourceCode(
        uint256 batchId,
        string calldata sourceCode
    ) external onlyOwner onlyInitialized {
        s_batchSpecificSourceCode[batchId] = sourceCode;
    }

    /**
     * @notice Gets source code for a specific batch
     * @param batchId The batch ID
     * @return The source code to use for this batch
     */
    function getSourceCodeForBatch(
        uint256 batchId
    ) public view onlyInitialized returns (string memory) {
        // Use batch-specific source code if available, otherwise use default
        if (bytes(s_batchSpecificSourceCode[batchId]).length > 0) {
            return s_batchSpecificSourceCode[batchId];
        }
        return s_defaultSourceCode;
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
        // Get Active batches from the coffee token contract
        uint256[] memory activeBatches = coffeeToken.getActiveBatchIds();
        if (activeBatches.length == 0) {
            return (false, "");
        }

        // Define maximum batches to process and current time for processing
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

            // Check for expired batches (highest priority)
            if (expiryCount < maxBatches) {
                uint256 expiryDate = coffeeToken.getBatchExpiryDate(batchId);
                if (currentTime + s_expiryWarningThreshold >= expiryDate) {
                    expiryBatches[expiryCount] = batchId;
                    expiryCount++;
                    continue;
                }
            }

            // Check for verification needed (second priority)
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
                if (quantity <= s_lowInventoryThreshold && quantity > 0) {
                    lowInventoryBatches[lowInventoryCount] = batchId;
                    lowInventoryCount++;
                    continue;
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
                    continue;
                }
            }
        }

        // Return highest priority upkeep needed
        if (expiryCount > 0) {
            uint256[] memory expiredBatchIds = new uint256[](expiryCount);
            for (uint8 i = 0; i < expiryCount; i++) {
                expiredBatchIds[i] = expiryBatches[i];
            }
            performData = abi.encode(
                WAGAUpkeepLib.UPKEEP_EXPIRY_CHECK,
                expiredBatchIds
            );
            return (true, performData);
        }

        if (verificationCount > 0) {
            uint256[] memory verificationBatchIds = new uint256[](
                verificationCount
            );
            for (uint8 i = 0; i < verificationCount; i++) {
                verificationBatchIds[i] = verificationBatches[i];
            }
            performData = abi.encode(
                WAGAUpkeepLib.UPKEEP_VERIFICATION_CHECK,
                verificationBatchIds
            );
            return (true, performData);
        }

        if (lowInventoryCount > 0) {
            uint256[] memory lowInventoryBatchIds = new uint256[](
                lowInventoryCount
            );
            for (uint256 i = 0; i < lowInventoryCount; i++) {
                lowInventoryBatchIds[i] = lowInventoryBatches[i];
            }
            performData = abi.encode(
                WAGAUpkeepLib.UPKEEP_LOW_INVENTORY_CHECK,
                lowInventoryBatchIds
            );
            return (true, performData);
        }

        if (longStorageCount > 0) {
            uint256[] memory longStorageBatchIds = new uint256[](
                longStorageCount
            );
            for (uint256 i = 0; i < longStorageCount; i++) {
                longStorageBatchIds[i] = longStorageBatches[i];
            }
            performData = abi.encode(
                WAGAUpkeepLib.UPKEEP_LONG_STORAGE_CHECK,
                longStorageBatchIds
            );
            return (true, performData);
        }

        return (false, "");
    }

    /**
     * @dev Chainlink Automation perform function
     */
    function performUpkeep(bytes calldata performData) external override {
        // Update last timestamp
        s_lastTimeStamp = block.timestamp;

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

        // Validate all batches exist

        // Execute appropriate upkeep type
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
            if (!coffeeToken.isBatchCreated(batchId)) {
                revert WAGAInventoryManager__BatchDoesNotExist_performExpiryCheck();
            }
            uint256 expiryDate = coffeeToken.getBatchExpiryDate(batchId);

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
        // Reset verification flags safely before verification
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];

            if (!coffeeToken.isBatchCreated(batchId)) {
                revert WAGAInventoryManager__BatchDoesNotExist_performVerificationCheck();
            }
            // Get source code for this batch
            string memory sourceCode = getSourceCodeForBatch(batchId);
            // @Yohannes why revert?
            if (bytes(sourceCode).length == 0) {
                revert WAGAInventoryManager__EmptySourceCode_performVerificationCheck();
            }

            // Try to reset verification flags safely
            try coffeeToken.resetBatchVerificationFlags(batchId) {
                // Request inventory verification using stored source code
                // this.requestInventoryVerification(batchId, sourceCode);
                proofOfReserve.requestInventoryVerification(
                    batchId,
                    sourceCode
                );

                // Update audit time
                s_lastBatchAuditTime[batchId] = block.timestamp;
            } catch {
                // If flag reset fails (e.g., due to pending redemptions), skip this batch
                continue;
            }
        }
    }

    /**
     * @dev Performs low inventory checks on specific batches
     * @param batchIds Array of batch IDs to check
     */

    // @Yohannes if state isn't being updated why is this not done ofchain?
    function performLowInventoryCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            if (!coffeeToken.isBatchCreated(batchId)) {
                revert WAGAInventoryManager__BatchDoesNotExist_performLowInventoryCheck();
            }
            uint256 currentQuantity = coffeeToken.getBatchQuantity(batchId);

            if (
                currentQuantity > 0 &&
                currentQuantity <= s_lowInventoryThreshold
            ) {
                emit LowInventoryWarning(batchId, currentQuantity);
            }
        }
    }

    /**
     * @dev Performs long storage checks on specific batches
     * @param batchIds Array of batch IDs to check
     */
    // @Yohannes if state isn't being updated why is this not done ofchain?
    function performLongStorageCheck(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            if (!coffeeToken.isBatchCreated(batchId)) {
                revert WAGAInventoryManager__BatchDoesNotExist_performLongStorageCheck();
            }
            uint256 productionDate = coffeeToken.getBatchCreationDate(batchId);

            if (block.timestamp - productionDate > s_longStorageThreshold) {
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
    //@Yohannes what is this function doing?
    function performBatchAudit(uint256[] memory batchIds) internal {
        for (uint256 i = 0; i < batchIds.length; i++) {
            uint256 batchId = batchIds[i];
            if (!coffeeToken.isBatchCreated(batchId)) {
                revert WAGAInventoryManager__BatchDoesNotExist_performBatchAudit();
            }
            s_lastBatchAuditTime[batchId] = block.timestamp;
        }
    }

    /**
     * @dev Updates various threshold values for upkeep conditions
     */

    // Update Batch Audit Interval
    function updateBatchAuditInterval(
        uint256 _batchAuditInterval
    ) external onlyOwner {
        s_batchAuditInterval = _batchAuditInterval;
    }

    // Update Expiry Warning Threshold
    function updateExpiryWarningThreshold(
        uint256 _expiryWarningThreshold
    ) external onlyOwner {
        s_expiryWarningThreshold = _expiryWarningThreshold;
    }

    // Update Low Inventory Threshold
    function updateLowInventoryThreshold(
        uint256 _lowInventoryThreshold
    ) external onlyOwner {
        s_lowInventoryThreshold = _lowInventoryThreshold;
    }

    // Update Long Storage Threshold
    function updateLongStorageThreshold(
        uint256 _longStorageThreshold
    ) external onlyOwner {
        s_longStorageThreshold = _longStorageThreshold;
    }

    // Update Max Batches Per Upkeep with validation
    function updateMaxBatchesPerUpkeep(
        uint256 _maxBatchesPerUpkeep
    ) external onlyOwner {
        if (_maxBatchesPerUpkeep == 0 || _maxBatchesPerUpkeep > 100) {
            revert WAGAInventoryManager__InvalidThresholdValue_updateThresholds();
        }
        s_maxBatchesPerUpkeep = _maxBatchesPerUpkeep;
    }

    /**
     * @dev Returns the last audit time for a specific batch
     */
    function getLastBatchAuditTime(
        uint256 batchId
    ) external view returns (uint256) {
        return s_lastBatchAuditTime[batchId];
    }
}
