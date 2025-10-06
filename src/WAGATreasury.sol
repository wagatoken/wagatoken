// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IWAGATreasury} from "./Interfaces/IWAGATreasury.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {IWAGACDPIntegration} from "./Interfaces/IWAGACDPIntegration.sol";

/**
 * @title WAGATreasury
 * @dev Treasury contract for collecting USDC payments for coffee token redemptions
 * Integrates with Coinbase Commerce for cross-border payments
 */
contract WAGATreasury is IWAGATreasury, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                  ERRORS                                    */
    /* -------------------------------------------------------------------------- */

    error WAGATreasury__UnauthorizedAdmin_setBatchPayment();
    error WAGATreasury__ChargeAlreadyProcessed_processChargePayment();
    error WAGATreasury__InvalidPaymentAmount_processChargePayment();
    error WAGATreasury__InvalidRecipientAddress_distributeFunds();
    error WAGATreasury__InvalidDistributionAmount_distributeFunds();
    error WAGATreasury__InsufficientTreasuryBalance_distributeFunds();
    error WAGATreasury__USDCTransferFailed_distributeFunds();
    error WAGATreasury__InvalidBatchId_setBatchPayment();
    error WAGATreasury__InvalidPaymentAddress_processDirectPayment();
    error WAGATreasury__InsufficientPayment_processDirectPayment();
    error WAGATreasury__ZeroAddress_setUSDCAddress();
    error WAGATreasury__ZeroAddress_setCoffeeToken();
    error WAGATreasury__ZeroAddress_setCDPIntegration();
    error WAGATreasury__InvalidOfframpPartner_transferToOfframpPartner();
    error WAGATreasury__InsufficientBalance_transferToOfframpPartner();
    error WAGATreasury__InvalidOfframpPartnerAddress_transferToOfframpPartner();
    error WAGATreasury__InvalidTransferAmount_transferToOfframpPartner();
    error WAGATreasury__InsufficientTreasuryBalance_transferToOfframpPartner();
    error WAGATreasury__TransferFailed_transferToOfframpPartner();
    error WAGATreasury__UnauthorizedOfframpExecutor_transferToOfframpPartner();
    error WAGATreasury__TransferAlreadyExecuted_transferToOfframpPartner();
    error WAGATreasury__InvalidUSDCAddress_constructor();
    error WAGATreasury__InvalidPaymentAmount_payForBatch();
    error WAGATreasury__BatchPaymentNotRequired_payForBatch();
    error WAGATreasury__IncorrectPaymentAmount_payForBatch();
    error WAGATreasury__AlreadyPaidForBatch_payForBatch();
    error WAGATreasury__InsufficientUSDCBalance_payForBatch();
    error WAGATreasury__InsufficientUSDCAllowance_payForBatch();
    error WAGATreasury__USDCTransferFailed_payForBatch();
    error WAGATreasury__UnauthorizedPaymentProcessor_processCoinbasePayment();
    error WAGATreasury__UnauthorizedAdmin_distributeFunds();
    error WAGATreasury__OnlyUSDCWithdrawalsAllowed_receive();
    error WAGATreasury__InsufficientBalance_receive();
    error WAGATreasury__TransferFailed_receive();

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event USDCAddressUpdated(address indexed oldAddress, address indexed newAddress);
    event FundsDistributed(uint256 indexed batchId, address indexed seller, uint256 sellerShare, address indexed processor, uint256 processorShare);
    event OfframpTransfer(uint256 indexed batchId, address indexed offrampPartner, uint256 amount);

    /* -------------------------------------------------------------------------- */
    /*                                STATE VARIABLES                            */
    /* -------------------------------------------------------------------------- */

    // Role constants - use ConfigManager definitions instead of duplicating
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 private constant PAYMENT_PROCESSOR_ROLE = keccak256("PAYMENT_PROCESSOR_ROLE");
    bytes32 private constant OFFRAMP_EXECUTOR_ROLE = keccak256("OFFRAMP_EXECUTOR_ROLE");
    
    // Coffee token for role checks
    IWAGACoffeeToken public coffeeToken;
    IWAGACDPIntegration public cdpIntegration;
    IERC20 public usdcToken;

    // Treasury balance tracking
    uint256 public totalCollected;
    uint256 public totalDistributed;

    // Payment tracking per batch
    mapping(uint256 => uint256) public batchPaymentRequired;
    mapping(uint256 => uint256) public batchPaymentCollected;

    // User payment tracking
    mapping(address => mapping(uint256 => bool)) public hasPaidForBatch;

    // Coinbase Commerce integration
    mapping(string => bool) public processedChargeIds; // Prevent double processing

    // Offramp transfer tracking
    mapping(uint256 => mapping(address => bool)) public offrampTransferExecuted; // batchId => buyer => executed
    mapping(uint256 => mapping(address => address)) public offrampPartnerByBatchBuyer; // batchId => buyer => offrampPartner
    mapping(uint256 => mapping(address => uint256)) public offrampTransferAmount; // batchId => buyer => amount

    /* -------------------------------------------------------------------------- */
    /*                                 MODIFIERS                                  */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRole(bytes32 role) {
        if (!coffeeToken.hasRole(role, msg.sender)) {
            revert WAGATreasury__UnauthorizedAdmin_setBatchPayment(); // Generic unauthorized error
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                 CONSTRUCTOR                                */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _usdcAddress,
        address _coffeeTokenAddress,
        address _cdpIntegrationAddress
    ) {
        if (_usdcAddress == address(0)) {
            revert WAGATreasury__ZeroAddress_setUSDCAddress();
        }
        if (_coffeeTokenAddress == address(0)) {
            revert WAGATreasury__ZeroAddress_setCoffeeToken();
        }
        if (_cdpIntegrationAddress == address(0)) {
            revert WAGATreasury__ZeroAddress_setCDPIntegration();
        }
        
        usdcToken = IERC20(_usdcAddress);
        coffeeToken = IWAGACoffeeToken(_coffeeTokenAddress);
        cdpIntegration = IWAGACDPIntegration(_cdpIntegrationAddress);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ADMIN FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set the coffee token contract for role checks
     * @param _coffeeToken Address of the WAGACoffeeTokenCore contract
     */
    function setCoffeeToken(address _coffeeToken) external callerHasRole(ADMIN_ROLE) {
        if (_coffeeToken == address(0)) {
            revert WAGATreasury__ZeroAddress_setCoffeeToken();
        }
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
    }

    /**
     * @dev Set the USDC token address (admin only)
     * @param newUSDCAddress The new USDC token address
     */
    function setUSDCAddress(address newUSDCAddress) external callerHasRole(ADMIN_ROLE) {
        if (newUSDCAddress == address(0)) {
            revert WAGATreasury__ZeroAddress_setUSDCAddress();
        }
        
        address oldUSDCAddress = address(usdcToken);
        usdcToken = IERC20(newUSDCAddress);
        
        emit USDCAddressUpdated(oldUSDCAddress, newUSDCAddress);
    }

    /**
     * @dev Set the required payment amount for a batch
     * @param batchId The batch ID
     * @param amount The required payment amount in USDC (6 decimals)
     */
    function setBatchPayment(uint256 batchId, uint256 amount) external callerHasRole(ADMIN_ROLE) {
        batchPaymentRequired[batchId] = amount;
        emit BatchPaymentRequired(batchId, amount);
    }

    /* -------------------------------------------------------------------------- */
    /*                              PAYMENT FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Process payment for batch redemption using direct USDC transfer
     * @param batchId The batch ID to pay for
     * @param amount The payment amount in USDC
     */
    function payForBatch(uint256 batchId, uint256 amount) external nonReentrant {
        if (amount == 0) {
            revert WAGATreasury__InvalidPaymentAmount_payForBatch();
        }
        if (batchPaymentRequired[batchId] == 0) {
            revert WAGATreasury__BatchPaymentNotRequired_payForBatch();
        }
        if (amount != batchPaymentRequired[batchId]) {
            revert WAGATreasury__IncorrectPaymentAmount_payForBatch();
        }
        if (hasPaidForBatch[msg.sender][batchId]) {
            revert WAGATreasury__AlreadyPaidForBatch_payForBatch();
        }

        // Check if user has sufficient USDC balance
        uint256 userBalance = usdcToken.balanceOf(msg.sender);
        if (userBalance < amount) {
            revert WAGATreasury__InsufficientUSDCBalance_payForBatch();
        }

        // Check allowance
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        if (allowance < amount) {
            revert WAGATreasury__InsufficientUSDCAllowance_payForBatch();
        }

        // Transfer USDC from user to treasury
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert WAGATreasury__USDCTransferFailed_payForBatch();
        }

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
        string memory chargeId
    ) external callerHasRole(PAYMENT_PROCESSOR_ROLE) {
        if (processedChargeIds[chargeId]) {
            revert WAGATreasury__ChargeAlreadyProcessed_processChargePayment();
        }
        if (amount == 0) {
            revert WAGATreasury__InvalidPaymentAmount_processChargePayment();
        }

        // Mark charge as processed
        processedChargeIds[chargeId] = true;

        // Update payment tracking (no actual USDC transfer since Coinbase handles it)
        batchPaymentCollected[batchId] += amount;
        hasPaidForBatch[user][batchId] = true;
        totalCollected += amount;

        emit CoinbasePaymentProcessed(user, batchId, chargeId);
        emit PaymentReceived(user, batchId, amount, block.timestamp);
    }

    /* -------------------------------------------------------------------------- */
    /*                           DISTRIBUTION FUNCTIONS                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Distribute funds from treasury (admin only) - interface compatible version
     * @param recipient The recipient address
     * @param amount The amount to distribute
     * @param reason The reason for distribution
     */
    function distributeFunds(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external callerHasRole(ADMIN_ROLE) {
        if (recipient == address(0)) {
            revert WAGATreasury__InvalidRecipientAddress_distributeFunds();
        }
        if (amount == 0) {
            revert WAGATreasury__InvalidDistributionAmount_distributeFunds();
        }
        
        uint256 treasuryBalance = usdcToken.balanceOf(address(this));
        if (treasuryBalance < amount) {
            revert WAGATreasury__InsufficientTreasuryBalance_distributeFunds();
        }
        
        bool success = usdcToken.transfer(recipient, amount);
        if (!success) {
            revert WAGATreasury__USDCTransferFailed_distributeFunds();
        }
        
        totalDistributed += amount;
        
        emit PaymentDistributed(recipient, amount, reason);
    }

    /**
     * @dev Distribute funds to both seller and processor (admin only) - extended version
     * @param batchId The batch ID for tracking
     * @param seller The seller address
     * @param sellerShare The amount to distribute to seller
     * @param processor The processor address
     * @param processorShare The amount to distribute to processor
     */
    function distributeFundsDetailed(
        uint256 batchId,
        address seller,
        uint256 sellerShare,
        address processor,
        uint256 processorShare
    ) external callerHasRole(ADMIN_ROLE) {
        uint256 totalAmount = sellerShare + processorShare;
        
        if (seller == address(0) || processor == address(0)) {
            revert WAGATreasury__InvalidRecipientAddress_distributeFunds();
        }
        if (totalAmount == 0) {
            revert WAGATreasury__InvalidDistributionAmount_distributeFunds();
        }
        
        uint256 treasuryBalance = usdcToken.balanceOf(address(this));
        if (treasuryBalance < totalAmount) {
            revert WAGATreasury__InsufficientTreasuryBalance_distributeFunds();
        }
        
        // Transfer to seller
        if (sellerShare > 0) {
            bool success = usdcToken.transfer(seller, sellerShare);
            if (!success) {
                revert WAGATreasury__USDCTransferFailed_distributeFunds();
            }
        }
        
        // Transfer to processor
        if (processorShare > 0) {
            bool success = usdcToken.transfer(processor, processorShare);
            if (!success) {
                revert WAGATreasury__USDCTransferFailed_distributeFunds();
            }
        }
        
        totalDistributed += totalAmount;
        
        emit FundsDistributed(batchId, seller, sellerShare, processor, processorShare);
    }

    /* -------------------------------------------------------------------------- */
    /*                           OFFRAMP TRANSFER FUNCTIONS                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Transfer USDC to offramp partner for fiat conversion
     * @param batchId The batch ID being redeemed
     * @param buyer The buyer address (for tracking)
     * @param offrampPartner The offramp partner address to receive USDC
     * @param usdAmount The USD amount to transfer (in USDC units)
     */
    function transferToOfframpPartner(
        uint256 batchId,
        address buyer,
        address offrampPartner,
        uint256 usdAmount
    ) external callerHasRole(OFFRAMP_EXECUTOR_ROLE) nonReentrant {
        if (offrampPartner == address(0)) {
            revert WAGATreasury__InvalidOfframpPartnerAddress_transferToOfframpPartner();
        }
        if (usdAmount == 0) {
            revert WAGATreasury__InvalidTransferAmount_transferToOfframpPartner();
        }
        if (offrampTransferExecuted[batchId][buyer]) {
            revert WAGATreasury__TransferAlreadyExecuted_transferToOfframpPartner();
        }

        uint256 treasuryBalance = usdcToken.balanceOf(address(this));
        if (treasuryBalance < usdAmount) {
            revert WAGATreasury__InsufficientTreasuryBalance_transferToOfframpPartner();
        }

        // Transfer USDC to offramp partner
        bool success = usdcToken.transfer(offrampPartner, usdAmount);
        if (!success) {
            revert WAGATreasury__TransferFailed_transferToOfframpPartner();
        }

        // Record the transfer
        offrampTransferExecuted[batchId][buyer] = true;
        offrampPartnerByBatchBuyer[batchId][buyer] = offrampPartner;
        offrampTransferAmount[batchId][buyer] = usdAmount;
        totalDistributed += usdAmount;

        emit OfframpTransferExecuted(batchId, buyer, offrampPartner, usdAmount, block.timestamp);
    }

    /* -------------------------------------------------------------------------- */
    /*                              VIEW FUNCTIONS                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if offramp transfer has been executed for a batch/buyer
     * @param batchId The batch ID
     * @param buyer The buyer address
     * @return True if transfer executed
     */
    function hasOfframpTransferExecuted(uint256 batchId, address buyer) external view returns (bool) {
        return offrampTransferExecuted[batchId][buyer];
    }

    /**
     * @dev Get offramp transfer details for a batch/buyer
     * @param batchId The batch ID
     * @param buyer The buyer address
     * @return offrampPartner The offramp partner address
     * @return usdAmount The transferred USD amount
     * @return executed Whether transfer was executed
     */
    function getOfframpTransferDetails(uint256 batchId, address buyer)
        external
        view
        returns (address offrampPartner, uint256 usdAmount, bool executed)
    {
        return (
            offrampPartnerByBatchBuyer[batchId][buyer],
            offrampTransferAmount[batchId][buyer],
            offrampTransferExecuted[batchId][buyer]
        );
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

    /* -------------------------------------------------------------------------- */
    /*                             EMERGENCY FUNCTIONS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Emergency withdrawal function (admin only)
     * @param token The token to withdraw (should be USDC)
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external callerHasRole(ADMIN_ROLE) {
        if (token != address(usdcToken)) {
            revert WAGATreasury__OnlyUSDCWithdrawalsAllowed_receive();
        }

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) {
            revert WAGATreasury__InsufficientBalance_receive();
        }

        bool success = IERC20(token).transfer(msg.sender, amount);
        if (!success) {
            revert WAGATreasury__TransferFailed_receive();
        }
    }
}