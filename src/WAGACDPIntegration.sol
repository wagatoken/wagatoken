// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IWAGACDPIntegration} from "./Interfaces/IWAGACDPIntegration.sol";

/**
 * @title WAGACDPIntegration
 * @dev Coinbase Developer Platform integration for WAGA payments
 * Handles on/off ramping, smart accounts, and cross-border payments
 */
contract WAGACDPIntegration is IWAGACDPIntegration, AccessControl, ReentrancyGuard {
    bytes32 public constant CDP_ADMIN_ROLE = keccak256("CDP_ADMIN_ROLE");
    bytes32 public constant PAYMENT_HANDLER_ROLE = keccak256("PAYMENT_HANDLER_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                    */
    /* -------------------------------------------------------------------------- */

    error WAGACDPIntegration__InvalidUSDCAddress_constructor();
    error WAGACDPIntegration__SmartAccountAlreadyExists_createSmartAccount();
    error WAGACDPIntegration__InvalidPaymentAmount_initiateCDPPayment();
    error WAGACDPIntegration__InvalidChargeId_initiateCDPPayment();
    error WAGACDPIntegration__ChargeIdAlreadyExists_initiateCDPPayment();
    error WAGACDPIntegration__PaymentNotFound_processPaymentWebhook();
    error WAGACDPIntegration__PaymentNotPending_processPaymentWebhook();
    error WAGACDPIntegration__WebhookAlreadyProcessed_processPaymentWebhook();

    /* -------------------------------------------------------------------------- */
    /*                            CDP Configuration                               */
    /* -------------------------------------------------------------------------- */

    // CDP Configuration
    address public immutable usdcToken;
    address public cdpSmartAccountFactory;
    address public cdpPaymaster;

    // CDP Webhook verification (for payment confirmations)
    mapping(bytes32 => bool) public processedWebhooks;

    // User CDP smart accounts
    mapping(address => address) public userSmartAccounts;

    // Payment tracking for CDP transactions
    mapping(string => IWAGACDPIntegration.CDPPayment) public cdpPayments;

    constructor(
        address _usdcToken,
        address _cdpSmartAccountFactory,
        address _cdpPaymaster
    ) {
        if (_usdcToken == address(0)) {
            revert WAGACDPIntegration__InvalidUSDCAddress_constructor();
        }

        usdcToken = _usdcToken;
        cdpSmartAccountFactory = _cdpSmartAccountFactory;
        cdpPaymaster = _cdpPaymaster;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CDP_ADMIN_ROLE, msg.sender);
        _grantRole(PAYMENT_HANDLER_ROLE, msg.sender);
    }

    /**
     * @dev Create a CDP smart account for a user
     * @param user The user address
     * @return smartAccount The created smart account address
     */
    function createSmartAccount(address user) external returns (address smartAccount) {
        if (userSmartAccounts[user] != address(0)) {
            revert WAGACDPIntegration__SmartAccountAlreadyExists_createSmartAccount();
        }

        // Call CDP factory to create smart account
        // This would integrate with Coinbase's smart account factory
        // For now, we'll create a placeholder
        smartAccount = address(uint160(uint256(keccak256(abi.encodePacked(user, block.timestamp)))));

        userSmartAccounts[user] = smartAccount;

        emit SmartAccountCreated(user, smartAccount);

        return smartAccount;
    }

    /**
     * @dev Initiate a CDP payment for batch redemption
     * @param user The user making the payment
     * @param batchId The batch ID
     * @param amount The payment amount in USDC
     * @param chargeId The Coinbase Commerce charge ID
     */
    function initiateCDPPayment(
        address user,
        uint256 batchId,
        uint256 amount,
        string calldata chargeId
    ) external onlyRole(PAYMENT_HANDLER_ROLE) {
        if (amount == 0) {
            revert WAGACDPIntegration__InvalidPaymentAmount_initiateCDPPayment();
        }
        if (bytes(chargeId).length == 0) {
            revert WAGACDPIntegration__InvalidChargeId_initiateCDPPayment();
        }
        if (cdpPayments[chargeId].user != address(0)) {
            revert WAGACDPIntegration__ChargeIdAlreadyExists_initiateCDPPayment();
        }

        cdpPayments[chargeId] = IWAGACDPIntegration.CDPPayment({
            user: user,
            batchId: batchId,
            amount: amount,
            chargeId: chargeId,
            timestamp: block.timestamp,
            status: IWAGACDPIntegration.PaymentStatus.Pending
        });

        emit IWAGACDPIntegration.CDPPaymentInitiated(user, batchId, amount, chargeId);
    }

    /**
     * @dev Confirm a CDP payment (called by webhook or admin)
     * @param chargeId The Coinbase Commerce charge ID
     * @param success Whether the payment was successful
     */
    function confirmCDPPayment(
        string calldata chargeId,
        bool success
    ) external onlyRole(PAYMENT_HANDLER_ROLE) {
        IWAGACDPIntegration.CDPPayment storage payment = cdpPayments[chargeId];
        if (payment.user == address(0)) {
            revert WAGACDPIntegration__PaymentNotFound_processPaymentWebhook();
        }
        if (payment.status != IWAGACDPIntegration.PaymentStatus.Pending) {
            revert WAGACDPIntegration__PaymentNotPending_processPaymentWebhook();
        }

        if (success) {
            payment.status = IWAGACDPIntegration.PaymentStatus.Confirmed;
            emit IWAGACDPIntegration.CDPPaymentConfirmed(payment.user, payment.batchId, chargeId);
        } else {
            payment.status = IWAGACDPIntegration.PaymentStatus.Failed;
        }
    }

    /**
     * @dev Process CDP webhook for payment confirmation
     * @param webhookData The webhook payload from Coinbase
     * @param signature The webhook signature for verification
     */
    function processCDPWebhook(
        bytes calldata webhookData,
        bytes calldata signature
    ) external onlyRole(PAYMENT_HANDLER_ROLE) returns (bool) {
        // Calculate webhook ID for deduplication
        bytes32 webhookId = keccak256(abi.encodePacked(webhookData, signature));

        if (processedWebhooks[webhookId]) {
            revert WAGACDPIntegration__WebhookAlreadyProcessed_processPaymentWebhook();
        }

        // Mark webhook as processed
        processedWebhooks[webhookId] = true;

        // Parse webhook data (simplified - would need proper parsing in production)
        // This would verify the signature and extract payment information

        bool success = true; // Simplified - would check webhook data

        emit CDPWebhookProcessed(webhookId, success);

        return success;
    }

    /**
     * @dev Handle cross-border payment processing
     * @param user The user address
     * @param batchId The batch ID
     * @param amount The payment amount
     */
    function processCrossBorderPayment(
        address user,
        uint256 batchId,
        uint256 amount,
        string calldata /* destinationCurrency */
    ) external onlyRole(PAYMENT_HANDLER_ROLE) returns (string memory chargeId) {
        // Generate unique charge ID
        chargeId = string(abi.encodePacked("cdp_", user, "_", batchId, "_", block.timestamp));

        // Initiate CDP cross-border payment
        // This would integrate with Coinbase Commerce for currency conversion
        cdpPayments[chargeId] = IWAGACDPIntegration.CDPPayment({
            user: user,
            batchId: batchId,
            amount: amount,
            chargeId: chargeId,
            timestamp: block.timestamp,
            status: IWAGACDPIntegration.PaymentStatus.Pending
        });

        emit IWAGACDPIntegration.CDPPaymentInitiated(user, batchId, amount, chargeId);

        return chargeId;
    }

    /**
     * @dev Get CDP payment details
     * @param chargeId The charge ID
     * @return payment The payment details
     */
    function getCDPPayment(string calldata chargeId) external view returns (IWAGACDPIntegration.CDPPayment memory) {
        return cdpPayments[chargeId];
    }

    /**
     * @dev Get user's smart account
     * @param user The user address
     * @return smartAccount The smart account address
     */
    function getUserSmartAccount(address user) external view returns (address) {
        return userSmartAccounts[user];
    }

    /**
     * @dev Update CDP configuration
     * @param _cdpSmartAccountFactory New smart account factory address
     * @param _cdpPaymaster New paymaster address
     */
    function updateCDPConfig(
        address _cdpSmartAccountFactory,
        address _cdpPaymaster
    ) external onlyRole(CDP_ADMIN_ROLE) {
        cdpSmartAccountFactory = _cdpSmartAccountFactory;
        cdpPaymaster = _cdpPaymaster;
    }

    /**
     * @dev Emergency pause for CDP operations
     */
    function emergencyPause() external onlyRole(CDP_ADMIN_ROLE) {
        // Implementation would pause CDP operations
        // This is a simplified version
    }

    /**
     * @dev Emergency unpause for CDP operations
     */
    function emergencyUnpause() external onlyRole(CDP_ADMIN_ROLE) {
        // Implementation would unpause CDP operations
        // This is a simplified version
    }
}
