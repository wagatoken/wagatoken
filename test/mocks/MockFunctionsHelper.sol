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
        mockRouter.mockSuccessfulVerification(
            requestId,
            client,
            true, // verified = true
            quantity,
            price
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
        mockRouter.mockSuccessfulVerification(
            requestId,
            client,
            false, // verified = false
            0,
            0
        );
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
     * @param verified Whether the batch is verified
     * @param quantity The actual quantity found
     * @param price The actual price found
     * @param errorMessage Any error message (empty string if no error)
     */
    function simulateCustomResponse(
        bytes32 requestId,
        address client,
        bool verified,
        uint256 quantity,
        uint256 price,
        string memory errorMessage
    ) external {
        bytes memory response = abi.encode(verified, quantity, price);
        bytes memory err = bytes(errorMessage);
        
        mockRouter.mockResponse(requestId, response, err, client);
    }
}
