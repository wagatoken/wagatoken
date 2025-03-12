// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_3_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";

/**
 * @title WAGAProofOfReserve
 * @dev Contract for verifying coffee reserves using Chainlink Functions before minting tokens
 */
contract WAGAProofOfReserve is AccessControl, FunctionsClient, ConfirmedOwner {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    IWAGACoffeeToken public coffeeToken;

    // Chainlink Functions variables
    bytes32 public latestRequestId;
    bytes public latestResponse;
    bytes public latestError;
    uint64 public subscriptionId;
    bytes32 public donId;

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
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        coffeeToken = IWAGACoffeeToken(coffeeTokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);

        subscriptionId = _subscriptionId;
        donId = _donId;
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
}

