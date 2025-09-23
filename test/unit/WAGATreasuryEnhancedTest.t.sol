// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";

/**
 * @title WAGATreasuryEnhancedTest
 * @dev Unit tests for enhanced WAGA Treasury with automated offramp transfers
 */
contract WAGATreasuryEnhancedTest is Test {
    WAGATreasury public treasury;
    MockUSDC public usdc;

    // Test accounts
    address public admin = makeAddr("admin");
    address public offrampExecutor = makeAddr("offrampExecutor");
    address public buyer = makeAddr("buyer");
    address public offrampPartner = makeAddr("offrampPartner");
    address public unauthorized = makeAddr("unauthorized");

    // Test constants
    uint256 constant BATCH_ID = 1;
    uint256 constant INITIAL_USDC_BALANCE = 10000 * 10**6; // 10,000 USDC
    uint256 constant TRANSFER_AMOUNT = 1000 * 10**6; // 1,000 USDC

    event OfframpTransferExecuted(
        uint256 indexed batchId,
        address indexed buyer,
        address indexed offrampPartner,
        uint256 usdAmount,
        uint256 timestamp
    );

    function setUp() public {
        vm.startPrank(admin);

        // Deploy contracts
        usdc = new MockUSDC();
        treasury = new WAGATreasury(address(usdc));

        // For this test, we'll comment out role setup since it requires a coffee token
        // treasury.setCoffeeToken(address(coffeeToken));
        // coffeeToken.grantRole(keccak256("OFFRAMP_EXECUTOR_ROLE"), offrampExecutor);

        // Fund the treasury with USDC
        usdc.mint(address(treasury), INITIAL_USDC_BALANCE);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                         OFFRAMP TRANSFER TESTS                            */
    /* -------------------------------------------------------------------------- */

    function test_OfframpTransfer_SuccessfulTransfer() public {
        vm.startPrank(offrampExecutor);

        uint256 treasuryBalanceBefore = usdc.balanceOf(address(treasury));
        uint256 partnerBalanceBefore = usdc.balanceOf(offrampPartner);

        // Execute offramp transfer
        vm.expectEmit(true, true, true, true);
        emit OfframpTransferExecuted(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT, block.timestamp);

        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);

        // Verify balances
        uint256 treasuryBalanceAfter = usdc.balanceOf(address(treasury));
        uint256 partnerBalanceAfter = usdc.balanceOf(offrampPartner);

        assertEq(treasuryBalanceAfter, treasuryBalanceBefore - TRANSFER_AMOUNT);
        assertEq(partnerBalanceAfter, partnerBalanceBefore + TRANSFER_AMOUNT);

        // Verify transfer tracking
        (address storedPartner, uint256 storedAmount, bool executed) = treasury.getOfframpTransferDetails(BATCH_ID, buyer);
        assertEq(storedPartner, offrampPartner);
        assertEq(storedAmount, TRANSFER_AMOUNT);
        assertTrue(executed);
        assertTrue(treasury.hasOfframpTransferExecuted(BATCH_ID, buyer));

        vm.stopPrank();
    }

    function test_OfframpTransfer_MultipleTransfers() public {
        vm.startPrank(offrampExecutor);

        // First transfer
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);

        // Second transfer with different buyer
        address buyer2 = makeAddr("buyer2");
        treasury.transferToOfframpPartner(BATCH_ID, buyer2, offrampPartner, TRANSFER_AMOUNT);

        // Verify both transfers
        (address partner1, uint256 amount1, bool executed1) = treasury.getOfframpTransferDetails(BATCH_ID, buyer);
        (address partner2, uint256 amount2, bool executed2) = treasury.getOfframpTransferDetails(BATCH_ID, buyer2);

        assertEq(partner1, offrampPartner);
        assertEq(partner2, offrampPartner);
        assertEq(amount1, TRANSFER_AMOUNT);
        assertEq(amount2, TRANSFER_AMOUNT);
        assertTrue(executed1);
        assertTrue(executed2);

        vm.stopPrank();
    }

    function test_OfframpTransfer_InsufficientBalance() public {
        vm.startPrank(offrampExecutor);

        uint256 largeAmount = INITIAL_USDC_BALANCE + 1000 * 10**6; // More than treasury has

        vm.expectRevert("Insufficient treasury balance");
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, largeAmount);

        vm.stopPrank();
    }

    function test_OfframpTransfer_ZeroAmount() public {
        vm.startPrank(offrampExecutor);

        vm.expectRevert("Invalid transfer amount");
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, 0);

        vm.stopPrank();
    }

    function test_OfframpTransfer_InvalidOfframpPartner() public {
        vm.startPrank(offrampExecutor);

        vm.expectRevert("Invalid offramp partner address");
        treasury.transferToOfframpPartner(BATCH_ID, buyer, address(0), TRANSFER_AMOUNT);

        vm.stopPrank();
    }

    function test_OfframpTransfer_Unauthorized() public {
        vm.startPrank(unauthorized); // Not an offramp executor

        // Expect revert since unauthorized caller doesn't have OFFRAMP_EXECUTOR_ROLE
        vm.expectRevert(); // Generic revert expectation since we can't access private role constant
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);

        vm.stopPrank();
    }

    function test_OfframpTransfer_DuplicateTransfer() public {
        vm.startPrank(offrampExecutor);

        // First transfer succeeds
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);

        // Second transfer for same batch/buyer should fail
        vm.expectRevert("Transfer already executed");
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                         TRANSFER TRACKING TESTS                           */
    /* -------------------------------------------------------------------------- */

    function test_TransferTracking_GetOfframpTransferDetails() public {
        vm.startPrank(offrampExecutor);

        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);

        vm.stopPrank();

        // Test from any account (view function)
        (address partner, uint256 amount, bool executed) = treasury.getOfframpTransferDetails(BATCH_ID, buyer);

        assertEq(partner, offrampPartner);
        assertEq(amount, TRANSFER_AMOUNT);
        assertTrue(executed);
    }

    function test_TransferTracking_HasOfframpTransferExecuted() public {
        // Initially false
        assertFalse(treasury.hasOfframpTransferExecuted(BATCH_ID, buyer));

        vm.startPrank(offrampExecutor);
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);
        vm.stopPrank();

        // Now true
        assertTrue(treasury.hasOfframpTransferExecuted(BATCH_ID, buyer));
    }

    function test_TransferTracking_NonExistentTransfer() public view{
        (address partner, uint256 amount, bool executed) = treasury.getOfframpTransferDetails(BATCH_ID, buyer);

        assertEq(partner, address(0));
        assertEq(amount, 0);
        assertFalse(executed);
        assertFalse(treasury.hasOfframpTransferExecuted(BATCH_ID, buyer));
    }

    /* -------------------------------------------------------------------------- */
    /*                         TREASURY STATISTICS TESTS                         */
    /* -------------------------------------------------------------------------- */

    function test_TreasuryStats_OfframpTransfersUpdateDistributed() public {
        uint256 initialDistributed = treasury.totalDistributed();

        vm.startPrank(offrampExecutor);
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);
        vm.stopPrank();

        uint256 finalDistributed = treasury.totalDistributed();

        assertEq(finalDistributed, initialDistributed + TRANSFER_AMOUNT);
    }

    function test_TreasuryStats_MultipleTransfers() public {
        vm.startPrank(offrampExecutor);

        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);

        address buyer2 = makeAddr("buyer2");
        treasury.transferToOfframpPartner(BATCH_ID, buyer2, offrampPartner, TRANSFER_AMOUNT);

        vm.stopPrank();

        uint256 totalDistributed = treasury.totalDistributed();
        assertEq(totalDistributed, TRANSFER_AMOUNT * 2);
    }

    /* -------------------------------------------------------------------------- */
    /*                          ROLE MANAGEMENT TESTS                            */
    /* -------------------------------------------------------------------------- */

    /*
    // This test is disabled because WAGATreasury doesn't manage roles directly
    // Roles are managed by the CoffeeToken contract
    function test_RoleManagement_GrantOfframpExecutorRole() public {
        vm.startPrank(admin);

        treasury.grantRole(treasury.OFFRAMP_EXECUTOR_ROLE(), unauthorized);

        vm.stopPrank();

        vm.startPrank(unauthorized);
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);
        vm.stopPrank();

        // Verify transfer worked
        assertTrue(treasury.hasOfframpTransferExecuted(BATCH_ID, buyer));
    }
    */

    /*
    // This test is also disabled for the same reason
    function test_RoleManagement_RevokeOfframpExecutorRole() public {
        vm.startPrank(admin);

        treasury.revokeRole(treasury.OFFRAMP_EXECUTOR_ROLE(), offrampExecutor);

        vm.stopPrank();

        vm.startPrank(offrampExecutor);
        vm.expectRevert("AccessControl: account " + vm.toString(offrampExecutor) + " is missing role " + vm.toString(treasury.OFFRAMP_EXECUTOR_ROLE()));
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);
        vm.stopPrank();
    }
    */

    /* -------------------------------------------------------------------------- */
    /*                          INTEGRATION TESTS                               */
    /* -------------------------------------------------------------------------- */

    function test_Integration_FullOfframpWorkflow() public {
        vm.startPrank(offrampExecutor);

        uint256 initialTreasuryBalance = usdc.balanceOf(address(treasury));
        uint256 initialPartnerBalance = usdc.balanceOf(offrampPartner);
        uint256 initialDistributed = treasury.totalDistributed();

        console.log("=== Offramp Transfer Workflow ===");
        console.log("Initial treasury balance:", initialTreasuryBalance);
        console.log("Initial partner balance:", initialPartnerBalance);
        console.log("Initial total distributed:", initialDistributed);

        // Execute transfer
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);

        // Verify all state changes
        uint256 finalTreasuryBalance = usdc.balanceOf(address(treasury));
        uint256 finalPartnerBalance = usdc.balanceOf(offrampPartner);
        uint256 finalDistributed = treasury.totalDistributed();

        console.log("Final treasury balance:", finalTreasuryBalance);
        console.log("Final partner balance:", finalPartnerBalance);
        console.log("Final total distributed:", finalDistributed);

        // Assertions
        assertEq(finalTreasuryBalance, initialTreasuryBalance - TRANSFER_AMOUNT);
        assertEq(finalPartnerBalance, initialPartnerBalance + TRANSFER_AMOUNT);
        assertEq(finalDistributed, initialDistributed + TRANSFER_AMOUNT);
        assertTrue(treasury.hasOfframpTransferExecuted(BATCH_ID, buyer));

        // Verify transfer details
        (address storedPartner, uint256 storedAmount, bool executed) = treasury.getOfframpTransferDetails(BATCH_ID, buyer);
        assertEq(storedPartner, offrampPartner);
        assertEq(storedAmount, TRANSFER_AMOUNT);
        assertTrue(executed);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                         COMPATIBILITY TESTS                               */
    /* -------------------------------------------------------------------------- */

    function test_Compatibility_ExistingTreasuryFunctionsStillWork() public {
        // Test that existing functionality still works
        vm.startPrank(admin);

        // Set batch payment
        treasury.setBatchPayment(BATCH_ID, TRANSFER_AMOUNT);

        // Verify batch payment info
        (uint256 required, uint256 collected) = treasury.getBatchPaymentInfo(BATCH_ID);
        assertEq(required, TRANSFER_AMOUNT);
        assertEq(collected, 0);

        // Get treasury stats
        (uint256 totalCollected, uint256 totalDistributed, uint256 currentBalance) = treasury.getTreasuryStats();
        assertEq(totalCollected, 0);
        assertEq(totalDistributed, 0);
        assertEq(currentBalance, INITIAL_USDC_BALANCE);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          GAS OPTIMIZATION TESTS                           */
    /* -------------------------------------------------------------------------- */

    function test_GasOptimization_OfframpTransferCost() public {
        vm.startPrank(offrampExecutor);

        // Measure gas cost of offramp transfer
        uint256 gasStart = gasleft();
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);
        uint256 gasUsed = gasStart - gasleft();

        console.log("Gas used for offramp transfer:", gasUsed);

        // Should be reasonable (under 100k gas)
        assertLt(gasUsed, 100000);

        vm.stopPrank();
    }

    function test_GasOptimization_ViewFunctionCosts() public {
        vm.startPrank(offrampExecutor);
        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, TRANSFER_AMOUNT);
        vm.stopPrank();

        // Measure gas cost of view functions
        uint256 gasStart = gasleft();
        treasury.hasOfframpTransferExecuted(BATCH_ID, buyer);
        uint256 gasUsedHasExecuted = gasStart - gasleft();

        gasStart = gasleft();
        treasury.getOfframpTransferDetails(BATCH_ID, buyer);
        uint256 gasUsedGetDetails = gasStart - gasleft();

        console.log("Gas used for hasOfframpTransferExecuted:", gasUsedHasExecuted);
        console.log("Gas used for getOfframpTransferDetails:", gasUsedGetDetails);

        // View functions should be very cheap (< 5k gas each)
        assertLt(gasUsedHasExecuted, 5000);
        assertLt(gasUsedGetDetails, 5000);
    }

    /* -------------------------------------------------------------------------- */
    /*                            EDGE CASE TESTS                               */
    /* -------------------------------------------------------------------------- */

    function test_EdgeCase_MaxTransferAmount() public {
        vm.startPrank(offrampExecutor);

        uint256 maxAmount = INITIAL_USDC_BALANCE;

        treasury.transferToOfframpPartner(BATCH_ID, buyer, offrampPartner, maxAmount);

        // Treasury should now be empty
        assertEq(usdc.balanceOf(address(treasury)), 0);
        assertEq(usdc.balanceOf(offrampPartner), INITIAL_USDC_BALANCE);

        vm.stopPrank();
    }

    function test_EdgeCase_MultipleBatchesSameBuyer() public {
        vm.startPrank(offrampExecutor);

        // Transfer for batch 1
        treasury.transferToOfframpPartner(1, buyer, offrampPartner, TRANSFER_AMOUNT);

        // Transfer for batch 2 with same buyer
        treasury.transferToOfframpPartner(2, buyer, offrampPartner, TRANSFER_AMOUNT);

        // Verify both transfers
        assertTrue(treasury.hasOfframpTransferExecuted(1, buyer));
        assertTrue(treasury.hasOfframpTransferExecuted(2, buyer));

        (address partner1, uint256 amount1, bool executed1) = treasury.getOfframpTransferDetails(1, buyer);
        (address partner2, uint256 amount2, bool executed2) = treasury.getOfframpTransferDetails(2, buyer);

        assertEq(partner1, offrampPartner);
        assertEq(partner2, offrampPartner);
        assertEq(amount1, TRANSFER_AMOUNT);
        assertEq(amount2, TRANSFER_AMOUNT);
        assertTrue(executed1);
        assertTrue(executed2);

        vm.stopPrank();
    }

    function test_EdgeCase_LargeBatchIds() public {
        vm.startPrank(offrampExecutor);

        uint256 largeBatchId = type(uint256).max;

        treasury.transferToOfframpPartner(largeBatchId, buyer, offrampPartner, TRANSFER_AMOUNT);

        assertTrue(treasury.hasOfframpTransferExecuted(largeBatchId, buyer));

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                            BATCHED OPERATIONS                             */
    /* -------------------------------------------------------------------------- */

    function test_BatchedOperations_MultipleOfframpTransfers() public {
        vm.startPrank(offrampExecutor);

        address[] memory buyers = new address[](3);
        buyers[0] = makeAddr("buyer1");
        buyers[1] = makeAddr("buyer2");
        buyers[2] = makeAddr("buyer3");

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 500 * 10**6;  // 500 USDC
        amounts[1] = 750 * 10**6;  // 750 USDC
        amounts[2] = 250 * 10**6;  // 250 USDC

        uint256 totalTransferred = 0;

        for (uint256 i = 0; i < buyers.length; i++) {
            treasury.transferToOfframpPartner(BATCH_ID, buyers[i], offrampPartner, amounts[i]);
            totalTransferred += amounts[i];
        }

        // Verify total transferred
        uint256 finalPartnerBalance = usdc.balanceOf(offrampPartner);
        assertEq(finalPartnerBalance, totalTransferred);

        uint256 totalDistributed = treasury.totalDistributed();
        assertEq(totalDistributed, totalTransferred);

        vm.stopPrank();
    }
}
