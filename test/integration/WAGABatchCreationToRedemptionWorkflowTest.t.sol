// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";
import {TestHelperUtilities} from "../TestHelperUtilities.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";

/**
 * @title WAGABatchCreationToRedemptionWorkflowTest
 * @dev Comprehensive test for the complete batch creation to redemption workflow
 * @notice Tests the vendor-managed inventory model from batch creation through to physical delivery
 * 
 * Workflow tested:
 * 1. Processor creates a batch with compliance data
 * 2. Distributor requests tokens from the batch
 * 3. Chainlink Functions verifies the batch
 * 4. Tokens are minted to the distributor upon successful verification
 * 5. Distributor pays and redeems tokens for physical delivery
 */
contract WAGABatchCreationToRedemptionWorkflowTest is BaseWAGATest {
    
    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */
    
    uint256 private testBatchId;
    uint256 private testRequestIndex;
    bytes32 private testRequestId;
    uint256 private testRedemptionId;
    
    uint256 private constant BATCH_QUANTITY = 1000;
    uint256 private constant REQUESTED_QUANTITY = 100;
    uint256 private constant REDEMPTION_QUANTITY = 50;
    uint256 private constant PRICE_PER_UNIT = 25 * 1e18; // 25 ETH per unit
    
    /* -------------------------------------------------------------------------- */
    /*                                    Setup                                   */
    /* -------------------------------------------------------------------------- */
    
    function setUp() public override {
        super.setUp();
        
        // Ensure all roles are properly set up
        vm.startPrank(admin);
        
        // Grant necessary roles for the workflow
        configManager.grantProcessorRole(processor);
        configManager.grantDistributorRole(distributor);
        configManager.grantVerifierRole(verifier);
        configManager.grantMinterRole(address(proofOfReserve));
        configManager.grantFulfillerRole(fulfiller);
        
        // Register banking partner for fiat transfer confirmation
        IEthiopianCompliance.BankingCapabilities memory capabilities = IEthiopianCompliance.BankingCapabilities({
            swiftCode: "CBETETAA123",
            bankName: "Commercial Bank of Ethiopia",
            canActAsOfframp: true,
            canHandleForexSurrender: true,
            partnerType: IEthiopianCompliance.OfframpPartnerType.DIRECT_BANK,
            connectedBankSwift: "CBETETAA123",
            maxTransactionAmount: 1000000 * 1e6, // 1M USDC
            isActive: true
        });
        
        bankingCore.registerBankingPartner(
            "CBETETAA123",
            bankingPartner,
            "Commercial Bank of Ethiopia",
            capabilities
        );
        
        vm.stopPrank();
        
        // Fund distributor with USDC for payments
        deal(address(usdc), distributor, 10000 * 1e6); // 10,000 USDC
        
        console.log("=== Workflow Test Setup Complete ===");
        console.log("Processor address:", processor);
        console.log("Distributor address:", distributor);
        console.log("Verifier address:", verifier);
        console.log("Fulfiller address:", fulfiller);
        console.log("USDC balance for distributor:", usdc.balanceOf(distributor));
    }
    
    /* -------------------------------------------------------------------------- */
    /*                            Complete Workflow Test                          */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Tests the complete workflow from batch creation to redemption
     */
    function testCompleteWorkflow() public {
        console.log("\n=== Testing Complete Batch Creation to Redemption Workflow ===");
        
        // Step 1: Processor creates a batch
        _testStep1_ProcessorCreatesBatch();
        
        // Step 2: Add compliance data to the batch
        _testStep2_AddComplianceData();
        
        // Step 3: Distributor requests tokens from the batch
        _testStep3_DistributorRequestsTokens();
        
        // Step 4: Verification and minting process via Chainlink Functions
        _testStep4_VerificationAndMinting();
        
        // Step 5: Distributor pays for the tokens
        _testStep5_DistributorPaysForTokens();
        
        // Step 6: Distributor redeems tokens for physical delivery
        _testStep6_DistributorRedeemsTokens();
        
        // Step 7: Fulfiller completes the physical delivery
        _testStep7_FulfillerCompletesDelivery();
        
        console.log("\n[SUCCESS] Complete workflow test passed successfully!");
    }
    
    /* -------------------------------------------------------------------------- */
    /*                               Workflow Steps                               */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Step 1: Processor creates a coffee batch
     */
    function _testStep1_ProcessorCreatesBatch() internal {
        console.log("\n--- Step 1: Processor Creates Batch ---");
        
        vm.startPrank(processor);
        
        testBatchId = coffeeToken.createBatch(
            block.timestamp, // productionDate
            block.timestamp + 365 days, // expiryDate
            BATCH_QUANTITY,
            PRICE_PER_UNIT,
            "Yirgacheffe, Ethiopia", // origin
            "60kg", // packagingInfo
            "ipfs://QmTest123" // metadataURI
        );
        
        vm.stopPrank();
        
        // Verify batch creation
        assertTrue(coffeeToken.isBatchCreated(testBatchId), "Batch should be created");
        
        // Check batch details
        (
            ,
            ,
            uint256 quantity,
            uint256 pricePerUnit,
            ,
            ,
        ) = coffeeToken.getBatchInfo(testBatchId);
        
        assertEq(quantity, BATCH_QUANTITY, "Batch quantity should match");
        assertEq(pricePerUnit, PRICE_PER_UNIT, "Price per unit should match");
        
        console.log("[OK] Batch created successfully with ID:", testBatchId);
        console.log("[OK] Batch quantity:", quantity);
        console.log("[OK] Price per unit:", pricePerUnit / 1e18, "ETH");
    }
    
    /**
     * @dev Step 2: Add compliance data to the batch
     */
    function _testStep2_AddComplianceData() internal {
        console.log("\n--- Step 2: Add Compliance Data ---");
        
        // Add Ethiopian compliance data
        addCompleteComplianceData(testBatchId);
        
        // Add ZK proof for quality verification
        verifyBatchWithZK(testBatchId);
        
        console.log("[OK] Compliance data added to batch");
        console.log("[OK] ZK proof added for quality verification");
    }
    
    /**
     * @dev Step 3: Distributor requests tokens from the batch
     */
    function _testStep3_DistributorRequestsTokens() internal {
        console.log("\n--- Step 3: Distributor Requests Tokens ---");
        
        vm.startPrank(distributor);
        
        testRequestIndex = coffeeToken.createBatchRequest(
            testBatchId,
            REQUESTED_QUANTITY,
            "Request for distributor inventory - Ethiopian premium coffee"
        );
        
        vm.stopPrank();
        
        // Verify request creation
        (
            uint256 requestBatchId,
            address requester,
            uint256 requestedQuantity,
            ,
            ,
            bool isFulfilled,
            ,
        ) = coffeeToken.getBatchRequest(testBatchId, testRequestIndex);
        
        assertEq(requestBatchId, testBatchId, "Request batch ID should match");
        assertEq(requester, distributor, "Requester should be distributor");
        assertEq(requestedQuantity, REQUESTED_QUANTITY, "Requested quantity should match");
        assertFalse(isFulfilled, "Request should not be fulfilled yet");
        
        console.log("[OK] Batch request created with index:", testRequestIndex);
        console.log("[OK] Requested quantity:", requestedQuantity);
        console.log("[OK] Requester:", requester);
    }
    
    /**
     * @dev Step 4: Verification and minting via Chainlink Functions
     */
    function _testStep4_VerificationAndMinting() internal {
        console.log("\n--- Step 4: Verification and Minting ---");
        
        // Create verification request via Proof of Reserve
        vm.startPrank(verifier);
        
        testRequestId = proofOfReserve.requestReserveVerification(
            testBatchId,
            testRequestIndex,
            "https://api.waga.coffee/verify-batch"
        );
        
        vm.stopPrank();
        
        // Verify request creation by checking individual fields
        (
            uint256 requestBatchId,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            address recipient,
            bool completed,
            ,
            ,
        ) = proofOfReserve.verificationRequests(testRequestId);
        
        assertEq(requestBatchId, testBatchId, "Verification batch ID should match");
        assertEq(recipient, distributor, "Recipient should be distributor");
        assertFalse(completed, "Request should not be completed yet");
        
        console.log("[OK] Verification request created with ID:", vm.toString(testRequestId));
        console.log("[OK] Request recipient:", recipient);
        
        // For testing purposes, we'll simulate successful verification by directly minting tokens
        // In production, this would happen through Chainlink Functions callback
        vm.startPrank(address(proofOfReserve)); // Proof of Reserve contract mints tokens
        coffeeToken.mintBatch(distributor, testBatchId, REQUESTED_QUANTITY);
        vm.stopPrank();
        
        // Mark batch as verified (required for redemption)
        vm.startPrank(verifier);
        batchMetadataManager.markBatchAsVerified(testBatchId);
        batchMetadataManager.verifyBatchMetadata(testBatchId, "60kg bags", "ipfs://QmVerified123");
        vm.stopPrank();
        
        // Verify tokens were minted to distributor
        uint256 distributorBalance = coffeeToken.balanceOf(distributor, testBatchId);
        assertEq(distributorBalance, REQUESTED_QUANTITY, "Distributor should have tokens");
        
        console.log("[OK] Chainlink Functions verification simulated");
        console.log("[OK] Tokens minted to distributor:", distributorBalance);
    }
    
    /**
     * @dev Step 5: Distributor pays for the tokens
     */
    function _testStep5_DistributorPaysForTokens() internal {
        console.log("\n--- Step 5: Distributor Pays for Tokens ---");
        
        // Calculate payment amount (assuming USDC payment)
        uint256 paymentAmount = (REQUESTED_QUANTITY * PRICE_PER_UNIT) / 1e12; // Convert to USDC (6 decimals)
        
        // First, admin needs to set the batch payment requirement
        vm.startPrank(admin);
        treasury.setBatchPayment(testBatchId, paymentAmount);
        vm.stopPrank();
        
        vm.startPrank(distributor);
        
        // Approve treasury to spend USDC
        usdc.approve(address(treasury), paymentAmount);
        
        // Make payment to treasury
        treasury.payForBatch(testBatchId, paymentAmount);
        
        vm.stopPrank();
        
        // Verify payment was processed
        uint256 treasuryBalance = usdc.balanceOf(address(treasury));
        assertTrue(treasuryBalance >= paymentAmount, "Treasury should have received payment");
        
        console.log("[OK] Payment processed successfully");
        console.log("[OK] Payment amount:", paymentAmount / 1e6, "USDC");
        console.log("[OK] Treasury balance:", treasuryBalance / 1e6, "USDC");
    }
    
    /**
     * @dev Step 6: Distributor redeems tokens for physical delivery
     */
    function _testStep6_DistributorRedeemsTokens() internal {
        console.log("\n--- Step 6: Distributor Redeems Tokens ---");
        
        vm.startPrank(distributor);
        
        // Approve redemption contract to spend tokens
        coffeeToken.setApprovalForAll(address(redemption), true);
        
        // Request redemption for physical delivery
        testRedemptionId = redemption.requestRedemption(
            testBatchId,
            REDEMPTION_QUANTITY,
            "Bank: Commercial Bank of Ethiopia, Account: 1234567890, SWIFT: CBETETAA" // buyerBankDetails
        );
        
        vm.stopPrank();
        
        // Verify redemption request
        WAGACoffeeRedemption.RedemptionRequest memory redemptionRequest = redemption.getRedemptionDetails(testRedemptionId);
        
        assertEq(redemptionRequest.consumer, distributor, "Consumer should be distributor");
        assertEq(redemptionRequest.batchId, testBatchId, "Redemption batch ID should match");
        assertEq(redemptionRequest.quantity, REDEMPTION_QUANTITY, "Redemption quantity should match");
        assertTrue(redemptionRequest.status == WAGACoffeeRedemption.RedemptionStatus.Requested, "Status should be REQUESTED");
        
        // Verify tokens were transferred to redemption contract
        uint256 distributorBalance = coffeeToken.balanceOf(distributor, testBatchId);
        uint256 redemptionBalance = coffeeToken.balanceOf(address(redemption), testBatchId);
        
        assertEq(distributorBalance, REQUESTED_QUANTITY - REDEMPTION_QUANTITY, "Distributor balance should be reduced");
        assertEq(redemptionBalance, REDEMPTION_QUANTITY, "Redemption contract should hold tokens");
        
        console.log("[OK] Redemption request created with ID:", testRedemptionId);
        console.log("[OK] Redemption quantity:", redemptionRequest.quantity);
        console.log("[OK] Remaining distributor balance:", distributorBalance);
        console.log("[OK] Redemption contract balance:", redemptionBalance);
    }
    
    /**
     * @dev Step 7: Fulfiller completes the physical delivery
     */
    function _testStep7_FulfillerCompletesDelivery() internal {
        console.log("\n--- Step 7: Fulfiller Completes Delivery ---");
        
        vm.startPrank(fulfiller);
        
        // Update redemption status to processing
        redemption.updateRedemptionStatus(
            testRedemptionId,
            WAGACoffeeRedemption.RedemptionStatus.Processing
        );
        
        // Skip time to simulate processing period
        vm.warp(block.timestamp + 1 days);
        
        // Banking partner confirms fiat transfer completion (required for fulfillment)
        vm.startPrank(bankingPartner);
        redemption.confirmFiatTransfer(testRedemptionId, "TXN-ETH-2025-001");
        vm.stopPrank();
        
        vm.startPrank(fulfiller);
        
        // Complete the redemption (physical delivery)
        redemption.updateRedemptionStatus(
            testRedemptionId,
            WAGACoffeeRedemption.RedemptionStatus.Fulfilled
        );
        
        vm.stopPrank();
        
        // Verify redemption completion
        WAGACoffeeRedemption.RedemptionRequest memory finalRedemptionRequest = redemption.getRedemptionDetails(testRedemptionId);
        
        assertTrue(finalRedemptionRequest.status == WAGACoffeeRedemption.RedemptionStatus.Fulfilled, "Status should be FULFILLED");
        assertTrue(finalRedemptionRequest.fulfillmentDate > 0, "Fulfillment date should be set");
        
        // Verify tokens were burned (removed from redemption contract)
        uint256 redemptionBalance = coffeeToken.balanceOf(address(redemption), testBatchId);
        assertEq(redemptionBalance, 0, "Tokens should be burned after fulfillment");
        
        console.log("[OK] Physical delivery completed");
        console.log("[OK] Redemption status:", finalRedemptionRequest.status == WAGACoffeeRedemption.RedemptionStatus.Fulfilled ? "FULFILLED" : "NOT_FULFILLED");
        console.log("[OK] Fulfillment date:", finalRedemptionRequest.fulfillmentDate);
        console.log("[OK] Tokens burned from redemption contract");
    }
    
    /* -------------------------------------------------------------------------- */
    /*                           Additional Workflow Tests                        */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Tests partial redemption workflow
     */
    function testPartialRedemptionWorkflow() public {
        console.log("\n=== Testing Partial Redemption Workflow ===");
        
        // Run workflow up to step 4 (tokens minted)
        _testStep1_ProcessorCreatesBatch();
        _testStep2_AddComplianceData();
        _testStep3_DistributorRequestsTokens();
        _testStep4_VerificationAndMinting();
        _testStep5_DistributorPaysForTokens();
        
        // Test multiple partial redemptions
        uint256 firstRedemption = 20;
        uint256 secondRedemption = 30;
        
        console.log("\n--- Testing Multiple Partial Redemptions ---");
        
        vm.startPrank(distributor);
        coffeeToken.setApprovalForAll(address(redemption), true);
        
        // First partial redemption
        uint256 redemptionId1 = redemption.requestRedemption(
            testBatchId,
            firstRedemption,
            "Bank details for first redemption"
        );
        
        // Second partial redemption
        uint256 redemptionId2 = redemption.requestRedemption(
            testBatchId,
            secondRedemption,
            "Bank details for second redemption"
        );
        
        vm.stopPrank();
        
        // Verify distributor has remaining tokens
        uint256 remainingBalance = coffeeToken.balanceOf(distributor, testBatchId);
        assertEq(remainingBalance, REQUESTED_QUANTITY - firstRedemption - secondRedemption, "Should have remaining tokens");
        
        console.log("[OK] First redemption ID:", redemptionId1);
        console.log("[OK] Second redemption ID:", redemptionId2);
        console.log("[OK] Remaining distributor balance:", remainingBalance);
        console.log("[OK] Partial redemption workflow completed successfully");
    }
    
    /**
     * @dev Tests error cases in the workflow
     */
    function testWorkflowErrorCases() public {
        console.log("\n=== Testing Workflow Error Cases ===");
        
        // Test unauthorized batch creation
        vm.startPrank(distributor); // distributor doesn't have processor role
        vm.expectRevert();
        coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1e18,
            "Test",
            "60kg",
            "ipfs://test"
        );
        vm.stopPrank();
        console.log("[OK] Unauthorized batch creation properly reverted");
        
        // Create a batch for further testing
        _testStep1_ProcessorCreatesBatch();
        
        // Test unauthorized batch request
        vm.startPrank(processor); // processor doesn't have distributor role
        vm.expectRevert();
        coffeeToken.createBatchRequest(testBatchId, 50, "Unauthorized request");
        vm.stopPrank();
        console.log("[OK] Unauthorized batch request properly reverted");
        
        // Test redemption without tokens
        vm.startPrank(buyer); // buyer has no tokens
        vm.expectRevert();
        redemption.requestRedemption(testBatchId, 10, "No tokens");
        vm.stopPrank();
        console.log("[OK] Redemption without tokens properly reverted");
        
        console.log("[OK] All error cases handled correctly");
    }
    
    /* -------------------------------------------------------------------------- */
    /*                              Utility Functions                             */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Helper to display workflow summary
     */
    function displayWorkflowSummary() internal view {
        console.log("\n=== WORKFLOW SUMMARY ===");
        console.log("Batch ID:", testBatchId);
        console.log("Request Index:", testRequestIndex);
        console.log("Request ID:", vm.toString(testRequestId));
        console.log("Redemption ID:", testRedemptionId);
        console.log("Batch Quantity:", BATCH_QUANTITY);
        console.log("Requested Quantity:", REQUESTED_QUANTITY);
        console.log("Redeemed Quantity:", REDEMPTION_QUANTITY);
        console.log("Price per Unit:", PRICE_PER_UNIT / 1e18, "ETH");
    }
}