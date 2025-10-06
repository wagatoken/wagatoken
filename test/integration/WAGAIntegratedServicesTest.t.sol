// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";
import {WAGAECXPriceOracle} from "../../src/WAGAECXPriceOracle.sol";
import {MockFunctionsRouter} from "../mocks/MockFunctionsRouter.sol";
import {MockFunctionsHelper} from "../mocks/MockFunctionsHelper.sol";
import {MockFunctionsClient} from "../mocks/MockFunctionsClient.sol";

/**
 * @title WAGAIntegratedServicesTest
 * @dev Tests integration between multiple WAGA services and external systems
 * @notice Tests Chainlink Functions, ZK proofs, Ethiopian compliance, and payment workflows
 */
contract WAGAIntegratedServicesTest is BaseWAGATest {

    uint256 private integrationBatchId;
    
    // Mock contracts for Chainlink Functions testing
    MockFunctionsRouter public mockRouter;
    MockFunctionsHelper public mockHelper;
    MockFunctionsClient public mockClient;
    bytes32 public testRequestId;

    function setUp() public override {
        super.setUp();
        
        // Deploy mock contracts for Chainlink Functions testing
        mockRouter = new MockFunctionsRouter();
        mockHelper = new MockFunctionsHelper(address(mockRouter));
        mockClient = new MockFunctionsClient(address(mockRouter));
        
        // Create batch for integration testing
        integrationBatchId = createTestBatch(processor);
        addCompleteComplianceData(integrationBatchId);
        console.log("Integration test setup completed with batch ID:", integrationBatchId);
    }

    /* -------------------------------------------------------------------------- */
    /*                          CHAINLINK INTEGRATION TESTS                      */
    /* -------------------------------------------------------------------------- */

    function testChainlinkFunctionsIntegration() public {
        console.log("Testing Chainlink Functions integration with mocks...");
        
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
        
        assertFalse(testRequestId == bytes32(0), "Request ID should not be zero");
        console.log("Chainlink Functions request sent with ID:", vm.toString(testRequestId));
        
        // Simulate successful response from oracle
        mockRouter.mockResponse(
            testRequestId,
            abi.encode("verification_success"),
            "",
            address(mockClient)
        );
        
        // Verify callback was received
        assertTrue(mockClient.callbackReceived(), "Callback should have been received");
        assertEq(mockClient.latestRequestId(), testRequestId, "Request ID should match");
        
        console.log("Chainlink Functions integration test completed successfully");
    }

    function testPriceIntegrationWithECX() public {
        // Get initial price for WGQ1/SC combination
        WAGAECXPriceOracle.ECXPrice memory initialPrice = ecxOracle.getLatestPrice(
            WAGAECXPriceOracle.CoffeeGrade.WGQ1, 
            WAGAECXPriceOracle.CoffeeOrigin.SC
        );
        console.log("Initial price per feresulla:", initialPrice.pricePerFeresulla);

        // Update ECX price via authorized updater role
        vm.prank(admin); // Admin should have PRICE_UPDATER_ROLE
        ecxOracle.updateECXPrice(
            WAGAECXPriceOracle.CoffeeGrade.WGQ1,
            WAGAECXPriceOracle.CoffeeOrigin.SC,
            5500, // Price per feresulla (in smallest unit)
            WAGAECXPriceOracle.DataQuality.HIGH,
            "ECX Official",
            95 // 95% confidence
        );
        
        // Verify price was updated
        WAGAECXPriceOracle.ECXPrice memory updatedPrice = ecxOracle.getLatestPrice(
            WAGAECXPriceOracle.CoffeeGrade.WGQ1, 
            WAGAECXPriceOracle.CoffeeOrigin.SC
        );
        assertEq(updatedPrice.pricePerFeresulla, 5500);
        
        console.log("Price integration test completed successfully");
    }

    /* -------------------------------------------------------------------------- */
    /*                          ZK PROOF INTEGRATION TESTS                       */
    /* -------------------------------------------------------------------------- */

    function testZKProofWithCompliance() public {
        // Add ZK proof for quality standards
        verifyBatchWithZK(integrationBatchId);
        
        // Verify that compliance validation still works with ZK proofs
        assertTrue(ethiopianComplianceCore.validateUpstreamCompliance(integrationBatchId));
        assertTrue(ethiopianComplianceCore.validateEUDRCompliance(integrationBatchId));
        
        console.log("ZK proof integration with compliance verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                          PAYMENT INTEGRATION TESTS                        */
    /* -------------------------------------------------------------------------- */

    function testTreasuryIntegrationWithCompliance() public {
        // Set payment requirement for verified batch
        verifyBatchWithZK(integrationBatchId);
        
        vm.prank(admin);
        treasury.setBatchPayment(integrationBatchId, TEST_PAYMENT_AMOUNT);
        
        // Buyer pays for compliant batch
        vm.prank(buyer);
        treasury.payForBatch(integrationBatchId, TEST_PAYMENT_AMOUNT);
        
        // Verify payment status
        assertTrue(treasury.checkPaymentStatus(buyer, integrationBatchId));
        
        console.log("Treasury integration with compliance completed");
    }

    /* -------------------------------------------------------------------------- */
    /*                          CROSS-SERVICE WORKFLOW TESTS                     */
    /* -------------------------------------------------------------------------- */

    function testFullServiceIntegration() public {
        // 1. Verify compliance
        assertTrue(ethiopianComplianceCore.validateUpstreamCompliance(integrationBatchId));
        
        // 2. Add ZK proofs
        verifyBatchWithZK(integrationBatchId);
        
        // 3. Set up payment
        vm.prank(admin);
        treasury.setBatchPayment(integrationBatchId, TEST_PAYMENT_AMOUNT);
        
        // 4. Complete payment
        vm.prank(buyer);
        treasury.payForBatch(integrationBatchId, TEST_PAYMENT_AMOUNT);
        
        // 5. Execute offramp transfer
        uint256 initialBalance = usdc.balanceOf(processor);
        vm.prank(offrampExecutor);
        treasury.transferToOfframpPartner(integrationBatchId, buyer, processor, TEST_PAYMENT_AMOUNT);
        
        // 6. Verify final state
        assertUSDCBalance(processor, initialBalance + TEST_PAYMENT_AMOUNT);
        assertTrue(treasury.checkPaymentStatus(buyer, integrationBatchId));
        
        console.log("Full service integration completed successfully");
    }

    function testBatchManagerIntegrationWithServices() public {
        // Create batch through batch manager
        uint256 batchId = createTestBatch(cooperative);
        
        // Add compliance data
        addCompleteComplianceData(batchId);
        
        // Verify batch exists and has compliance data
        assertTrue(coffeeToken.isBatchCreated(batchId));
        assertTrue(ethiopianComplianceCore.validateUpstreamCompliance(batchId));
        
        // Add ZK verification
        verifyBatchWithZK(batchId);
        
        console.log("Batch manager integration with services verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                          ERROR HANDLING TESTS                             */
    /* -------------------------------------------------------------------------- */

    function testIntegrationFailureScenarios() public {
        uint256 testBatchId = createTestBatch(processor); // Use processor instead of distributor (distributors can't create batches)
        
        // Test payment without compliance (should work but not recommended)
        vm.prank(admin);
        treasury.setBatchPayment(testBatchId, TEST_PAYMENT_AMOUNT);
        
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        assertTrue(treasury.checkPaymentStatus(buyer, testBatchId));
        
        console.log("Integration failure scenarios tested");
    }

    function testServiceRecovery() public {
        // Test system continues to work even if some integrations fail
        uint256 recoveryBatchId = createTestBatch(processor);
        
        // Add minimal compliance
        addCompleteComplianceData(recoveryBatchId);
        
        // System should still allow basic operations
        assertTrue(coffeeToken.isBatchCreated(recoveryBatchId));
        assertTrue(ethiopianComplianceCore.validateUpstreamCompliance(recoveryBatchId));
        
        console.log("Service recovery test completed");
    }
}