// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IWAGACDPIntegration
 * @dev Interface for WAGA Coinbase Developer Platform integration
 */
interface IWAGACDPIntegration {
    // Enums
    enum PaymentStatus {
        Pending,
        Confirmed,
        Failed,
        Refunded
    }

    // Structs
    struct CDPPayment {
        address user;
        uint256 batchId;
        uint256 amount;
        string chargeId;
        uint256 timestamp;
        PaymentStatus status;
    }

    // Events
    event CDPPaymentInitiated(address indexed user, uint256 indexed batchId, uint256 amount, string chargeId);
    event CDPPaymentConfirmed(address indexed user, uint256 indexed batchId, string chargeId);
    event SmartAccountCreated(address indexed user, address indexed smartAccount);
    event CDPWebhookProcessed(bytes32 indexed webhookId, bool success);

    // Core functions
    function createSmartAccount(address user) external returns (address);
    function initiateCDPPayment(address user, uint256 batchId, uint256 amount, string calldata chargeId) external;
    function confirmCDPPayment(string calldata chargeId, bool success) external;
    function processCDPWebhook(bytes calldata webhookData, bytes calldata signature) external returns (bool);
    function processCrossBorderPayment(address user, uint256 batchId, uint256 amount, string calldata destinationCurrency) external returns (string memory);

    // View functions
    function getCDPPayment(string calldata chargeId) external view returns (CDPPayment memory);
    function getUserSmartAccount(address user) external view returns (address);

    // Admin functions
    function updateCDPConfig(address _cdpSmartAccountFactory, address _cdpPaymaster) external;
    function emergencyPause() external;
    function emergencyUnpause() external;
}
