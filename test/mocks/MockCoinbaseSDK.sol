// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MockCoinbaseSDK
 * @dev Mock contract to simulate Coinbase SDK interactions for testing
 */
contract MockCoinbaseSDK is AccessControl {
    bytes32 public constant CDP_ADMIN_ROLE = keccak256("CDP_ADMIN_ROLE");
    bytes32 public constant PAYMENT_HANDLER_ROLE = keccak256("PAYMENT_HANDLER_ROLE");

    // Mock CDP configuration
    address public cdpSmartAccountFactory;
    address public cdpPaymaster;

    // Mock payment tracking
    struct MockPayment {
        address user;
        uint256 batchId;
        uint256 amount;
        string chargeId;
        uint256 timestamp;
        PaymentStatus status;
    }

    enum PaymentStatus {
        Pending,
        Confirmed,
        Failed,
        Refunded
    }

    mapping(string => MockPayment) public mockPayments;
    mapping(address => address) public userSmartAccounts;
    mapping(bytes32 => bool) public processedWebhooks;

    // Events
    event MockPaymentInitiated(address indexed user, uint256 indexed batchId, uint256 amount, string chargeId);
    event MockPaymentConfirmed(address indexed user, uint256 indexed batchId, string chargeId);
    event MockSmartAccountCreated(address indexed user, address indexed smartAccount);
    event MockWebhookProcessed(bytes32 indexed webhookId, bool success);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CDP_ADMIN_ROLE, msg.sender);
        _grantRole(PAYMENT_HANDLER_ROLE, msg.sender);

        // Set default mock addresses
        cdpSmartAccountFactory = address(0x123);
        cdpPaymaster = address(0x456);
    }

    /**
     * @dev Mock creating a smart account
     */
    function createSmartAccount(address user) external returns (address smartAccount) {
        require(userSmartAccounts[user] == address(0), "Smart account already exists");

        // Generate a deterministic mock address
        smartAccount = address(uint160(uint256(keccak256(abi.encodePacked(user, block.timestamp)))));

        userSmartAccounts[user] = smartAccount;

        emit MockSmartAccountCreated(user, smartAccount);
        return smartAccount;
    }

    /**
     * @dev Mock initiating a CDP payment
     */
    function initiateCDPPayment(
        address user,
        uint256 batchId,
        uint256 amount,
        string calldata chargeId
    ) external onlyRole(PAYMENT_HANDLER_ROLE) {
        require(amount > 0, "Payment amount must be greater than 0");
        require(bytes(chargeId).length > 0, "Charge ID cannot be empty");
        require(mockPayments[chargeId].user == address(0), "Charge ID already exists");

        mockPayments[chargeId] = MockPayment({
            user: user,
            batchId: batchId,
            amount: amount,
            chargeId: chargeId,
            timestamp: block.timestamp,
            status: PaymentStatus.Pending
        });

        emit MockPaymentInitiated(user, batchId, amount, chargeId);
    }

    /**
     * @dev Mock confirming a CDP payment
     */
    function confirmCDPPayment(
        string calldata chargeId,
        bool success
    ) external onlyRole(PAYMENT_HANDLER_ROLE) {
        MockPayment storage payment = mockPayments[chargeId];
        require(payment.user != address(0), "Payment not found");
        require(payment.status == PaymentStatus.Pending, "Payment not pending");

        if (success) {
            payment.status = PaymentStatus.Confirmed;
            emit MockPaymentConfirmed(payment.user, payment.batchId, chargeId);
        } else {
            payment.status = PaymentStatus.Failed;
        }
    }

    /**
     * @dev Mock processing webhook
     */
    function processMockWebhook(
        bytes calldata webhookData,
        bytes calldata signature
    ) external onlyRole(PAYMENT_HANDLER_ROLE) returns (bool) {
        bytes32 webhookId = keccak256(abi.encodePacked(webhookData, signature));

        require(!processedWebhooks[webhookId], "Webhook already processed");

        processedWebhooks[webhookId] = true;

        // Simulate webhook processing
        bool success = true;

        emit MockWebhookProcessed(webhookId, success);
        return success;
    }

    /**
     * @dev Mock cross-border payment
     */
    function processCrossBorderPayment(
        address user,
        uint256 batchId,
        uint256 amount,
        string calldata destinationCurrency
    ) external onlyRole(PAYMENT_HANDLER_ROLE) returns (string memory chargeId) {
        chargeId = string(abi.encodePacked("mock_cdp_", user, "_", batchId, "_", block.timestamp));

        mockPayments[chargeId] = MockPayment({
            user: user,
            batchId: batchId,
            amount: amount,
            chargeId: chargeId,
            timestamp: block.timestamp,
            status: PaymentStatus.Pending
        });

        emit MockPaymentInitiated(user, batchId, amount, chargeId);
        return chargeId;
    }

    /**
     * @dev Get mock payment details
     */
    function getMockPayment(string calldata chargeId) external view returns (MockPayment memory) {
        return mockPayments[chargeId];
    }

    /**
     * @dev Get user's mock smart account
     */
    function getUserSmartAccount(address user) external view returns (address) {
        return userSmartAccounts[user];
    }

    /**
     * @dev Set mock CDP configuration (for testing different scenarios)
     */
    function setMockCDPConfig(
        address _cdpSmartAccountFactory,
        address _cdpPaymaster
    ) external onlyRole(CDP_ADMIN_ROLE) {
        cdpSmartAccountFactory = _cdpSmartAccountFactory;
        cdpPaymaster = _cdpPaymaster;
    }

    /**
     * @dev Simulate payment success for testing
     */
    function simulatePaymentSuccess(string calldata chargeId) external {
        MockPayment storage payment = mockPayments[chargeId];
        require(payment.user != address(0), "Payment not found");

        payment.status = PaymentStatus.Confirmed;
        emit MockPaymentConfirmed(payment.user, payment.batchId, chargeId);
    }

    /**
     * @dev Simulate payment failure for testing
     */
    function simulatePaymentFailure(string calldata chargeId) external {
        MockPayment storage payment = mockPayments[chargeId];
        require(payment.user != address(0), "Payment not found");

        payment.status = PaymentStatus.Failed;
    }
}
