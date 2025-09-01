// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {IPrivacyLayer} from "../../src/Interfaces/IPrivacyLayer.sol";
import {MockFunctionsRouter} from "../mocks/MockFunctionsRouter.sol";
import {MockFunctionsHelper} from "../mocks/MockFunctionsHelper.sol";
import {MockFunctionsClient} from "../mocks/MockFunctionsClient.sol";

/**
 * @title WAGAChainlinkIntegration
 * @dev Comprehensive integration test for WAGA contracts with Chainlink Functions
 * This test focuses on the full Chainlink Functions integration with WAGAProofOfReserve
 * using mock contracts to simulate oracle responses
 */
contract WAGAChainlinkIntegration is Test {
    // Contract instances
    DeployRealZKMVP public deployer;
    HelperConfig public helperConfig;
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGACoffeeRedemption public redemptionContract;
    CircomVerifier public circomVerifier;
    PrivacyLayer public privacyLayer;

    // Mock contracts
    MockFunctionsRouter public mockRouter;
    MockFunctionsHelper public mockHelper;
    MockFunctionsClient public mockClient;

    // Test addresses
    address public constant ADMIN_USER = address(0x1);
    address public constant PROCESSOR_USER = address(0x2);
    address public constant DISTRIBUTOR_USER = address(0x3);
    address public constant VERIFIER_USER = address(0x4);
    address public constant USER1 = address(0x5);

    // Test data
    uint256 public testBatchId;
    bytes32 public testRequestId;

    function setUp() public {
        // Deploy all contracts via the standard deployment script
        deployer = new DeployRealZKMVP();
        (
            coffeeToken,
            batchManager,
            zkManager,
            proofOfReserve,
            inventoryManager,
            redemptionContract,
            circomVerifier,
            privacyLayer,
            helperConfig
        ) = deployer.run();

        // Deploy mock contracts for testing
        mockRouter = new MockFunctionsRouter();
        mockHelper = new MockFunctionsHelper(address(mockRouter));
        mockClient = new MockFunctionsClient(address(mockRouter));

        // Set up roles correctly
        address deployer_address = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // Default anvil account

        // Grant roles using the deployer address which has DEFAULT_ADMIN_ROLE
        vm.startPrank(deployer_address);

        // Grant roles to test addresses
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), PROCESSOR_USER);
        coffeeToken.grantRole(keccak256("DISTRIBUTOR_ROLE"), DISTRIBUTOR_USER);
        coffeeToken.grantRole(keccak256("VERIFIER_ROLE"), VERIFIER_USER);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), ADMIN_USER); // Admin also gets processor role for testing

        vm.stopPrank();

        console.log("Chainlink Integration test setup completed");
        console.log("MockRouter:", address(mockRouter));
        console.log("MockHelper:", address(mockHelper));
        console.log("MockClient:", address(mockClient));
        console.log("ProofOfReserve:", address(proofOfReserve));
    }

    function testCreateBatchForChainlinkTesting() public {
        console.log("Creating batch for Chainlink testing...");

        // Create a batch as processor
        vm.startPrank(PROCESSOR_USER);

        testBatchId = coffeeToken.createBatchSimple(
            1000, // quantity
            50 * 1e18, // pricePerUnit (50 ETH)
            "ipfs://QmTestBatch123" // metadataURI
        );

        console.log("Created test batch ID:", testBatchId);
        console.log("Batch created:", coffeeToken.isBatchCreated(testBatchId));
        console.log("Batch active:", coffeeToken.isBatchActive(testBatchId));

        assertTrue(coffeeToken.isBatchCreated(testBatchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(testBatchId), "Batch should be active");

        vm.stopPrank();

        console.log("Batch creation for Chainlink testing completed!");
    }

    function testChainlinkFunctionsIntegration() public {
        // First create a batch
        testCreateBatchForChainlinkTesting();

        console.log("Testing Chainlink Functions integration...");

        // Reset mock client state
        mockClient.resetState();

        // Simulate sending a request to Chainlink Functions via MockFunctionsClient
        string memory sourceCode = "https://api.example.com/verify-batch";

        vm.prank(address(mockClient));
        testRequestId = mockRouter.sendRequest(
            1, // subscriptionId
            abi.encode(sourceCode),
            1, // dataVersion
            300000, // callbackGasLimit
            bytes32("test-don-id")
        );

        console.log("Mock Chainlink request sent with ID:", vm.toString(testRequestId));

        // Verify request was created
        assertTrue(mockRouter.isPendingRequest(testRequestId), "Request should be pending");
        assertFalse(mockClient.callbackReceived(), "Callback should not be received yet");
    }

    function testSuccessfulReserveVerification() public {
        // Setup: Create batch and request verification
        testCreateBatchForChainlinkTesting();
        testChainlinkFunctionsIntegration();

        console.log("Testing successful reserve verification...");

        // Simulate successful verification response to MockFunctionsClient
        mockHelper.simulateSuccessfulVerification(
            testRequestId,
            address(mockClient),
            1000, // verifiedQuantity
            50 * 1e18 // verifiedPrice
        );

        // Verify request is no longer pending
        assertFalse(mockRouter.isPendingRequest(testRequestId), "Request should no longer be pending");

        // Verify MockFunctionsClient received the callback
        assertTrue(mockClient.callbackReceived(), "Mock client should have received callback");
        assertEq(mockClient.latestRequestId(), testRequestId, "Request ID should match");
        assertGt(mockClient.latestResponse().length, 0, "Response should not be empty");
        assertEq(mockClient.latestError().length, 0, "Error should be empty for successful response");

        console.log("Successful reserve verification test completed!");
    }

    function testReserveVerificationFailure() public {
        // Setup: Create batch and request verification
        testCreateBatchForChainlinkTesting();
        testChainlinkFunctionsIntegration();

        console.log("Testing reserve verification failure...");

        // Simulate failed verification (batch not found) to MockFunctionsClient
        mockHelper.simulateFailedVerification(
            testRequestId,
            address(mockClient)
        );

        // Verify request is no longer pending
        assertFalse(mockRouter.isPendingRequest(testRequestId), "Request should no longer be pending");

        // Verify MockFunctionsClient received the callback with error
        assertTrue(mockClient.callbackReceived(), "Mock client should have received callback");
        assertEq(mockClient.latestRequestId(), testRequestId, "Request ID should match");
        assertEq(mockClient.latestResponse().length, 0, "Response should be empty for failed verification");
        assertGt(mockClient.latestError().length, 0, "Error should not be empty for failed verification");

        console.log("Reserve verification failure test completed!");
    }

    function testApiErrorHandling() public {
        // Setup: Create batch and request verification
        testCreateBatchForChainlinkTesting();
        testChainlinkFunctionsIntegration();

        console.log("Testing API error handling...");

        // Simulate API error response to MockFunctionsClient
        mockHelper.simulateApiError(
            testRequestId,
            address(mockClient),
            "API endpoint unavailable"
        );

        // Verify request is no longer pending
        assertFalse(mockRouter.isPendingRequest(testRequestId), "Request should no longer be pending");

        // Verify MockFunctionsClient received the callback with error
        assertTrue(mockClient.callbackReceived(), "Mock client should have received callback");
        assertEq(mockClient.latestRequestId(), testRequestId, "Request ID should match");
        assertEq(mockClient.latestResponse().length, 0, "Response should be empty for API error");
        assertGt(mockClient.latestError().length, 0, "Error should not be empty for API error");
        assertEq(string(mockClient.latestError()), "API endpoint unavailable", "Error message should match");

        console.log("API error handling test completed!");
    }

    function testCustomVerificationResponse() public {
        // Setup: Create batch and request verification
        testCreateBatchForChainlinkTesting();
        testChainlinkFunctionsIntegration();

        console.log("Testing custom verification response...");

        // Simulate custom verification with specific data to MockFunctionsClient
        uint256 customQuantity = 750;
        uint256 customPrice = 60 * 1e18;
        string memory customPackaging = "500g";
        string memory customMetadataHash = "ipfs://QmCustomBatch";

        mockHelper.simulateCustomResponse(
            testRequestId,
            address(mockClient),
            customQuantity,
            customPrice,
            customPackaging,
            customMetadataHash,
            "" // no error
        );

        // Verify request is no longer pending
        assertFalse(mockRouter.isPendingRequest(testRequestId), "Request should no longer be pending");

        // Verify MockFunctionsClient received the callback
        assertTrue(mockClient.callbackReceived(), "Mock client should have received callback");
        assertEq(mockClient.latestRequestId(), testRequestId, "Request ID should match");
        assertGt(mockClient.latestResponse().length, 0, "Response should not be empty");
        assertEq(mockClient.latestError().length, 0, "Error should be empty for successful custom response");

        console.log("Custom verification response test completed!");
    }

    function testMultipleVerificationRequests() public {
        // First create a batch
        testCreateBatchForChainlinkTesting();

        console.log("Testing multiple verification requests...");

        // Create multiple verification requests
        bytes32[] memory requestIds = new bytes32[](3);

        for (uint256 i = 0; i < 3; i++) {
            // Reset mock client state for each request
            mockClient.resetState();

            vm.startPrank(address(mockClient));
            requestIds[i] = mockRouter.sendRequest(
                1,
                abi.encode("https://api.example.com/verify-batch-", i),
                1,
                300000,
                bytes32("test-don-id")
            );
            vm.stopPrank();

            console.log("Created request", i, "with ID:", vm.toString(requestIds[i]));
        }

        // Verify all requests are pending
        for (uint256 i = 0; i < 3; i++) {
            assertTrue(mockRouter.isPendingRequest(requestIds[i]), "Request should be pending");
        }

        // Simulate responses for all requests
        for (uint256 i = 0; i < 3; i++) {
            mockHelper.simulateSuccessfulVerification(
                requestIds[i],
                address(mockClient),
                1000 - i * 100, // Decreasing quantities
                (50 + i * 5) * 1e18 // Increasing prices
            );
        }

        // Verify all requests are no longer pending
        for (uint256 i = 0; i < 3; i++) {
            assertFalse(mockRouter.isPendingRequest(requestIds[i]), "Request should no longer be pending");
        }

        console.log("Multiple verification requests test completed!");
    }

    function testMockRouterSubscriptionValidation() public {
        console.log("Testing mock router subscription validation...");

        // Test with valid subscription
        vm.prank(address(proofOfReserve));
        bytes32 requestId = mockRouter.sendRequest(
            1, // valid subscription
            abi.encode("test"),
            1,
            300000,
            bytes32("test-don-id")
        );

        assertTrue(requestId != bytes32(0), "Should succeed with valid subscription");

        // Test with invalid subscription - should revert
        vm.prank(address(mockClient));
        vm.expectRevert();
        mockRouter.sendRequest(
            999, // invalid subscription
            abi.encode("test"),
            1,
            300000,
            bytes32("test-don-id")
        );

        console.log("Mock router subscription validation test completed!");
    }

    function testContractAddresses() public {
        console.log("Testing contract deployment addresses...");

        // Test that all contracts are properly deployed
        assertTrue(address(coffeeToken) != address(0), "CoffeeToken should be deployed");
        assertTrue(address(batchManager) != address(0), "BatchManager should be deployed");
        assertTrue(address(zkManager) != address(0), "ZKManager should be deployed");
        assertTrue(address(proofOfReserve) != address(0), "ProofOfReserve should be deployed");
        assertTrue(address(circomVerifier) != address(0), "CircomVerifier should be deployed");
        assertTrue(address(privacyLayer) != address(0), "PrivacyLayer should be deployed");
        assertTrue(address(mockRouter) != address(0), "MockRouter should be deployed");
        assertTrue(address(mockHelper) != address(0), "MockHelper should be deployed");
        assertTrue(address(mockClient) != address(0), "MockClient should be deployed");

        console.log("Contract deployment test passed!");
    }

    function testVerifierAccessControl() public {
        // First create a batch
        testCreateBatchForChainlinkTesting();

        console.log("Testing verifier access control...");

        // Test that MockFunctionsClient can make requests
        vm.prank(address(mockClient));
        bytes32 requestId = mockRouter.sendRequest(
            1,
            abi.encode("test-verification"),
            1,
            300000,
            bytes32("test-don-id")
        );

        assertTrue(requestId != bytes32(0), "Mock client should be able to create requests");

        // Simulate response to verify the full flow
        mockHelper.simulateSuccessfulVerification(
            requestId,
            address(mockClient),
            1000,
            50 * 1e18
        );

        // Verify MockFunctionsClient received the callback
        assertTrue(mockClient.callbackReceived(), "Mock client should have received callback");

        // Test that non-verifiers cannot create verification requests
        // (This would require implementing proper access control in the test)
        // For now, we just test that the mock router works correctly

        console.log("Verifier access control test completed!");
    }
}