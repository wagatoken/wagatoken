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
    /* -------------------------------------------------------------------------- */
    /*                                  // Errors                                 */
    /* -------------------------------------------------------------------------- */

    error WAGAProofOfReserve__BatchDoesNotExist_requestReserveVerification();
    error WAGAProofOfReserve__BatchMetadataNotVerified_requestReserveVerification();
    error WAGAProofOfReserve__RequestAlreadyCompleted_fulfillRequest();
    error WAGAProofOfReserve__InvalidSourceCode_requestReserveVerification();
    error WAGAProofOfReserve__BatchInactive_requestReserveVerification();
    error WAGAProofOfReserve__InvalidAddress_requestReserveVerification();
    //error WAGAProofOfReserve__InvalidQuantity_requestReserveVerification();
    error WAGAProofOfReserve__RequestFailed_requestReserveVerification();
    error WAGAProofOfReserve__QuantityNotVerified_fulfillRequest();
    error WAGAProofOfReserve__BatchMetadataNotVerified_fulfillRequest();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */
    // Reserve verification request structure
    struct VerificationRequest {
        uint256 batchId;
        uint256 requestQuantity; // Quantity retrieved from WAGACoffeeToken contract
        uint256 verifiedQuantity; // Quantity verified by Chainlink Functions
        uint256 requestPrice; // Price retrieved from WAGACoffeeToken contract
        uint256 verifiedPrice; // Price verified by Chainlink Functions
        string expectedPackaging; // Packaging retrieved from WAGACoffeeToken contract
        string verifiedPackaging; // Packaging verified by Chainlink Functions
        string expectedMetadataHash; // Quantity verified by Chainlink Functions
        string verifiedMetadataHash; // Metadata hash verified by Chainlink Functions
        address recipient;
        bool completed;
        bool verified;
        uint256 lastVerifiedTimestamp; // Timestamp of last request verification
    }

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    WAGACoffeeToken public coffeeToken;

    // Mapping from request ID to verification request
    mapping(bytes32 requestId => VerificationRequest verificationRequest)
        public verificationRequests;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */
    
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
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // what is the difference between this and ADMIN_ROLE?
        _grantRole(ADMIN_ROLE, msg.sender); // Remember to transfer this role to the appropriate verifier
    }

    /* -------------------------------------------------------------------------- */
    /*                             External Functions                             */
    /* -------------------------------------------------------------------------- */

    /* -------------------------------------------------------------------------- */
    /*                            Request Verification                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Requests verification of coffee reserves using Chainlink Functions
     * @param batchId Batch identifier
     * @param recipient Address to receive minted tokens
     * @param source JavaScript source code for Chainlink Functions
     * @return requestId The ID of the Chainlink Functions request
     * Requirements:
     * - Batch must exist in the WAGACoffeeToken contract
     * - Batch metadata must be verified
     */
    function requestReserveVerification(
        uint256 batchId,
        // uint256 quantity,
        address recipient,
        string calldata source // Get quantity, price, packaging, metadata hash (API call to offchain database)
    ) external onlyRole(VERIFIER_ROLE) returns (bytes32 requestId) {
        // Check if the batch exists
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGAProofOfReserve__BatchDoesNotExist_requestReserveVerification();
        }
        // Check if the batch is active
        if (!coffeeToken.isBatchActive(batchId)) {
            revert WAGAProofOfReserve__BatchInactive_requestReserveVerification();
        }
        // Check that the source code is not empty
        if (bytes(source).length == 0) {
            revert WAGAProofOfReserve__InvalidSourceCode_requestReserveVerification();
        }
        // Check the recipient address is valid
        if (recipient == address(0)) {
            revert WAGAProofOfReserve__InvalidAddress_requestReserveVerification();
        }
        // // Check that the quantity is greater than zero
        // if (quantity == 0) {
        //     revert WAGAProofOfReserve__InvalidQuantity_requestReserveVerification();
        // }

        // Get Expected Values for Verification from the WAGACoffeeToken contract
        (
            ,
            ,
            ,
            uint256 requestQuantity,
            uint256 requestPrice,
            string memory expectedPackaging,
            string memory expectedMetadataHash,
            ,
        ) = coffeeToken.s_batchInfo(batchId);
        // Convert source code to bytes
        bytes memory sourceBytes = bytes(source);
        requestId = _sendRequest(sourceBytes, subscriptionId, 300000, donId); // @audit: How do we know if the request was successful?
        // Check that the request was successful
        if (requestId == bytes32(0)) {
            revert WAGAProofOfReserve__RequestFailed_requestReserveVerification();
        }
        // Store the verification request
        verificationRequests[requestId] = VerificationRequest({
            batchId: batchId,
            requestQuantity: requestQuantity,
            verifiedQuantity: 0,
            requestPrice: requestPrice,
            verifiedPrice: 0,
            expectedPackaging: expectedPackaging,
            verifiedPackaging: "",
            expectedMetadataHash: expectedMetadataHash,
            verifiedMetadataHash: "",
            recipient: recipient,
            completed: false,
            verified: false,
            lastVerifiedTimestamp: block.timestamp
        });
        latestRequestId = requestId;
        emit ReserveVerificationRequested(requestId, batchId, requestQuantity);
        return requestId;
    }

    /* -------------------------------------------------------------------------- */
    /*                            Fulfill Verification                            */
    /* -------------------------------------------------------------------------- */

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
        // Update the request with the verified values
        request.verifiedQuantity = verifiedQuantity;
        request.verifiedPrice = verifiedPrice;
        request.verifiedPackaging = verifiedPackaging;
        request.verifiedMetadataHash = verifiedMetadataHash;
        // Verify the batch metadata
        coffeeToken.verifyBatchMetadata(
            request.batchId,
            verifiedPrice,
            verifiedPackaging,
            verifiedMetadataHash
        );
        (, , , , , , ,  bool isMetadataVerified,) = coffeeToken.s_batchInfo(
            request.batchId
        );

        if (!isMetadataVerified) {
            revert WAGAProofOfReserve__BatchMetadataNotVerified_fulfillRequest();
        }
        if (verifiedQuantity < request.requestQuantity) {
            revert WAGAProofOfReserve__QuantityNotVerified_fulfillRequest();
        }
        request.completed = true;
        request.verified = true;
        request.lastVerifiedTimestamp = block.timestamp;
        coffeeToken.updateBatchLastVerifiedTimestamp(request.batchId, block.timestamp);
        emit ReserveVerificationCompleted(
            requestId,
            request.batchId,
            request.verified
        );
        coffeeToken.updateInventory(request.batchId, verifiedQuantity);
        coffeeToken.updateBatchStatus(request.batchId, true);
        coffeeToken.mintBatch(
            request.recipient,
            request.batchId,
            request.verifiedQuantity // @audit: Shouldn't we be minting the verified quantity?
        );
    }
}
