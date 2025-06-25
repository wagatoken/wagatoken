// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAChainlinkFunctionsBase} from "./WAGAChainlinkFunctionsBase.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";
// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WAGAProofOfReserve
 * @dev Contract for verifying coffee reserves using Chainlink Functions before minting tokens
 */
contract WAGAProofOfReserve is WAGAChainlinkFunctionsBase /*, Ownable */ {
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

    error WAGAProofOfReserve__BatchDoesNotExist_requestReserveVerification();
    error WAGAProofOfReserve__BatchMetadataNotVerified_requestReserveVerification();
    error WAGAProofOfReserve__RequestAlreadyCompleted_fulfillRequest();
    error WAGAProofOfReserve__InvalidSourceCode_requestReserveVerification();

    /**
     * @dev Constructor to initialize the contract
     * @param coffeeTokenAddress Address of the WAGACoffeeToken contract
     * @param router Address of the Chainlink Functions router
     * @param _subscriptionId Chainlink subscription ID
     * @param _donId Decentralized Oracle Network (DON) ID
     */
    constructor(
        address coffeeTokenAddress,
        address router,
        uint64 _subscriptionId,
        bytes32 _donId
    ) WAGAChainlinkFunctionsBase(router, _subscriptionId, _donId) /*Ownable(msg.sender)*/ {
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        _grantRole(VERIFIER_ROLE, msg.sender); // Remember to transfer this role to the appropriate verifier
    }

    /**
     * @dev Requests verification of coffee reserves using Chainlink Functions
     * @param batchId Batch identifier
     * @param quantity Quantity to verify
     * @param recipient Address to receive minted tokens
     * @param source JavaScript source code for Chainlink Functions
     * @return requestId The ID of the Chainlink Functions request
     * Requirements:
     * - Batch must exist in the WAGACoffeeToken contract
     * - Batch metadata must be verified
     */
    function requestReserveVerification(
        uint256 batchId,
        uint256 quantity,
        address recipient,
        string calldata source
    ) external onlyRole(VERIFIER_ROLE) returns (bytes32 requestId) {
        // Check if the batch exists
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGAProofOfReserve__BatchDoesNotExist_requestReserveVerification();
        }
        // Check that the source code is not empty
        if (bytes(source).length == 0) {
            revert WAGAProofOfReserve__InvalidSourceCode_requestReserveVerification();
        }
        // Convert source code to bytes
        bytes memory sourceBytes = bytes(source);
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
        if (request.completed) {
            revert WAGAProofOfReserve__RequestAlreadyCompleted_fulfillRequest();
        }
        request.completed = true;

        // Parse all required fields from the response
        (uint256 verifiedQuantity, uint256 price, string memory packaging, string memory metadataHash) = _parseResponse(response);

        // Verify metadata on-chain
        try coffeeToken.verifyBatchMetadata(
            request.batchId,
            price,
            packaging,
            metadataHash
        ) {
            // Metadata verified successfully
            // Check that metadata is verified in storage before minting
            (, , , , , , , bool isMetadataVerified) = coffeeToken.batchInfo(request.batchId);
            if (verifiedQuantity >= request.quantity && isMetadataVerified) {
                request.verified = true;
                coffeeToken.updateBatchStatus(request.batchId, true);
                coffeeToken.mintBatch(
                    request.recipient,
                    request.batchId,
                    request.quantity
                );
            }
        } catch {
            // Metadata mismatch, do not mint or update status
        }

        emit ReserveVerificationCompleted(
            requestId,
            request.batchId,
            request.verified
        );
    }
}