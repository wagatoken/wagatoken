// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {MockFunctionsRouter} from "./MockFunctionsRouter.sol";

/**
 * @title MockFunctionsHelper
 * @dev Helper contract to simulate common Chainlink Functions responses for WAGA testing
 */
contract MockFunctionsHelper {
    MockFunctionsRouter public immutable mockRouter;

    constructor(address _mockRouter) {
        mockRouter = MockFunctionsRouter(_mockRouter);
    }

    /**
     * @dev Simulate a successful coffee batch verification
     * @param requestId The request ID from the original request
     * @param client The client contract (WAGAProofOfReserve)
     * @param quantity The verified quantity
     * @param price The verified price
     */
    function simulateSuccessfulVerification(
        bytes32 requestId,
        address client,
        uint256 quantity,
        uint256 price
    ) external {
        // For successful verification, we need to send the packaging and metadata
        // that match what was used in createBatch for the verification to pass
        mockRouter.mockVerificationResponse(
            requestId,
            client,
            quantity,
            price,
            "250g", // default packaging for successful tests
            "metadataHash123" // default metadata for successful tests
        );
    }

    /**
     * @dev Simulate a failed verification (batch not found or invalid)
     * @param requestId The request ID from the original request
     * @param client The client contract (WAGAProofOfReserve)
     */
    function simulateFailedVerification(
        bytes32 requestId,
        address client
    ) external {
        // For failed verification, send an error instead of response data
        bytes memory response = "";
        bytes memory err = "Batch verification failed: batch not found or invalid";
        
        mockRouter.mockResponse(requestId, response, err, client);
    }

    /**
     * @dev Simulate an API error response
     * @param requestId The request ID from the original request
     * @param client The client contract (WAGAProofOfReserve)
     * @param errorMessage The error message to return
     */
    function simulateApiError(
        bytes32 requestId,
        address client,
        string memory errorMessage
    ) external {
        bytes memory response = "";
        bytes memory err = bytes(errorMessage);
        
        mockRouter.mockResponse(requestId, response, err, client);
    }

    /**
     * @dev Simulate a custom verification response
     * @param requestId The request ID from the original request
     * @param client The client contract (WAGAProofOfReserve)
     * @param quantity The actual quantity found
     * @param price The actual price found
     * @param packaging The verified packaging info
     * @param metadataHash The verified metadata hash
     * @param errorMessage Any error message (empty string if no error)
     */
    function simulateCustomResponse(
        bytes32 requestId,
        address client,
        uint256 quantity,
        uint256 price,
        string memory packaging,
        string memory metadataHash,
        string memory errorMessage
    ) external {
        bytes memory response = abi.encode(quantity, price, packaging, metadataHash);
        bytes memory err = bytes(errorMessage);
        
        mockRouter.mockResponse(requestId, response, err, client);
    }
}
