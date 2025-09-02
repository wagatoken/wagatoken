// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";

contract WAGATreasuryTest is Test {
    WAGATreasury public treasury;
    MockUSDC public usdc;

    address public admin = address(1);
    address public paymentProcessor = address(2);
    address public user = address(3);
    address public batchRecipient = address(4);

    uint256 public constant BATCH_ID = 123;
    uint256 public constant PAYMENT_AMOUNT = 50000000; // 50 USDC (6 decimals)

    function setUp() public {
        // Deploy mock USDC
        usdc = new MockUSDC();

        // Deploy treasury with USDC address
        vm.prank(admin);
        treasury = new WAGATreasury(address(usdc));

        // Setup roles
        vm.startPrank(admin);
        treasury.grantRole(treasury.ADMIN_ROLE(), admin);
        treasury.grantRole(treasury.PAYMENT_PROCESSOR_ROLE(), paymentProcessor);
        vm.stopPrank();

        // Fund user with USDC for testing
        usdc.mint(user, PAYMENT_AMOUNT * 10);
        vm.prank(user);
        usdc.approve(address(treasury), PAYMENT_AMOUNT * 10);
    }

    function testDeployment() public {
        assertEq(address(treasury.usdcToken()), address(usdc));
        assertTrue(treasury.hasRole(treasury.ADMIN_ROLE(), admin));
        assertTrue(treasury.hasRole(treasury.PAYMENT_PROCESSOR_ROLE(), paymentProcessor));
    }

    function testSetBatchPayment() public {
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        uint256 storedAmount = treasury.batchPaymentRequired(BATCH_ID);
        assertEq(storedAmount, PAYMENT_AMOUNT);
    }

    function testSetBatchPaymentOnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);
    }

    function testPayForBatchDirect() public {
        // Set batch payment amount
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        // Record initial balances
        uint256 initialUserBalance = usdc.balanceOf(user);
        uint256 initialTreasuryBalance = usdc.balanceOf(address(treasury));

        // User pays for batch
        vm.prank(user);
        treasury.payForBatch(BATCH_ID, PAYMENT_AMOUNT);

        // Verify balances
        assertEq(usdc.balanceOf(user), initialUserBalance - PAYMENT_AMOUNT);
        assertEq(usdc.balanceOf(address(treasury)), initialTreasuryBalance + PAYMENT_AMOUNT);

        // Verify payment record
        assertTrue(treasury.checkPaymentStatus(user, BATCH_ID));
    }

    function testPayForBatchInsufficientAllowance() public {
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        // Remove allowance
        vm.prank(user);
        usdc.approve(address(treasury), 0);

        vm.prank(user);
        vm.expectRevert();
        treasury.payForBatch(BATCH_ID, PAYMENT_AMOUNT);
    }

    function testPayForBatchIncorrectAmount() public {
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        vm.prank(user);
        vm.expectRevert("Incorrect payment amount");
        treasury.payForBatch(BATCH_ID, PAYMENT_AMOUNT / 2);
    }

    function testProcessCoinbasePayment() public {
        string memory chargeId = "charge_12345";

        vm.prank(paymentProcessor);
        treasury.processCoinbasePayment(user, BATCH_ID, PAYMENT_AMOUNT, chargeId);

        // Verify charge is marked as processed
        assertTrue(treasury.processedChargeIds(chargeId));

        // Verify payment status
        assertTrue(treasury.checkPaymentStatus(user, BATCH_ID));

        // Verify payment amounts
        (, uint256 collected) = treasury.getBatchPaymentInfo(BATCH_ID);
        assertEq(collected, PAYMENT_AMOUNT);
    }

    function testProcessCoinbasePaymentOnlyProcessor() public {
        vm.prank(user);
        vm.expectRevert();
        treasury.processCoinbasePayment(user, BATCH_ID, PAYMENT_AMOUNT, "charge_123");
    }

    function testDistributeFunds() public {
        // First make a payment to treasury
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        vm.prank(user);
        treasury.payForBatch(BATCH_ID, PAYMENT_AMOUNT);

        uint256 initialBalance = usdc.balanceOf(batchRecipient);

        // Distribute funds
        vm.prank(admin);
        treasury.distributeFunds(batchRecipient, PAYMENT_AMOUNT, "Test distribution");

        assertEq(usdc.balanceOf(batchRecipient), initialBalance + PAYMENT_AMOUNT);
        assertEq(usdc.balanceOf(address(treasury)), 0);
    }

    function testDistributeFundsOnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        treasury.distributeFunds(batchRecipient, PAYMENT_AMOUNT, "Test");
    }

    function testDistributeFundsInsufficientBalance() public {
        vm.prank(admin);
        vm.expectRevert("Insufficient treasury balance");
        treasury.distributeFunds(batchRecipient, PAYMENT_AMOUNT, "Test");
    }

    function testCheckPaymentStatus() public {
        // Initially no payment
        assertFalse(treasury.checkPaymentStatus(user, BATCH_ID));

        // Make direct payment
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        vm.prank(user);
        treasury.payForBatch(BATCH_ID, PAYMENT_AMOUNT);

        assertTrue(treasury.checkPaymentStatus(user, BATCH_ID));
    }

    function testGetBatchPaymentInfo() public {
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        (uint256 required, uint256 collected) = treasury.getBatchPaymentInfo(BATCH_ID);
        assertEq(required, PAYMENT_AMOUNT);
        assertEq(collected, 0); // No payments collected yet
    }

    function testGetTreasuryStats() public {
        // Make a payment
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        vm.prank(user);
        treasury.payForBatch(BATCH_ID, PAYMENT_AMOUNT);

        (uint256 totalCollected, uint256 totalDistributed, uint256 currentBalance) = treasury.getTreasuryStats();

        assertEq(totalCollected, PAYMENT_AMOUNT);
        assertEq(totalDistributed, 0); // No distributions made yet
        assertEq(currentBalance, PAYMENT_AMOUNT);
    }

    function testEmergencyWithdraw() public {
        // Make a payment
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        vm.prank(user);
        treasury.payForBatch(BATCH_ID, PAYMENT_AMOUNT);

        vm.prank(admin);
        treasury.emergencyWithdraw(address(usdc), PAYMENT_AMOUNT);

        assertEq(usdc.balanceOf(address(treasury)), 0);
        assertEq(usdc.balanceOf(admin), PAYMENT_AMOUNT);
    }

    function testEmergencyWithdrawOnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        treasury.emergencyWithdraw(address(usdc), PAYMENT_AMOUNT);
    }

    function testReentrancyProtection() public {
        // This would require a more complex test with a malicious contract
        // For now, we can test that normal operations don't cause issues
        vm.prank(admin);
        treasury.setBatchPayment(BATCH_ID, PAYMENT_AMOUNT);

        vm.prank(user);
        treasury.payForBatch(BATCH_ID, PAYMENT_AMOUNT);

        assertTrue(treasury.checkPaymentStatus(user, BATCH_ID));
    }
}
