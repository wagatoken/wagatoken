// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployWagaToken} from "../../script/DeployWagaToken.s.sol";
import {WAGACoffeeToken} from "../../src/WAGACoffeeToken.sol";
import {WAGAInventoryManager} from "../../src/WAGAInventoryManager2.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {MockFunctionsRouter} from "../mocks/MockFunctionsRouter.sol";
import {MockFunctionsHelper} from "../mocks/MockFunctionsHelper.sol";

/**
 * @title WAGAIntegrationTest
 * @dev Integration test for WAGA contracts with MockFunctionsRouter
 */
contract WAGAIntegrationTest is Test {
    // Contract instances
    HelperConfig public helperConfig;
    WAGACoffeeToken public coffeeToken;
    WAGAInventoryManager public inventoryManager;
    WAGACoffeeRedemption public redemptionContract;
    WAGAProofOfReserve public proofOfReserve;
    MockFunctionsRouter public mockRouter;
    MockFunctionsHelper public mockHelper;

    // Test addresses - use roles that actually exist
    address public constant ADMIN_USER = address(0x1);
    address public constant VERIFIER_USER = address(0x2);

    function setUp() public {
        // Deploy all contracts via the standard deployment script
        DeployWagaToken deployer = new DeployWagaToken();
        (
            coffeeToken,
            inventoryManager,
            redemptionContract,
            proofOfReserve,
            helperConfig
        ) = deployer.run();

        // Get network config from the HelperConfig that was actually used during deployment
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        
        // Use the MockRouter that was actually created during deployment
        mockRouter = MockFunctionsRouter(config.router);
        mockHelper = new MockFunctionsHelper(address(mockRouter));

        // Set up roles correctly
        // The deployer (vm.addr(config.deployerKey)) has DEFAULT_ADMIN_ROLE and ADMIN_ROLE
        address deployer_address = vm.addr(config.deployerKey);
        
        // Grant roles using the deployer address which has DEFAULT_ADMIN_ROLE
        vm.startPrank(deployer_address);
        
        // Grant ADMIN_ROLE to ADMIN_USER
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), ADMIN_USER);
        console.log("Granted ADMIN_ROLE to ADMIN_USER");
        
        // Grant VERIFIER_ROLE to VERIFIER_USER  
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), VERIFIER_USER);
        console.log("Granted VERIFIER_ROLE to VERIFIER_USER");
        
        vm.stopPrank();

        // Verify roles were granted correctly
        assertTrue(coffeeToken.hasRole(coffeeToken.ADMIN_ROLE(), ADMIN_USER), "ADMIN_USER should have ADMIN_ROLE");
        assertTrue(coffeeToken.hasRole(coffeeToken.VERIFIER_ROLE(), VERIFIER_USER), "VERIFIER_USER should have VERIFIER_ROLE");

        console.log("Integration test setup completed");
        console.log("CoffeeToken:", address(coffeeToken));
        console.log("InventoryManager:", address(inventoryManager));
        console.log("RedemptionContract:", address(redemptionContract));
        console.log("ProofOfReserve:", address(proofOfReserve));
        console.log("MockRouter:", address(mockRouter));
    }

    function testCreateBatchAndRequestVerification() public {
        console.log("Starting batch creation and verification test...");

        // Get the admin address (use known admin addresses)
        address admin = 0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38; // Default anvil account
        console.log("Using admin address:", admin);

        // Step 1: Create a batch as admin (only ADMIN_ROLE can create batches)
        vm.startPrank(ADMIN_USER);
        
        uint256 batchId = coffeeToken.createBatch(
            "QmTestHash123", // ipfsUri
            block.timestamp + 1 days, // productionDate (future date as required by contract validation)
            block.timestamp + 365 days, // expiryDate
            1000, // quantity
            50 * 1e18, // pricePerUnit
            "250g", // packagingInfo - must be "250g" or "500g"
            "metadataHash123" // metadataHash
        );
        
        console.log("Created batch ID:", batchId);
        
        vm.stopPrank();

        // Step 2: Request verification through ProofOfReserve (VERIFIER_ROLE)
        vm.startPrank(VERIFIER_USER);
        
        string memory jsSource = "return { verified: true, quantity: 1000, price: 50000000000000000000 };";
        
        bytes32 requestId = proofOfReserve.requestReserveVerification(
            batchId,
            VERIFIER_USER, // recipient
            jsSource // Chainlink Functions JavaScript source
        );
        
        console.log("Verification request ID:", vm.toString(requestId));
        vm.stopPrank();

        // Step 3: Simulate successful Chainlink Functions response
        console.log("Simulating successful Chainlink response...");
        
        mockHelper.simulateSuccessfulVerification(
            requestId,
            address(proofOfReserve),
            1000, // verified quantity
            50 * 1e18 // verified price
        );

        // Step 4: Verify the results
        console.log("Checking verification results...");
        
        // Check that batch is now verified
        (, , bool isVerified, , , , , , ) = coffeeToken.s_batchInfo(batchId);
        assertTrue(isVerified, "Batch should be verified after successful verification");
        
        // Check that tokens were minted to the recipient
        uint256 balance = coffeeToken.balanceOf(VERIFIER_USER, batchId);
        assertEq(balance, 1000, "Recipient should have received 1000 tokens");
        
        console.log("Batch verification test completed successfully!");
        console.log("Recipient balance:", balance);
    }

    function testVerificationFailureHandling() public {
        console.log("Starting failed verification test...");

        // Step 1: Create a batch as ADMIN_USER
        vm.startPrank(ADMIN_USER);
        
        uint256 batchId = coffeeToken.createBatch(
            "QmTestFailHash", // ipfsUri
            block.timestamp + 1 days, // productionDate (future date)
            block.timestamp + 365 days, // expiryDate
            500, // quantity
            50 * 1e18, // pricePerUnit
            "500g", // packagingInfo - using different valid size for this test
            "metadataHashFail" // metadataHash
        );
        
        vm.stopPrank();

        // Step 2: Request verification as VERIFIER_USER
        vm.startPrank(VERIFIER_USER);
        
        string memory jsSource = "return { verified: false, quantity: 0, price: 0 };";
        
        bytes32 requestId = proofOfReserve.requestReserveVerification(
            batchId,
            VERIFIER_USER,
            jsSource
        );
        
        vm.stopPrank();

        // Step 3: Simulate failed verification response
        console.log("Simulating failed Chainlink response...");
        
        // For true failed verification, we simulate that the API couldn't find the batch
        // or found mismatched metadata, which should cause an error response
        mockHelper.simulateApiError(requestId, address(proofOfReserve), "Batch not found in database");

        // Step 4: Verify the results
        console.log("Checking failed verification results...");
        
        // Check that no tokens were minted (request should fail)
        uint256 balance = coffeeToken.balanceOf(VERIFIER_USER, batchId);
        assertEq(balance, 0, "No tokens should be minted for failed verification");
        
        // Check the batch verification status - should remain as initially created
        (, , bool isVerified, , , , , bool isMetadataVerified, ) = coffeeToken.s_batchInfo(batchId);
        assertFalse(isVerified, "Batch should remain unverified after failed verification");
        assertFalse(isMetadataVerified, "Batch metadata should remain unverified after failed verification");
        
        console.log("Failed verification test completed successfully!");
        console.log("Batch verification status:", isVerified);
        console.log("Recipient balance after failed verification:", balance);
    }

    function testMockRouterBasicFunctionality() public {
        console.log("Testing MockRouter basic functionality...");
        
        // Test that MockRouter is properly deployed and functional
        assertTrue(address(mockRouter) != address(0), "MockRouter should be deployed");
        assertTrue(mockRouter.isValidSubscription(1), "Subscription 1 should be valid");
        
        // Test sending a request
        vm.prank(VERIFIER_USER);
        bytes32 requestId = mockRouter.sendRequest(
            1, // subscriptionId
            abi.encode("test data"),
            1, // dataVersion
            300000, // callbackGasLimit
            bytes32(0) // donId
        );
        
        assertTrue(mockRouter.isPendingRequest(requestId), "Request should be pending");
        
        console.log("MockRouter basic functionality test passed!");
    }
}
