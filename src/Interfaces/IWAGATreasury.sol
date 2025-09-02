// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IWAGATreasury
 * @dev Interface for WAGA Treasury contract
 */
interface IWAGATreasury {
    // Events
    event PaymentReceived(address indexed payer, uint256 indexed batchId, uint256 amount, uint256 timestamp);
    event PaymentDistributed(address indexed recipient, uint256 amount, string reason);
    event BatchPaymentRequired(uint256 indexed batchId, uint256 amount);
    event CoinbasePaymentProcessed(address indexed user, uint256 indexed batchId, string chargeId);

    // Core functions
    function setBatchPayment(uint256 batchId, uint256 amount) external;
    function payForBatch(uint256 batchId, uint256 amount) external;
    function processCoinbasePayment(address user, uint256 batchId, uint256 amount, string calldata chargeId) external;
    function distributeFunds(address recipient, uint256 amount, string calldata reason) external;

    // View functions
    function checkPaymentStatus(address user, uint256 batchId) external view returns (bool);
    function getBatchPaymentInfo(uint256 batchId) external view returns (uint256 required, uint256 collected);
    function getTreasuryStats() external view returns (uint256 totalCollected, uint256 totalDistributed, uint256 currentBalance);

    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) external;
}
