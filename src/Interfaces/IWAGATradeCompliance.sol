// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEthiopianCompliance} from "./IEthiopianCompliance.sol";

/**
 * @title IWAGATradeCompliance
 * @dev Interface for Ethiopian trade compliance and BoE integration
 */
interface IWAGATradeCompliance {
    
    /* -------------------------------------------------------------------------- */
    /*                           MULTI-STAGE TRANSFER FUNCTIONS                   */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Confirm fiat transfer stage completion
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param stage Transfer stage being confirmed
     * @param transactionId Transaction identifier for this stage
     */
    function confirmFiatTransferStage(
        uint256 batchId,
        address buyer,
        IEthiopianCompliance.TransferStage stage,
        string memory transactionId
    ) external;

    /**
     * @dev Confirm seller payment receipt
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param usdAmountReceived USD equivalent received by seller
     * @param sellerTransactionId Seller's transaction identifier
     */
    function confirmSellerPayment(
        uint256 batchId,
        address buyer,
        uint256 usdAmountReceived,
        string memory sellerTransactionId
    ) external;

    /**
     * @dev Record offramp transfer initiation
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param offrampSwift Offramp partner SWIFT code
     * @param usdAmount USD amount transferred
     */
    function recordOfframpTransferInitiated(
        uint256 batchId,
        address buyer,
        bytes11 offrampSwift,
        uint256 usdAmount
    ) external;

    /**
     * @dev Get fiat transfer details
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @return sellerId Seller ID
     * @return offrampBankSwift Offramp bank SWIFT code
     * @return receivingBankSwift Receiving bank SWIFT code
     * @return usdAmountPaid USD amount paid
     * @return usdAmountReceivedBySeller USD amount received by seller
     * @return currentStage Current transfer stage
     * @return sellerPaymentConfirmed Whether seller payment is confirmed
     */
    function getFiatTransfer(uint256 batchId, address buyer) external view returns (
        uint64 sellerId,
        bytes11 offrampBankSwift,
        bytes11 receivingBankSwift,
        uint256 usdAmountPaid,
        uint256 usdAmountReceivedBySeller,
        IEthiopianCompliance.TransferStage currentStage,
        bool sellerPaymentConfirmed
    );

    /**
     * @dev Get transfer stage status
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param stage Stage to check
     * @return completed Whether stage is completed
     * @return transactionId Transaction ID for the stage
     * @return timestamp Timestamp when stage was completed
     */
    function getTransferStageStatus(
        uint256 batchId,
        address buyer,
        IEthiopianCompliance.TransferStage stage
    ) external view returns (bool completed, string memory transactionId, uint256 timestamp);

    /**
     * @dev Confirm fiat transfer completion (called by banking partner)
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param bankTransactionId Bank transaction identifier
     */
    function confirmFiatTransfer(
        uint256 batchId,
        address buyer,
        string memory bankTransactionId
    ) external;

    /* -------------------------------------------------------------------------- */
    /*                         BANK OF ETHIOPIA INTEGRATION                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register trade with Bank of Ethiopia
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param seller Seller wallet address
     * @param quantity Quantity being traded
     * @param valueUSD Value in USD
     * @param buyerBankDetails Buyer's banking information
     */
    function registerTradeWithBoE(
        uint256 batchId,
        address buyer,
        address seller,
        uint256 quantity,
        uint256 valueUSD,
        string memory buyerBankDetails
    ) external;

    /**
     * @dev Get BoE trade registration details
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @return registration BoE trade registration details
     */
    function getBoETradeRegistration(
        uint256 batchId,
        address buyer
    ) external view returns (IEthiopianCompliance.BoETradeRegistration memory registration);

    /* -------------------------------------------------------------------------- */
    /*                              CONFIGURATION                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set the banking core contract address
     * @param _bankingCore Address of WAGABankingCore contract
     */
    function setBankingCore(address _bankingCore) external;

    /**
     * @dev Set the coffee token contract address
     * @param _coffeeToken Address of coffee token contract
     */
    function setCoffeeToken(address _coffeeToken) external;

    /**
     * @dev Set the compliance core contract address
     * @param _complianceCore Address of compliance core contract
     */
    function setComplianceCore(address _complianceCore) external;

    /**
     * @dev Get banking core contract address
     * @return Address of banking core contract
     */
    function getBankingCore() external view returns (address);
}