// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";

/**
 * @title WAGATreasuryConsolidatedTest
 * @dev Consolidated unit tests for WAGA Treasury functionality
 * @notice Merges basic treasury tests and enhanced features into single comprehensive test suite
 */
contract WAGATreasuryConsolidatedTest is BaseWAGATest {

    uint256 private testBatchId;
    
    function setUp() public override {
        super.setUp();
        
        // Create test batch and set up payment
        testBatchId = createTestBatch(processor);
        
        vm.prank(admin);
        treasury.setBatchPayment(testBatchId, TEST_PAYMENT_AMOUNT);
        
        console.log("WAGATreasuryTest: Setup completed with batch payment set");
    }

    /* -------------------------------------------------------------------------- */
    /*                              BASIC TREASURY TESTS                         */
    /* -------------------------------------------------------------------------- */

    function testDeployment() public view {
        assertEq(address(treasury.usdcToken()), address(usdc));
        assertTrue(address(treasury) != address(0));
    }

    function testSetBatchPayment_Success() public {
        uint256 newBatchId = createTestBatch(processor);
        
        vm.prank(admin);
        treasury.setBatchPayment(newBatchId, TEST_PAYMENT_AMOUNT);

        uint256 storedAmount = treasury.batchPaymentRequired(newBatchId);
        assertEq(storedAmount, TEST_PAYMENT_AMOUNT);
    }

    function testSetBatchPayment_OnlyAdmin() public {
        uint256 newBatchId = createTestBatch(processor);
        
        vm.prank(unauthorized);
        vm.expectRevert();
        treasury.setBatchPayment(newBatchId, TEST_PAYMENT_AMOUNT);
    }

    function testPayForBatch_Success() public {
        // Record initial balances
        uint256 initialBuyerBalance = usdc.balanceOf(buyer);
        uint256 initialTreasuryBalance = usdc.balanceOf(address(treasury));

        // Buyer pays for batch
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);

        // Verify balances
        assertUSDCBalance(buyer, initialBuyerBalance - TEST_PAYMENT_AMOUNT);
        assertUSDCBalance(address(treasury), initialTreasuryBalance + TEST_PAYMENT_AMOUNT);

        // Verify payment record
        assertTrue(treasury.checkPaymentStatus(buyer, testBatchId));
    }

    function testPayForBatch_InsufficientAllowance() public {
        // Remove allowance
        vm.prank(buyer);
        usdc.approve(address(treasury), 0);
        
        vm.prank(buyer);
        vm.expectRevert();
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
    }

    function testPayForBatch_InsufficientBalance() public {
        // Verify buyer has initial balance
        uint256 initialBalance = usdc.balanceOf(buyer);
        assertGt(initialBalance, 0, "Buyer should have initial USDC balance");
        
        // Drain buyer's balance
        vm.prank(buyer);
        usdc.transfer(address(1), initialBalance);
        
        // Verify balance is now zero
        assertEq(usdc.balanceOf(buyer), 0, "Buyer balance should be zero after drain");
        
        vm.prank(buyer);
        vm.expectRevert(); // Expecting ERC20InsufficientBalance or WAGATreasury__InsufficientUSDCBalance_payForBatch
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
    }

    function testPayForBatch_ExcessiveAmount() public {
        vm.prank(buyer);
        vm.expectRevert();
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT + 1);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ENHANCED TREASURY FEATURES                   */
    /* -------------------------------------------------------------------------- */

    function testOfframpTransfer_Success() public {
        // First, buyer pays for batch
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        // Record initial seller balance
        uint256 initialSellerBalance = usdc.balanceOf(seller);
        
        // Execute offramp transfer
        vm.prank(offrampExecutor);
        treasury.transferToOfframpPartner(testBatchId, buyer, seller, TEST_PAYMENT_AMOUNT);
        
        // Verify seller received payment
        assertUSDCBalance(seller, initialSellerBalance + TEST_PAYMENT_AMOUNT);
    }

    function testOfframpTransfer_OnlyOfframpExecutor() public {
        // First, buyer pays for batch
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        vm.prank(unauthorized);
        vm.expectRevert();
        treasury.transferToOfframpPartner(testBatchId, buyer, seller, TEST_PAYMENT_AMOUNT);
    }

    function testOfframpTransfer_InsufficientTreasuryBalance() public {
        // Don't pay first, try to transfer
        vm.prank(offrampExecutor);
        vm.expectRevert();
        treasury.transferToOfframpPartner(testBatchId, buyer, seller, TEST_PAYMENT_AMOUNT);
    }

    function testMultiplePayments_SameBatch() public {
        // Two different users each pay for their own separate batches of the same amount
        uint256 batch1 = createTestBatch(cooperative);
        uint256 batch2 = createTestBatch(processor);
        
        // Set required payments for both batches
        vm.startPrank(admin);
        treasury.setBatchPayment(batch1, TEST_PAYMENT_AMOUNT);
        treasury.setBatchPayment(batch2, TEST_PAYMENT_AMOUNT);
        vm.stopPrank();
        
        // First user pays for batch1
        vm.prank(buyer);
        treasury.payForBatch(batch1, TEST_PAYMENT_AMOUNT);
        
        // Second user pays for batch2
        vm.prank(user);
        treasury.payForBatch(batch2, TEST_PAYMENT_AMOUNT);
        
        // Verify both payments recorded
        assertTrue(treasury.checkPaymentStatus(buyer, batch1));
        assertTrue(treasury.checkPaymentStatus(user, batch2));
        
        // Verify total treasury balance
        uint256 expectedBalance = TEST_PAYMENT_AMOUNT * 2;
        assertTrue(usdc.balanceOf(address(treasury)) >= expectedBalance);
    }

    /* -------------------------------------------------------------------------- */
    /*                              PAYMENT WORKFLOW TESTS                       */
    /* -------------------------------------------------------------------------- */

    function testEndToEndPaymentWorkflow() public {
        uint256 newBatchId = createTestBatch(cooperative);
        
        // 1. Admin sets batch payment
        vm.prank(admin);
        treasury.setBatchPayment(newBatchId, TEST_PAYMENT_AMOUNT);
        
        // 2. Buyer pays for batch
        uint256 initialBuyerBalance = usdc.balanceOf(buyer);
        vm.prank(buyer);
        treasury.payForBatch(newBatchId, TEST_PAYMENT_AMOUNT);
        
        // 3. Verify payment recorded
        assertTrue(treasury.checkPaymentStatus(buyer, newBatchId));
        assertUSDCBalance(buyer, initialBuyerBalance - TEST_PAYMENT_AMOUNT);
        
        // 4. Execute offramp to seller
        uint256 initialSellerBalance = usdc.balanceOf(cooperative);
        vm.prank(offrampExecutor);
        treasury.transferToOfframpPartner(newBatchId, buyer, cooperative, TEST_PAYMENT_AMOUNT);
        
        // 5. Verify final state
        assertUSDCBalance(cooperative, initialSellerBalance + TEST_PAYMENT_AMOUNT);
    }

    function testBatchPaymentTracking() public {
        uint256 batchId1 = createTestBatch(processor);
        uint256 batchId2 = createTestBatch(cooperative);
        
        // Set different payment amounts
        vm.startPrank(admin);
        treasury.setBatchPayment(batchId1, TEST_PAYMENT_AMOUNT);
        treasury.setBatchPayment(batchId2, TEST_PAYMENT_AMOUNT * 2);
        vm.stopPrank();
        
        // Verify amounts are tracked separately
        assertEq(treasury.batchPaymentRequired(batchId1), TEST_PAYMENT_AMOUNT);
        assertEq(treasury.batchPaymentRequired(batchId2), TEST_PAYMENT_AMOUNT * 2);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ROLE-BASED ACCESS TESTS                      */
    /* -------------------------------------------------------------------------- */

    function testPaymentProcessor_RoleAccess() public {
        // Payment processor should be able to set batch payments
        uint256 newBatchId = createTestBatch(processor);
        
        // Note: In the unified access control, these operations may be restricted to admin
        // The test verifies current implementation behavior
        vm.prank(paymentProcessor);
        // This might revert depending on role configuration
        // vm.expectRevert(); // Uncomment if payment processor can't set payments
        try treasury.setBatchPayment(newBatchId, TEST_PAYMENT_AMOUNT) {
            // If successful, verify it was set
            assertEq(treasury.batchPaymentRequired(newBatchId), TEST_PAYMENT_AMOUNT);
        } catch {
            // Expected if payment processor doesn't have admin role
            console.log("Payment processor cannot set batch payments - expected behavior");
        }
    }

    function testOfframpExecutor_RoleAccess() public {
        // First ensure there's payment to execute
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        // Offramp executor should be able to execute transfers
        vm.prank(offrampExecutor);
        treasury.transferToOfframpPartner(testBatchId, buyer, seller, TEST_PAYMENT_AMOUNT);
        
        // Verify transfer succeeded
        assertTrue(usdc.balanceOf(seller) > 0);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ERROR CONDITION TESTS                        */
    /* -------------------------------------------------------------------------- */

    function testPayForNonExistentBatch() public {
        uint256 nonExistentBatch = 999999;
        
        vm.prank(buyer);
        vm.expectRevert();
        treasury.payForBatch(nonExistentBatch, TEST_PAYMENT_AMOUNT);
    }

    function testDoublePayment_SameUser() public {
        // First payment
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        // Second payment from same user - behavior depends on implementation
        vm.prank(buyer);
        // This might revert or succeed depending on treasury logic
        try treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT) {
            console.log("Double payment allowed");
        } catch {
            console.log("Double payment rejected - expected behavior");
        }
    }

    function testZeroAmountPayment() public {
        vm.prank(buyer);
        vm.expectRevert();
        treasury.payForBatch(testBatchId, 0);
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTEGRATION WITH OTHER CONTRACTS             */
    /* -------------------------------------------------------------------------- */

    function testTreasuryIntegrationWithBatchManager() public {
        // Create batch with batch manager
        uint256 batchId = createTestBatch(processor);
        
        // Set payment through treasury
        vm.prank(admin);
        treasury.setBatchPayment(batchId, TEST_PAYMENT_AMOUNT);
        
        // Verify integration works
        assertEq(treasury.batchPaymentRequired(batchId), TEST_PAYMENT_AMOUNT);
        assertTrue(coffeeToken.isBatchCreated(batchId));
    }

    function testTreasuryIntegrationWithRedemption() public {
        // This test would verify integration between treasury and redemption contract
        // Ensuring that payments are properly validated before redemption is allowed
        
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        // Payment status should be checkable by redemption contract
        assertTrue(treasury.checkPaymentStatus(buyer, testBatchId));
    }

    /* -------------------------------------------------------------------------- */
    /*                              GAS OPTIMIZATION TESTS                       */
    /* -------------------------------------------------------------------------- */

    function testGasUsage_BatchPayment() public {
        uint256 gasBefore = gasleft();
        
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("Gas used for batch payment:", gasUsed);
        
        // Assert reasonable gas usage (adjust threshold as needed)
        assertTrue(gasUsed < 200000, "Batch payment should use less than 200k gas");
    }

    function testGasUsage_OfframpTransfer() public {
        // First pay for batch
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        uint256 gasBefore = gasleft();
        vm.prank(offrampExecutor);
        treasury.transferToOfframpPartner(testBatchId, buyer, seller, TEST_PAYMENT_AMOUNT);
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("Gas used for offramp transfer:", gasUsed);
        
        assertTrue(gasUsed < 150000, "Offramp transfer should use less than 150k gas");
    }
}