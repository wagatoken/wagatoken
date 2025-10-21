// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";

/**
 * @title SetupComparisonTest
 * @dev Compare gas usage between different test setups
 */
contract SetupComparisonTest is BaseWAGATest {

    function testMinimalSetup() public view {
        console.log("=== MINIMAL SETUP TEST ===");
        console.log("Just calling super.setUp() - no extra work");
        console.log("Gas remaining after setup:", gasleft());
        assertTrue(true);
    }

    function testWorkingSetupPattern() public {
        console.log("=== WORKING SETUP PATTERN (LIKE WAGAIntegratedServicesTest) ===");
        uint256 gasBeforeBatch = gasleft();
        console.log("Gas before createTestBatch:", gasBeforeBatch);
        
        uint256 batchId = createTestBatch(processor);
        uint256 gasAfterBatch = gasleft();
        console.log("Gas after createTestBatch:", gasAfterBatch);
        console.log("Gas used for batch creation:", gasBeforeBatch - gasAfterBatch);
        
        addCompleteComplianceData(batchId);
        uint256 gasAfterCompliance = gasleft();
        console.log("Gas after compliance:", gasAfterCompliance);
        console.log("Gas used for compliance:", gasAfterBatch - gasAfterCompliance);
        
        console.log("Working pattern test completed successfully");
    }

    function testReproduceWorkflowPattern() public {
        console.log("=== REPRODUCING WORKFLOW PATTERN (LIKE WAGAEndToEndWorkflowTest) ===");
        // Do exactly what the failing test does
        uint256 workflowBatchId = createTestBatch(cooperative);
        console.log("Step 1: Batch created, ID:", workflowBatchId);
        
        addCompleteComplianceData(workflowBatchId);
        console.log("Step 2: Compliance added");
        
        verifyBatchWithZK(workflowBatchId);
        console.log("Step 3: ZK verification completed");
        
        console.log("Workflow pattern test completed successfully");
    }
}