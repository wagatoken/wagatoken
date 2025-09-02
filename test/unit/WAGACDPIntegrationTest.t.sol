// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WAGACDPIntegration} from "../../src/WAGACDPIntegration.sol";
import {IWAGACDPIntegration} from "../../src/Interfaces/IWAGACDPIntegration.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {MockCoinbaseSDK} from "../mocks/MockCoinbaseSDK.sol";

contract WAGACDPIntegrationTest is Test {
    WAGACDPIntegration public cdpIntegration;
    MockUSDC public usdc;
    MockCoinbaseSDK public mockCoinbaseSDK;

    address public admin = address(1);
    address public paymentHandler = address(2);
    address public user = address(3);
    address public smartAccount;

    uint256 public constant BATCH_ID = 123;
    uint256 public constant PAYMENT_AMOUNT = 50000000; // 50 USDC (6 decimals)

    function setUp() public {
        // Deploy mock contracts
        usdc = new MockUSDC();
        vm.prank(admin);
        mockCoinbaseSDK = new MockCoinbaseSDK();

        // Deploy CDP integration with USDC and mock Coinbase SDK addresses
        vm.prank(admin);
        cdpIntegration = new WAGACDPIntegration(
            address(usdc),
            address(mockCoinbaseSDK),
            address(mockCoinbaseSDK) // Using mock for paymaster too
        );

        // Setup roles
        vm.startPrank(admin);
        cdpIntegration.grantRole(cdpIntegration.CDP_ADMIN_ROLE(), admin);
        cdpIntegration.grantRole(cdpIntegration.PAYMENT_HANDLER_ROLE(), paymentHandler);
        // Setup roles for mock contracts
        mockCoinbaseSDK.grantRole(mockCoinbaseSDK.PAYMENT_HANDLER_ROLE(), paymentHandler);
        vm.stopPrank();

        // Note: Smart account creation will be tested in individual test functions
    }

    function testDeployment() public {
        assertEq(address(cdpIntegration.usdcToken()), address(usdc));
        assertTrue(cdpIntegration.hasRole(cdpIntegration.CDP_ADMIN_ROLE(), admin));
        assertTrue(cdpIntegration.hasRole(cdpIntegration.PAYMENT_HANDLER_ROLE(), paymentHandler));
    }

    function testCreateSmartAccount() public {
        vm.prank(admin);
        address newSmartAccount = cdpIntegration.createSmartAccount(user);
        assertTrue(newSmartAccount != address(0));

        // Store for other tests
        smartAccount = newSmartAccount;

        // Verify smart account is stored
        address storedAccount = cdpIntegration.getUserSmartAccount(user);
        assertEq(storedAccount, newSmartAccount);
    }

    function testCreateSmartAccountAlreadyExists() public {
        // First create a smart account
        vm.prank(admin);
        cdpIntegration.createSmartAccount(user);

        // Now try to create again - should revert
        vm.prank(admin);
        vm.expectRevert("Smart account already exists");
        cdpIntegration.createSmartAccount(user);
    }

    function testInitiateCDPPayment() public {
        string memory chargeId = "charge_12345";

        vm.prank(paymentHandler);
        cdpIntegration.initiateCDPPayment(user, BATCH_ID, PAYMENT_AMOUNT, chargeId);

        // Verify payment details
        WAGACDPIntegration.CDPPayment memory payment = cdpIntegration.getCDPPayment(chargeId);
        assertEq(payment.user, user);
        assertEq(payment.batchId, BATCH_ID);
        assertEq(payment.amount, PAYMENT_AMOUNT);
        assertEq(payment.chargeId, chargeId);
        assertEq(uint256(payment.status), uint256(IWAGACDPIntegration.PaymentStatus.Pending));
    }

    function testInitiateCDPPaymentOnlyHandler() public {
        vm.prank(user);
        vm.expectRevert();
        cdpIntegration.initiateCDPPayment(user, BATCH_ID, PAYMENT_AMOUNT, "charge_123");
    }

    function testConfirmCDPPayment() public {
        string memory chargeId = "charge_12345";

        // First initiate payment
        vm.prank(paymentHandler);
        cdpIntegration.initiateCDPPayment(user, BATCH_ID, PAYMENT_AMOUNT, chargeId);

        // Confirm payment
        vm.prank(paymentHandler);
        cdpIntegration.confirmCDPPayment(chargeId, true);

        // Verify payment status
        WAGACDPIntegration.CDPPayment memory payment = cdpIntegration.getCDPPayment(chargeId);
        assertEq(uint256(payment.status), uint256(IWAGACDPIntegration.PaymentStatus.Confirmed));
    }

    function testConfirmCDPPaymentFailure() public {
        string memory chargeId = "charge_12345";

        // First initiate payment
        vm.prank(paymentHandler);
        cdpIntegration.initiateCDPPayment(user, BATCH_ID, PAYMENT_AMOUNT, chargeId);

        // Confirm payment as failed
        vm.prank(paymentHandler);
        cdpIntegration.confirmCDPPayment(chargeId, false);

        // Verify payment status
        WAGACDPIntegration.CDPPayment memory payment = cdpIntegration.getCDPPayment(chargeId);
        assertEq(uint256(payment.status), uint256(IWAGACDPIntegration.PaymentStatus.Failed));
    }

    function testProcessCrossBorderPayment() public {
        string memory destinationCurrency = "EUR";

        vm.prank(paymentHandler);
        string memory chargeId = cdpIntegration.processCrossBorderPayment(
            user,
            BATCH_ID,
            PAYMENT_AMOUNT,
            destinationCurrency
        );

        // Verify cross-border payment was created
        WAGACDPIntegration.CDPPayment memory payment = cdpIntegration.getCDPPayment(chargeId);
        assertEq(payment.user, user);
        assertEq(payment.batchId, BATCH_ID);
        assertEq(payment.amount, PAYMENT_AMOUNT);
    }

    function testProcessMockWebhook() public {
        bytes memory webhookData = "mock_webhook_data";
        bytes memory signature = "mock_signature";

        vm.prank(paymentHandler);
        bool success = mockCoinbaseSDK.processMockWebhook(webhookData, signature);

        assertTrue(success);

        // Verify webhook was processed
        bytes32 webhookId = keccak256(abi.encodePacked(webhookData, signature));
        assertTrue(mockCoinbaseSDK.processedWebhooks(webhookId));
    }

    function testProcessMockWebhookTwice() public {
        bytes memory webhookData = "mock_webhook_data";
        bytes memory signature = "mock_signature";

        // Process webhook first time
        vm.prank(paymentHandler);
        mockCoinbaseSDK.processMockWebhook(webhookData, signature);

        // Try to process same webhook again
        vm.prank(paymentHandler);
        vm.expectRevert("Webhook already processed");
        mockCoinbaseSDK.processMockWebhook(webhookData, signature);
    }

    function testUpdateCDPConfig() public {
        address newFactory = address(0x999);
        address newPaymaster = address(0x888);

        vm.prank(admin);
        cdpIntegration.updateCDPConfig(newFactory, newPaymaster);

        // Verify config was updated
        assertEq(cdpIntegration.cdpSmartAccountFactory(), newFactory);
        assertEq(cdpIntegration.cdpPaymaster(), newPaymaster);
    }

    function testUpdateCDPConfigOnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        cdpIntegration.updateCDPConfig(address(0x999), address(0x888));
    }

    function testEmergencyPause() public {
        // This would test emergency pause functionality
        // For now, just ensure it doesn't revert
        vm.prank(admin);
        cdpIntegration.emergencyPause();
    }

    function testEmergencyUnpause() public {
        vm.prank(admin);
        cdpIntegration.emergencyUnpause();
    }

    function testGetUserSmartAccount() public {
        address storedAccount = cdpIntegration.getUserSmartAccount(user);
        assertEq(storedAccount, smartAccount);
    }

    function testGetNonexistentSmartAccount() public {
        address newUser = address(0x123);
        address storedAccount = cdpIntegration.getUserSmartAccount(newUser);
        assertEq(storedAccount, address(0));
    }

    function testMultiplePayments() public {
        // Create multiple payments
        vm.startPrank(paymentHandler);

        cdpIntegration.initiateCDPPayment(user, BATCH_ID, PAYMENT_AMOUNT, "charge_1");
        cdpIntegration.initiateCDPPayment(user, BATCH_ID + 1, PAYMENT_AMOUNT * 2, "charge_2");
        cdpIntegration.initiateCDPPayment(user, BATCH_ID + 2, PAYMENT_AMOUNT * 3, "charge_3");

        vm.stopPrank();

        // Verify all payments exist
        WAGACDPIntegration.CDPPayment memory payment1 = cdpIntegration.getCDPPayment("charge_1");
        WAGACDPIntegration.CDPPayment memory payment2 = cdpIntegration.getCDPPayment("charge_2");
        WAGACDPIntegration.CDPPayment memory payment3 = cdpIntegration.getCDPPayment("charge_3");

        assertEq(payment1.amount, PAYMENT_AMOUNT);
        assertEq(payment2.amount, PAYMENT_AMOUNT * 2);
        assertEq(payment3.amount, PAYMENT_AMOUNT * 3);
    }

    function testPaymentStatusTransitions() public {
        string memory chargeId = "charge_status_test";

        // Start with pending
        vm.prank(paymentHandler);
        cdpIntegration.initiateCDPPayment(user, BATCH_ID, PAYMENT_AMOUNT, chargeId);

        // Get payment and check initial status
        IWAGACDPIntegration.CDPPayment memory payment = cdpIntegration.getCDPPayment(chargeId);
        assertEq(uint256(payment.status), uint256(IWAGACDPIntegration.PaymentStatus.Pending));

        // Change to confirmed - this should work
        vm.prank(paymentHandler);
        cdpIntegration.confirmCDPPayment(chargeId, true);

        // Check that status changed
        payment = cdpIntegration.getCDPPayment(chargeId);
        assertEq(uint256(payment.status), uint256(IWAGACDPIntegration.PaymentStatus.Confirmed));
    }
}
