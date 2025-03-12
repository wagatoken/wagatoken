// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from  "@openzeppelin/contracts/access/AccessControl.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_3_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";

/**
 * @title WAGAInventoryManager
 * @dev Contract for managing coffee inventory with Chainlink Functions for PoR and Automation for regular checks
 */
contract WAGAInventoryManager is
    AccessControl,
    FunctionsClient,
    ConfirmedOwner,
    AutomationCompatibleInterface
{
    bytes32 public constant INVENTORY_MANAGER_ROLE =
        keccak256("INVENTORY_MANAGER_ROLE");

    WAGACoffeeToken public coffeeToken;

    // Chainlink Functions variables
    bytes32 public latestRequestId;
    bytes public latestResponse;
    bytes public latestError;
    uint64 public subscriptionId;
    bytes32 public donId;

    // Chainlink Automation variables
    uint256 public immutable intervalSeconds;
    uint256 public lastTimeStamp;

    // Inventory verification request structure
    struct VerificationRequest {
        uint256 batchId;
        uint256 expectedQuantity;
        bool completed;
        bool verified;
    }

    // Mapping from request ID to verification request
    mapping(bytes32 => VerificationRequest) public verificationRequests;

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

    constructor(
        address coffeeTokenAddress,
        address router,
        uint64 _subscriptionId,
        bytes32 _donId,
        uint256 _intervalSeconds
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(INVENTORY_MANAGER_ROLE, msg.sender);

        // Set this contract as the inventory manager in WAGACoffeeToken
        coffeeToken.setInventoryManager(address(this));

        subscriptionId = _subscriptionId;
        donId = _donId;
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

        emit VerificationCompleted(
            requestId,
            request.batchId,
            request.verified
        );
        emit InventorySynced(request.batchId, actualQuantity);
    }

    /**
     * @dev Parses the response from Chainlink Functions
     * @param response Response from Chainlink Functions
     * @return uint256 Parsed quantity
     */
    function _parseResponse(
        bytes memory response
    ) internal pure returns (uint256) {
        // This is a simplified implementation
        // In a real-world scenario, you would parse the JSON response
        if (response.length == 0) {
            return 0;
        }

        // Convert bytes to uint256
        uint256 result;
        assembly {
            result := mload(add(response, 32))
        }

        return result;
    }

    /**
     * @dev Updates the Chainlink subscription ID
     * @param _subscriptionId New subscription ID
     */
    function updateSubscriptionId(
        uint64 _subscriptionId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        subscriptionId = _subscriptionId;
    }

    /**
     * @dev Updates the Chainlink DON ID
     * @param _donId New DON ID
     */
    function updateDonId(bytes32 _donId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        donId = _donId;
    }

    /**
     * @dev Manually verifies a batch (fallback for when Chainlink Functions fails)
     * @param batchId Batch identifier
     * @param actualQuantity Actual quantity in inventory
     */
    function manuallyVerifyBatch(
        uint256 batchId,
        uint256 actualQuantity
    ) external onlyRole(INVENTORY_MANAGER_ROLE) {
        // Update the batch status in the coffee token contract
        coffeeToken.updateBatchStatus(batchId, true);

        // Sync the inventory in the coffee token contract
        coffeeToken.updateInventory(batchId, actualQuantity);

        emit InventorySynced(batchId, actualQuantity);
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
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > intervalSeconds;
        return (upkeepNeeded, "");
    }

    /**
     * @dev Chainlink Automation function for performing regular maintenance
     * Effects:
     * - Updates lastTimeStamp
     * - Performs inventory audit
     * - Checks for expired batches
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        if ((block.timestamp - lastTimeStamp) > intervalSeconds) {
            lastTimeStamp = block.timestamp;
            performInventoryAudit();
            checkExpiredBatches();
        }
    }

    /**
     * @dev Perform inventory audit
     */
    function performInventoryAudit() internal {
        // Implement logic to audit inventory
        // This could involve calling requestInventoryVerification for each active batch
    }

    /**
     * @dev Check for expired batches
     */
    function checkExpiredBatches() internal {
        uint256[] memory activeBatchIds = coffeeToken.getActiveBatchIds();
        for (uint256 i = 0; i < activeBatchIds.length; i++) {
            uint256 batchId = activeBatchIds[i];
            (, uint256 expiryDate, , ) = coffeeToken
                .batchInfo(batchId);
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

