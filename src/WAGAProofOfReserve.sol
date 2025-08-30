// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WAGAChainlinkFunctionsBase} from "./WAGAChainlinkFunctionsBase.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
//import {WAGAConfigManager} from "./WAGAConfigManager.sol";

/**
 * @title WAGAProofOfReserve
 * @dev Contract for verifying coffee reserves using Chainlink Functions before minting tokens
 */
contract WAGAProofOfReserve is
    WAGAChainlinkFunctionsBase
   // WAGAConfigManager /*, Ownable */
{
    /* -------------------------------------------------------------------------- */
    /*                                  // Errors                                 */
    /* -------------------------------------------------------------------------- */

    error WAGAProofOfReserve__BatchDoesNotExist_requestReserveVerification();
    error WAGAProofOfReserve__BatchMetadataNotVerified_requestReserveVerification();
    error WAGAProofOfReserve__RequestAlreadyCompleted_fulfillRequest();
    error WAGAProofOfReserve__InvalidSourceCode_requestReserveVerification();
    error WAGAProofOfReserve__BatchInactive_requestReserveVerification();
    error WAGAProofOfReserve__InvalidAddress_requestReserveVerification();
    error WAGAProofOfReserve__InvalidQuantity_requestReserveVerification();
    error WAGAProofOfReserve__RequestFailed_requestReserveVerification();
    error WAGAProofOfReserve__QuantityNotVerified_fulfillRequest();
    error WAGAProofOfReserve__BatchMetadataNotVerified_fulfillRequest();
    error WAGAProofOfReserve__CallerDoesNotHaveRequiredRole_callHasRoleFromCoffeeToken();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */
    // Reserve verification request structure
    struct VerificationRequest {
        uint256 batchId;
        uint256 requestQuantity; // Expected quantity from batch (not minted tokens)
        uint256 verifiedQuantity; // Quantity verified by Chainlink Functions
        uint256 requestPrice; // Price per unit from batch
        uint256 verifiedPrice; // Price verified by Chainlink Functions
        string expectedPackaging; // Packaging info from batch
        string verifiedPackaging; // Packaging verified by Chainlink Functions
        string expectedMetadataHash; // Metadata hash from batch
        string verifiedMetadataHash; // Metadata hash verified by Chainlink Functions
        address recipient;
        bool completed;
        bool verified;
        uint256 lastVerifiedTimestamp; // Timestamp of last request verification
        bool shouldMint; // Flag to indicate if tokens should be minted
    }

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    // bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
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
        // _grantRole(VERIFIER_ROLE, msg.sender);
        // _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // what is the difference between this and ADMIN_ROLE?
        // _grantRole(ADMIN_ROLE, msg.sender); // Remember to transfer this role to the appropriate verifier
    }

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        if (!coffeeToken.hasRole(roleType, msg.sender)) {
            revert WAGAProofOfReserve__CallerDoesNotHaveRequiredRole_callHasRoleFromCoffeeToken();
        }
        _;
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
     * @param requestId Batch request ID to fulfill
     * @param source JavaScript source code for Chainlink Functions
     * @return verificationRequestId The ID of the Chainlink Functions request
     * Requirements:
     * - Batch must exist in the WAGACoffeeToken contract
     * - Batch request must exist and not be fulfilled
     * - Batch metadata must be verified
     */
    function requestReserveVerification(
        uint256 batchId,
        uint256 requestId,
        string calldata source // Get quantity, price, packaging, metadata hash (API call to offchain database)
    )
        external
        callerHasRoleFromCoffeeToken(coffeeToken.VERIFIER_ROLE())
       // onlyRole(coffeeToken.VERIFIER_ROLE())
        returns (bytes32 verificationRequestId)
    {
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
        
        // Get batch request information
        (
            uint256 requestBatchId,
            address requester,
            uint256 requestedQuantity,
            string memory requestDetails,
            uint256 requestTimestamp,
            bool isFulfilled,
            uint256 fulfilledQuantity,
            uint256 fulfilledTimestamp
        ) = coffeeToken.getBatchRequest(batchId, requestId);
        
        // Check if request exists and is not fulfilled
        if (requestBatchId != batchId) {
            revert WAGAProofOfReserve__BatchDoesNotExist_requestReserveVerification();
        }
        if (isFulfilled) {
            revert WAGAProofOfReserve__RequestAlreadyCompleted_fulfillRequest();
        }
        if (requestedQuantity == 0) {
            revert WAGAProofOfReserve__InvalidQuantity_requestReserveVerification();
        }

        // Get Expected Values for Verification from the WAGACoffeeToken contract
        (
            ,
            ,
            ,
            uint256 batchQuantity,
            uint256 mintedQuantity,
            uint256 pricePerUnit

        ) = coffeeToken.s_batchInfo(batchId);

        // Get extended data from separate mappings
        string memory packagingInfo = coffeeToken.getBatchPackagingInfo(batchId);
        string memory metadataHash = coffeeToken.getBatchMetadataHash(batchId);

        // Prepare arguments for Chainlink Functions
        string[] memory args = new string[](5);
        args[0] = Strings.toString(batchId);
        args[1] = Strings.toString(requestedQuantity); // Use requested quantity instead of batch quantity
        args[2] = Strings.toString(pricePerUnit);
        args[3] = packagingInfo;
        args[4] = metadataHash;

        // Convert source code to bytes
        bytes memory sourceBytes = bytes(source);
        verificationRequestId = _sendRequestWithArgs(
            sourceBytes,
            args, // @audit We do not have this in the base contract, need to be sure the DON supports and/or processes it
            subscriptionId,
            300000, // @audit: Magic Number for gas limit
            donId
        );

        // Check that the request was successful
        if (verificationRequestId == bytes32(0)) {
            revert WAGAProofOfReserve__RequestFailed_requestReserveVerification();
        }
        // Store the verification request
        verificationRequests[verificationRequestId] = VerificationRequest({
            batchId: batchId,
            requestQuantity: requestedQuantity, // Use requested quantity
            verifiedQuantity: 0,
            requestPrice: pricePerUnit,
            verifiedPrice: 0,
            expectedPackaging: packagingInfo,
            verifiedPackaging: "",
            expectedMetadataHash: metadataHash,
            verifiedMetadataHash: "",
            recipient: requester, // Use the requester from batch request
            completed: false,
            verified: false,
            lastVerifiedTimestamp: block.timestamp,
            shouldMint: true // Set to true by default, can be changed later
        });
        latestRequestId = verificationRequestId;
        emit ReserveVerificationRequested(verificationRequestId, batchId, requestedQuantity);
        return verificationRequestId;
    }
    /**
     * @dev Requests verification of coffee inventory using Chainlink Functions WITHOUT token minting
     * @param batchId Batch identifier
     * @param source JavaScript source code for Chainlink Functions
     * @return requestId The ID of the Chainlink Functions request
     */
    function requestInventoryVerification(
        uint256 batchId,
        string calldata source
    )
        external
        callerHasRoleFromCoffeeToken(coffeeToken.INVENTORY_MANAGER_ROLE())
       // onlyRole(coffeeToken.INVENTORY_MANAGER_ROLE())
        returns (bytes32 requestId)
    {
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

        // Get Expected Values for Verification from the WAGACoffeeToken contract
        (
            ,
            ,
            ,
            uint256 quantity, // Now uses quantity field
            uint256 mintedQuantity,
            uint256 pricePerUnit

        ) = coffeeToken.s_batchInfo(batchId);

        // Get extended data from separate mappings
        string memory packagingInfo = coffeeToken.getBatchPackagingInfo(batchId);
        string memory metadataHash = coffeeToken.getBatchMetadataHash(batchId);

        // Prepare arguments for Chainlink Functions
        string[] memory args = new string[](5);
        args[0] = Strings.toString(batchId);
        args[1] = Strings.toString(quantity);
        args[2] = Strings.toString(pricePerUnit);
        args[3] = packagingInfo;
        args[4] = metadataHash;

        // Convert source code to bytes
        bytes memory sourceBytes = bytes(source);
        requestId = _sendRequestWithArgs(
            sourceBytes,
            args,
            subscriptionId,
            300000,
            donId
        );

        // Check that the request was successful
        if (requestId == bytes32(0)) {
            revert WAGAProofOfReserve__RequestFailed_requestReserveVerification();
        }

        // Store the verification request WITHOUT minting enabled
        verificationRequests[requestId] = VerificationRequest({
            batchId: batchId,
            requestQuantity: quantity,
            verifiedQuantity: 0,
            requestPrice: pricePerUnit,
            verifiedPrice: 0,
            expectedPackaging: packagingInfo,
            verifiedPackaging: "",
            expectedMetadataHash: metadataHash,
            verifiedMetadataHash: "",
            recipient: address(0), // No recipient for inventory verification
            completed: false,
            verified: false,
            lastVerifiedTimestamp: block.timestamp,
            shouldMint: false // Disable minting for inventory verification
        });

        latestRequestId = requestId;
        emit ReserveVerificationRequested(requestId, batchId, quantity);
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

        // Handle API errors first
        if (err.length > 0) {
            // Mark request as completed but not verified due to error
            request.completed = true;
            request.verified = false;
            request.lastVerifiedTimestamp = block.timestamp;
            
            emit ReserveVerificationCompleted(
                requestId,
                request.batchId,
                false // verification failed due to error
            );
            return; // Exit early, don't process response
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
        bool isMetadataVerified = coffeeToken.isBatchMetadataVerified(
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
        // Update coffeeToken state regardless of the check.
        coffeeToken.updateBatchLastVerifiedTimestamp(
            request.batchId,
            block.timestamp
        );
        coffeeToken.updateInventory(request.batchId, verifiedQuantity);
        coffeeToken.updateBatchStatus(request.batchId, true);
        emit ReserveVerificationCompleted(
            requestId,
            request.batchId,
            request.verified
        );

        // Only mint tokens if shouldMint is true
        if (request.shouldMint) {
            coffeeToken.mintBatch(
                request.recipient,
                request.batchId,
                request.verifiedQuantity
            );
        }
    }
}
