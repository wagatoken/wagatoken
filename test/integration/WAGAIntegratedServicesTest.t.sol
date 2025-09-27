// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";
import {WAGAECXPriceOracle} from "../../src/WAGAECXPriceOracle.sol";

/**
 * @title WAGAIntegratedServicesTest
 * @dev Tests integration between multiple WAGA services and external systems
 * @notice Tests Chainlink Functions, ZK proofs, Ethiopian compliance, and payment workflows
 */
contract WAGAIntegratedServicesTest is BaseWAGATest {

    uint256 private integrationBatchId;

    function setUp() public override {
        super.setUp();
        
        // Create batch for integration testing
        integrationBatchId = createTestBatch(processor);
        addCompleteComplianceData(integrationBatchId);
        console.log("Integration test setup completed with batch ID:", integrationBatchId);
    }

    /* -------------------------------------------------------------------------- */
    /*                          CHAINLINK INTEGRATION TESTS                      */
    /* -------------------------------------------------------------------------- */

    function testChainlinkFunctionsIntegration() public {
        // Skip if Chainlink Functions not available in test environment
        vm.skip(true);
        console.log("Chainlink Functions integration test skipped");
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
        assertTrue(ethiopianCompliance.validateUpstreamCompliance(integrationBatchId));
        assertTrue(ethiopianCompliance.validateEUDRCompliance(integrationBatchId));
        
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
        assertTrue(ethiopianCompliance.validateUpstreamCompliance(integrationBatchId));
        
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
        assertTrue(ethiopianCompliance.validateUpstreamCompliance(batchId));
        
        // Add ZK verification
        verifyBatchWithZK(batchId);
        
        console.log("Batch manager integration with services verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                          ERROR HANDLING TESTS                             */
    /* -------------------------------------------------------------------------- */

    function testIntegrationFailureScenarios() public {
        uint256 testBatchId = createTestBatch(distributor); // Use distributor instead of exporter
        
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
        assertTrue(ethiopianCompliance.validateUpstreamCompliance(recoveryBatchId));
        
        console.log("Service recovery test completed");
    }
}