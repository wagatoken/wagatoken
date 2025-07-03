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
        uint256 lastVerifiedTimestamp;
    }

    struct BatchInfo {
        uint256 productionDate;
        uint256 expiryDate;
        bool isVerified;
        uint256 currentQuantity;
        uint256 pricePerUnit;
        string packagingInfo;
        string metadataHash;
        bool isMetadataVerified;
    }

    // Mapping from request ID to verification request
    mapping(bytes32 requestId => VerificationRequest verificationRequest)
        public verificationRequests;

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
    error WAGAProofOfReserve__InvalidAddress_requestReserveVerification();
    error WAGAProofOfReserve__QuantityNotVerified_fulfillRequest();
    error WAGAProofOfReserve__BatchMetadataNotVerified_fulfillRequest();

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
    )
        WAGAChainlinkFunctionsBase(router, _subscriptionId, _donId)
    /*Ownable(msg.sender)*/ {
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
        if (recipient == address(0)) {
            revert WAGAProofOfReserve__InvalidAddress_requestReserveVerification();
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
            verified: false,
            lastVerifiedTimestamp: block.timestamp
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
        // retrieve the verification request
        VerificationRequest storage request = verificationRequests[requestId];
        if (request.completed) {
            revert WAGAProofOfReserve__RequestAlreadyCompleted_fulfillRequest();
        }

        // Parse all required fields from the response
        (
            uint256 verifiedQuantity,
            uint256 verifiedPrice,
            string memory verifiedPackaging,
            string memory verifiedMetadataHash
        ) = _parseResponse(response);

        coffeeToken.verifyBatchMetadata(
            request.batchId,
            verifiedPrice,
            verifiedPackaging,
            verifiedMetadataHash
        );
        (, , , , , , , bool isMetadataVerified) = coffeeToken.s_batchInfo(
            request.batchId
        );

        if (!isMetadataVerified) {
            revert WAGAProofOfReserve__BatchMetadataNotVerified_fulfillRequest();
        }
        if (verifiedQuantity < request.quantity) {
            revert WAGAProofOfReserve__QuantityNotVerified_fulfillRequest();
        }
        request.completed = true;
        request.verified = true;
        request.lastVerifiedTimestamp = block.timestamp;
        emit ReserveVerificationCompleted(
            requestId,
            request.batchId,
            request.verified
        );
        coffeeToken.updateInventory(
            request.batchId,
            verifiedQuantity
        );
        coffeeToken.updateBatchStatus(request.batchId, true);
        coffeeToken.mintBatch(
            request.recipient,
            request.batchId,
            request.quantity // @audit: Shouldn't we be minting the verified quantity?
        );
    }
}
