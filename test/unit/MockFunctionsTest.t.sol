// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {MockFunctionsRouter} from "../../test/mocks/MockFunctionsRouter.sol";
import {MockFunctionsHelper} from "../../test/mocks/MockFunctionsHelper.sol";
import {MockFunctionsClient} from "../../test/mocks/MockFunctionsClient.sol";

/**
 * @title MockFunctionsTest
 * @dev Unit test to verify MockFunctionsRouter, MockFunctionsHelper, and MockFunctionsClient work correctly
 */
contract MockFunctionsTest is Test {
    MockFunctionsRouter public mockRouter;
    MockFunctionsHelper public mockHelper;
    MockFunctionsClient public mockClient;

    function setUp() public {
        // Deploy our own mock router for testing
        mockRouter = new MockFunctionsRouter();

        // Deploy the helper
        mockHelper = new MockFunctionsHelper(address(mockRouter));

        // Deploy a mock client for testing callbacks
        mockClient = new MockFunctionsClient(address(mockRouter));

        console.log("MockFunctionsRouter deployed at:", address(mockRouter));
        console.log("MockFunctionsHelper deployed at:", address(mockHelper));
        console.log("MockFunctionsClient deployed at:", address(mockClient));
    }

    function testMockFunctionsRouterDeployment() public view {
        // Test that the router is properly deployed
        assertTrue(address(mockRouter) != address(0));
        assertTrue(mockRouter.isValidSubscription(1));
    }

    function testSendRequest() public {
        // Simulate sending a Functions request
        bytes memory requestData = abi.encode("test data");
        
        vm.prank(address(mockClient));
        bytes32 requestId = mockRouter.sendRequest(
            1, // subscriptionId
            requestData,
            1, // dataVersion
            300000, // callbackGasLimit
            0x66756e2d6c6f63616c2d74657374000000000000000000000000000000000000 // donId
        );

        // Verify request was created
        assertTrue(mockRouter.isPendingRequest(requestId));
        console.log("Request ID generated:", vm.toString(requestId));
    }

    function testMockSuccessfulVerification() public {
        // This demonstrates how to test WAGAProofOfReserve with mocked responses
        bytes memory requestData = abi.encode("test verification data");
        
        vm.prank(address(mockClient));
        bytes32 requestId = mockRouter.sendRequest(1, requestData, 1, 300000, bytes32(0));
        
        // Simulate successful verification
        mockHelper.simulateSuccessfulVerification(
            requestId,
            address(mockClient),
            1000, // quantity
            50 * 1e18 // price in wei
        );

        // Verify request is no longer pending
        assertFalse(mockRouter.isPendingRequest(requestId));
        
        // Verify callback was received
        assertTrue(mockClient.callbackReceived());
        assertEq(mockClient.latestRequestId(), requestId);
    }

    function testMockFailedVerification() public {
        bytes memory requestData = abi.encode("test verification data");
        
        vm.prank(address(mockClient));
        bytes32 requestId = mockRouter.sendRequest(1, requestData, 1, 300000, bytes32(0));
        
        // Simulate failed verification
        mockHelper.simulateFailedVerification(requestId, address(mockClient));

        // Verify request is no longer pending
        assertFalse(mockRouter.isPendingRequest(requestId));
        
        // Verify callback was received
        assertTrue(mockClient.callbackReceived());
        assertEq(mockClient.latestRequestId(), requestId);
    }

    function testMockApiError() public {
        bytes memory requestData = abi.encode("test verification data");
        
        vm.prank(address(mockClient));
        bytes32 requestId = mockRouter.sendRequest(1, requestData, 1, 300000, bytes32(0));
        
        // Simulate API error
        mockHelper.simulateApiError(requestId, address(mockClient), "API endpoint unavailable");

        // Verify request is no longer pending
        assertFalse(mockRouter.isPendingRequest(requestId));
        
        // Verify callback was received with error
        assertTrue(mockClient.callbackReceived());
        assertEq(mockClient.latestRequestId(), requestId);
        assertEq(string(mockClient.latestError()), "API endpoint unavailable");
    }
}
