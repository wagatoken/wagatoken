// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IWAGATreasury} from "./Interfaces/IWAGATreasury.sol";

/**
 * @title WAGATreasury
 * @dev Treasury contract for collecting USDC payments for coffee token redemptions
 * Integrates with Coinbase Commerce for cross-border payments
 */
contract WAGATreasury is IWAGATreasury, AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAYMENT_PROCESSOR_ROLE = keccak256("PAYMENT_PROCESSOR_ROLE");

    // USDC token contract on Base network
    ERC20 public usdcToken;

    // Treasury balance tracking
    uint256 public totalCollected;
    uint256 public totalDistributed;

    // Payment tracking per batch
    mapping(uint256 => uint256) public batchPaymentRequired;
    mapping(uint256 => uint256) public batchPaymentCollected;

    // User payment tracking
    mapping(address => mapping(uint256 => bool)) public hasPaidForBatch;

    // Events are inherited from IWAGATreasury interface

    // Coinbase Commerce integration
    mapping(string => bool) public processedChargeIds; // Prevent double processing

    constructor(address _usdcTokenAddress) {
        require(_usdcTokenAddress != address(0), "Invalid USDC address");

        usdcToken = ERC20(_usdcTokenAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PAYMENT_PROCESSOR_ROLE, msg.sender);
    }

    /**
     * @dev Set the required payment amount for a batch
     * @param batchId The batch ID
     * @param amount The required payment amount in USDC (6 decimals)
     */
    function setBatchPayment(uint256 batchId, uint256 amount) external onlyRole(ADMIN_ROLE) {
        batchPaymentRequired[batchId] = amount;
        emit BatchPaymentRequired(batchId, amount);
    }

    /**
     * @dev Process payment for batch redemption using direct USDC transfer
     * @param batchId The batch ID to pay for
     * @param amount The payment amount in USDC
     */
    function payForBatch(uint256 batchId, uint256 amount) external nonReentrant {
        require(amount > 0, "Payment amount must be greater than 0");
        require(batchPaymentRequired[batchId] > 0, "Batch payment not required");
        require(amount == batchPaymentRequired[batchId], "Incorrect payment amount");
        require(!hasPaidForBatch[msg.sender][batchId], "Already paid for this batch");

        // Check if user has sufficient USDC balance
        uint256 userBalance = usdcToken.balanceOf(msg.sender);
        require(userBalance >= amount, "Insufficient USDC balance");

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        require(allowance >= amount, "Insufficient USDC allowance");

        // Transfer USDC from user to treasury
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        // Update payment tracking
        batchPaymentCollected[batchId] += amount;
        hasPaidForBatch[msg.sender][batchId] = true;
        totalCollected += amount;

        emit PaymentReceived(msg.sender, batchId, amount, block.timestamp);
    }

    /**
     * @dev Process Coinbase Commerce payment (called by payment processor)
     * @param user The user who made the payment
     * @param batchId The batch ID
     * @param amount The payment amount in USDC
     * @param chargeId The Coinbase Commerce charge ID
     */
    function processCoinbasePayment(
        address user,
        uint256 batchId,
        uint256 amount,
        string calldata chargeId
    ) external onlyRole(PAYMENT_PROCESSOR_ROLE) {
        require(!processedChargeIds[chargeId], "Charge already processed");
        require(amount > 0, "Payment amount must be greater than 0");

        // Mark charge as processed
        processedChargeIds[chargeId] = true;

        // Update payment tracking (no actual USDC transfer since Coinbase handles it)
        batchPaymentCollected[batchId] += amount;
        hasPaidForBatch[user][batchId] = true;
        totalCollected += amount;

        emit CoinbasePaymentProcessed(user, batchId, chargeId);
        emit PaymentReceived(user, batchId, amount, block.timestamp);
    }

    /**
     * @dev Distribute funds from treasury (admin only)
     * @param recipient The recipient address
     * @param amount The amount to distribute
     * @param reason The reason for distribution
     */
    function distributeFunds(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Distribution amount must be greater than 0");

        uint256 treasuryBalance = usdcToken.balanceOf(address(this));
        require(treasuryBalance >= amount, "Insufficient treasury balance");

        bool success = usdcToken.transfer(recipient, amount);
        require(success, "USDC transfer failed");

        totalDistributed += amount;

        emit PaymentDistributed(recipient, amount, reason);
    }

    /**
     * @dev Check if user has paid for a specific batch
     * @param user The user address
     * @param batchId The batch ID
     * @return True if user has paid
     */
    function checkPaymentStatus(address user, uint256 batchId) external view returns (bool) {
        return hasPaidForBatch[user][batchId];
    }

    /**
     * @dev Get payment details for a batch
     * @param batchId The batch ID
     * @return required The required payment amount
     * @return collected The collected payment amount
     */
    function getBatchPaymentInfo(uint256 batchId) external view returns (uint256 required, uint256 collected) {
        return (batchPaymentRequired[batchId], batchPaymentCollected[batchId]);
    }

    /**
     * @dev Get treasury statistics
     * @return totalCollected Total USDC collected
     * @return totalDistributed Total USDC distributed
     * @return currentBalance Current treasury balance
     */
    function getTreasuryStats() external view returns (uint256, uint256, uint256) {
        uint256 currentBalance = usdcToken.balanceOf(address(this));
        return (totalCollected, totalDistributed, currentBalance);
    }

    /**
     * @dev Update USDC token address (admin only) - for testing purposes
     * @param _usdcAddress New USDC token address
     */
    function updateUSDCAddress(address _usdcAddress) external onlyRole(ADMIN_ROLE) {
        usdcToken = ERC20(_usdcAddress);
    }

    /**
     * @dev Emergency withdrawal function (admin only)
     * @param token The token to withdraw (should be USDC)
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(token == address(usdcToken), "Only USDC withdrawals allowed");

        uint256 balance = ERC20(token).balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");

        bool success = ERC20(token).transfer(msg.sender, amount);
        require(success, "Transfer failed");
    }
}
