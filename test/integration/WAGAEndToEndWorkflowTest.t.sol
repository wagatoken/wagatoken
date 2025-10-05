// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGAEndToEndWorkflowTest
 * @dev Comprehensive end-to-end integration tests for complete WAGA workflows
 * @notice Tests complete business workflows from batch creation to final redemption
 */
contract WAGAEndToEndWorkflowTest is BaseWAGATest {

    uint256 private workflowBatchId;

    function setUp() public override {
        super.setUp();
        console.log("End-to-end workflow test setup completed");
    }

    /* -------------------------------------------------------------------------- */
    /*                              COMPLETE WORKFLOW TESTS                     */
    /* -------------------------------------------------------------------------- */

    function testCompleteWorkflow_CooperativeToBuyer() public {
        // 1. Cooperative creates batch
        workflowBatchId = createTestBatch(cooperative);
        console.log("Step 1: Batch created by cooperative, ID:", workflowBatchId);
        
        // 2. Add complete compliance data
        addCompleteComplianceData(workflowBatchId);
        console.log("Step 2: Compliance data added");
        
        // 3. Submit ZK proofs
        verifyBatchWithZK(workflowBatchId);
        console.log("Step 3: ZK proofs submitted");
        
        // 4. Set up payment requirements
        vm.prank(admin);
        treasury.setBatchPayment(workflowBatchId, TEST_PAYMENT_AMOUNT);
        console.log("Step 4: Payment requirements set");
        
        // 5. Buyer pays for batch
        vm.prank(buyer);
        treasury.payForBatch(workflowBatchId, TEST_PAYMENT_AMOUNT);
        console.log("Step 5: Buyer payment completed");
        
        // 6. Execute offramp to cooperative
        uint256 initialCooperativeBalance = usdc.balanceOf(cooperative);
        vm.prank(offrampExecutor);
        treasury.transferToOfframpPartner(workflowBatchId, buyer, cooperative, TEST_PAYMENT_AMOUNT);
        console.log("Step 6: Offramp transfer to cooperative completed");
        
        // 7. Verify final state
        assertTrue(coffeeToken.isBatchCreated(workflowBatchId));
        assertTrue(ethiopianComplianceCore.validateUpstreamCompliance(workflowBatchId));
        assertTrue(ethiopianComplianceCore.validateEUDRCompliance(workflowBatchId));
        assertTrue(treasury.checkPaymentStatus(buyer, workflowBatchId));
        assertUSDCBalance(cooperative, initialCooperativeBalance + TEST_PAYMENT_AMOUNT);
        
        console.log("Complete workflow verified successfully");
    }

    function testCompleteWorkflow_ProcessorToRoaster() public {
        // 1. Processor creates batch
        workflowBatchId = createTestBatch(processor);
        
        // 2. Add compliance and verification data
        addCompleteComplianceData(workflowBatchId);
        verifyBatchWithZK(workflowBatchId);
        
        // 3. Set payment and complete transaction
        vm.prank(admin);
        treasury.setBatchPayment(workflowBatchId, TEST_PAYMENT_AMOUNT);
        
        vm.prank(roaster); // Roaster buys from processor
        treasury.payForBatch(workflowBatchId, TEST_PAYMENT_AMOUNT);
        
        // 4. Transfer payment to processor
        uint256 initialProcessorBalance = usdc.balanceOf(processor);
        vm.prank(offrampExecutor);
        treasury.transferToOfframpPartner(workflowBatchId, roaster, processor, TEST_PAYMENT_AMOUNT);
        
        // Verify workflow completion
        assertTrue(treasury.checkPaymentStatus(roaster, workflowBatchId));
        assertUSDCBalance(processor, initialProcessorBalance + TEST_PAYMENT_AMOUNT);
        
        console.log("Processor to roaster workflow completed");
    }

    function testSimpleWorkflow() public {
        workflowBatchId = createTestBatch(cooperative);
        addCompleteComplianceData(workflowBatchId);
        verifyBatchWithZK(workflowBatchId);
        
        vm.prank(admin);
        treasury.setBatchPayment(workflowBatchId, TEST_PAYMENT_AMOUNT);
        
        vm.prank(buyer);
        treasury.payForBatch(workflowBatchId, TEST_PAYMENT_AMOUNT);
        
        console.log("Simple workflow completed successfully");
    }
}