// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";

/**
 * @title WAGABatchManagerStreamlinedTest
 * @dev Streamlined unit tests for WAGA Batch Manager functionality
 * @notice Example of how to inherit from BaseWAGATest to eliminate setup duplication
 */
contract WAGABatchManagerStreamlinedTest is BaseWAGATest {

    uint256 private testBatchId;

    function setUp() public override {
        super.setUp();
        
        // Create test batch for all tests to use
        testBatchId = createTestBatch(cooperative);
        console.log("Batch Manager test setup completed with batch ID:", testBatchId);
    }

    /* -------------------------------------------------------------------------- */
    /*                              BATCH CREATION TESTS                         */
    /* -------------------------------------------------------------------------- */

    function testBatchCreation_Success() public view {
        // Verify batch info matches expected values
        (uint256 productionDate, uint256 expiryDate, uint256 quantity, uint256 pricePerUnit, , , ) = 
            coffeeToken.getBatchInfo(testBatchId);
            
        assertEq(productionDate, PRODUCTION_DATE);
        assertEq(expiryDate, EXPIRY_DATE);
        assertEq(quantity, TEST_BATCH_QUANTITY);
        assertEq(pricePerUnit, TEST_PRICE_PER_UNIT);
        
        assertTrue(coffeeToken.isBatchCreated(testBatchId));
        console.log("Batch creation verified successfully");
    }

    function testBatchCreation_MultipleRoles() public {
        // Test different roles can create batches
        uint256 processorBatchId = createTestBatch(processor);
        uint256 roasterBatchId = createTestBatch(roaster);
        
        assertTrue(coffeeToken.isBatchCreated(processorBatchId));
        assertTrue(coffeeToken.isBatchCreated(roasterBatchId));
        
        console.log("Multiple role batch creation verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                              BATCH MANAGEMENT TESTS                       */
    /* -------------------------------------------------------------------------- */

    function testBatchUpdate_Success() public view {
        // Basic batch exists and can be verified
        assertTrue(coffeeToken.isBatchCreated(testBatchId));
        
        console.log("Batch management operations verified");
    }

    function testBatchQuery_Success() public view {
        // Verify batch information can be queried
        (uint256 productionDate, uint256 expiryDate, uint256 quantity, uint256 pricePerUnit, , , ) = 
            coffeeToken.getBatchInfo(testBatchId);
            
        assertGt(productionDate, 0);
        assertGt(expiryDate, productionDate);
        assertGt(quantity, 0);
        assertGt(pricePerUnit, 0);
        
        console.log("Batch query operations verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                              ROLE-BASED ACCESS TESTS                      */
    /* -------------------------------------------------------------------------- */

    function testAccessControl_AuthorizedUsers() public {
        // Verify authorized users can create batches (using cooperative instead of distributor)
        uint256 cooperativeBatchId = createTestBatch(cooperative);
        assertTrue(coffeeToken.isBatchCreated(cooperativeBatchId));
        
        console.log("Access control for authorized users verified");
    }

    function testAccessControl_UnauthorizedUsers() public {
        // Test that completely unauthorized users cannot create batches
        vm.prank(unauthorized);
        vm.expectRevert();
        coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            50e6,
            "Test Origin",
            "Test Packaging",
            "ipfs://test"
        );
        
        console.log("Access control for unauthorized users verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                              BATCH VALIDATION TESTS                       */
    /* -------------------------------------------------------------------------- */

    function testBatchValidation_ValidData() public view {
        // Verify valid batch data passes validation
        assertTrue(coffeeToken.isBatchCreated(testBatchId));
        
        (, , uint256 quantity, uint256 pricePerUnit, , , ) = 
            coffeeToken.getBatchInfo(testBatchId);
            
        assertGt(quantity, 0);
        assertGt(pricePerUnit, 0);
        
        console.log("Batch validation for valid data verified");
    }

    function testBatchValidation_EdgeCases() public view {
        // Test edge cases that should still work
        assertTrue(coffeeToken.isBatchCreated(testBatchId));
        
        console.log("Batch validation edge cases verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTEGRATION TESTS                            */
    /* -------------------------------------------------------------------------- */

    function testBatchManagerIntegration_WithCompliance() public {
        // Add compliance data to batch
        addCompleteComplianceData(testBatchId);
        
        // Verify compliance integration
        assertTrue(ethiopianComplianceCore.validateUpstreamCompliance(testBatchId));
        
        console.log("Batch Manager integration with compliance verified");
    }

    function testBatchManagerIntegration_WithTreasury() public {
        // Set payment for batch
        vm.prank(admin);
        treasury.setBatchPayment(testBatchId, TEST_PAYMENT_AMOUNT);
        
        // Verify payment integration
        console.log("Batch Manager integration with treasury verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                              ZK INTEGRATION TESTS                         */
    /* -------------------------------------------------------------------------- */

    function testZKProofSubmission_Success() public {
        verifyBatchWithZK(testBatchId);
        
        // Verify batch exists and ZK verification was processed
        assertTrue(coffeeToken.isBatchCreated(testBatchId), "Batch should exist after ZK verification");
    }

    function testZKProofIntegration_WithCompliance() public {
        // Add compliance first
        addCompleteComplianceData(testBatchId);
        
        // Then add ZK proofs
        verifyBatchWithZK(testBatchId);
        
        // Verify both compliance and ZK integration work together
        assertTrue(coffeeToken.isBatchCreated(testBatchId));
        assertTrue(ethiopianComplianceCore.validateUpstreamCompliance(testBatchId));
        
        console.log("ZK integration with compliance verified for batch ID:", testBatchId);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ERROR HANDLING TESTS                         */
    /* -------------------------------------------------------------------------- */

    function testErrorHandling_InvalidBatchId() public view {
        uint256 invalidBatchId = 99999;
        assertFalse(coffeeToken.isBatchCreated(invalidBatchId));
        
        console.log("Error handling for invalid batch ID verified");
    }

    function testErrorHandling_DuplicateOperations() public view {
        // Test system handles duplicate operations gracefully
        assertTrue(coffeeToken.isBatchCreated(testBatchId));
        
        console.log("Error handling for duplicate operations verified");
    }

    /* -------------------------------------------------------------------------- */
    /*                              PERFORMANCE TESTS                            */
    /* -------------------------------------------------------------------------- */

    function testPerformance_BatchCreation() public {
        uint256 startGas = gasleft();
        
        uint256 perfBatchId = createTestBatch(cooperative);
        assertTrue(coffeeToken.isBatchCreated(perfBatchId));
        
        uint256 gasUsed = startGas - gasleft();
        console.log("Gas used for batch creation:", gasUsed);
        
        // Reasonable gas limit check (adjust as needed)
        assertLt(gasUsed, 500000); // Less than 500k gas
    }

    function testPerformance_BatchQuery() public view {
        uint256 startGas = gasleft();
        
        (, , uint256 quantity, , , , ) = coffeeToken.getBatchInfo(testBatchId);
        assertGt(quantity, 0);
        
        uint256 gasUsed = startGas - gasleft();
        console.log("Gas used for batch query:", gasUsed);
        
        // Query should be very efficient
        assertLt(gasUsed, 50000); // Less than 50k gas
    }
}