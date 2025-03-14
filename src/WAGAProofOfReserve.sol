// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAChainlinkFunctionsBase} from "./WAGAChainlinkFunctionsBase.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";

/**
 * @title WAGAProofOfReserve
 * @dev Contract for verifying coffee reserves using Chainlink Functions before minting tokens
 */
contract WAGAProofOfReserve is WAGAChainlinkFunctionsBase {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    WAGACoffeeToken public coffeeToken;

    // Reserve verification request structure
    struct VerificationRequest {
        uint256 batchId;
        uint256 quantity;
        address recipient;
        bool completed;
        bool verified;
    }

    // Mapping from request ID to verification request
    mapping(bytes32 => VerificationRequest) public verificationRequests;

    // Events
    event ReserveVerificationRequested(
        bytes32 indexed requestId,
        uint256 indexed batchId,
        uint256 quantity
    );
    event ReserveVerificationCompleted(
        bytes32 indexed requestId,
        uint256 indexed batchId,
        bool verified
    );

    constructor(
        address coffeeTokenAddress,
        address router,
        uint64 _subscriptionId,
        bytes32 _donId
    ) WAGAChainlinkFunctionsBase(router, _subscriptionId, _donId) {
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Requests verification of coffee reserves using Chainlink Functions
     * @param batchId Batch identifier
     * @param quantity Quantity to verify
     * @param recipient Address to receive minted tokens
     * @param source JavaScript source code for Chainlink Functions
     */
    function requestReserveVerification(
        uint256 batchId,
        uint256 quantity,
        address recipient,
        string calldata source
    ) external onlyRole(VERIFIER_ROLE) returns (bytes32 requestId) {
        require(coffeeToken.isBatchCreated(batchId), "Batch does not exist");

        // Convert the source to bytes
        bytes memory sourceBytes = bytes(source);

        // Make the Chainlink Functions request
        requestId = _sendRequest(sourceBytes, subscriptionId, 300000, donId);

        // Store the verification request
        verificationRequests[requestId] = VerificationRequest({
            batchId: batchId,
            quantity: quantity,
            recipient: recipient,
            completed: false,
            verified: false
        });

        latestRequestId = requestId;

        emit ReserveVerificationRequested(requestId, batchId, quantity);

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

        // Parse the response to get the verified quantity
        uint256 verifiedQuantity = _parseResponse(response);

        // Verify if the actual quantity matches or exceeds the requested quantity
        if (verifiedQuantity >= request.quantity) {
            request.verified = true;

            // Update the batch status in the coffee token contract before minting
            coffeeToken.updateBatchStatus(request.batchId, true);

            // Mint tokens in the coffee token contract
            coffeeToken.mintBatch(
                request.recipient,
                request.batchId,
                request.quantity
            );
        }

        emit ReserveVerificationCompleted(
            requestId,
            request.batchId,
            request.verified
        );
    }
}

