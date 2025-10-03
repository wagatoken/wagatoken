// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEthiopianCompliance} from "./IEthiopianCompliance.sol";

/**
 * @title IWAGAEthiopianBanking
 * @dev Interface for Ethiopian banking integration and multi-stage transfers
 */
interface IWAGAEthiopianBanking {
    
    /* -------------------------------------------------------------------------- */
    /*                              SWIFT BANKING FUNCTIONS                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register banking partner with SWIFT code
     * @param swiftCode Bank's SWIFT code (11 characters)
     * @param bankAddress Bank's Ethereum address
     * @param bankName Bank's name
     * @param capabilities Bank's capabilities struct
     */
    function registerBankingPartner(
        bytes11 swiftCode,
        address bankAddress,
        string memory bankName,
        IEthiopianCompliance.BankingCapabilities memory capabilities
    ) external;

    /**
     * @dev Get banking partner capabilities by SWIFT code
     * @param swiftCode Bank's SWIFT code
     * @return capabilities Banking capabilities struct
     */
    function getBankingCapabilities(bytes11 swiftCode) external view returns (IEthiopianCompliance.BankingCapabilities memory capabilities);

    /**
     * @dev Get banking partner details by address
     * @param partner The address of the banking partner
     * @return swiftCode The SWIFT code of the partner
     * @return bankName The name of the bank
     * @return canOfframp Whether the partner can act as offramp
     */
    function getBankingPartner(address partner) external view returns (bytes11 swiftCode, string memory bankName, bool canOfframp);

    /**
     * @dev Assign offramp partner for a batch
     * @param batchId Batch identifier
     * @return offrampSwift Assigned offramp partner SWIFT code
     * @return partnerType Type of offramp partner
     */
    function assignOfframpPartner(uint256 batchId) external returns (bytes11 offrampSwift, IEthiopianCompliance.OfframpPartnerType partnerType);

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

    /* -------------------------------------------------------------------------- */
    /*                            BANKING INTEGRATION                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add authorized banking partner
     * @param bankAddress Banking partner contract address
     * @param bankName Name of the banking institution
     */
    function addBankingPartner(address bankAddress, string memory bankName) external;

    /**
     * @dev Remove banking partner authorization
     * @param bankAddress Banking partner contract address
     */
    function removeBankingPartner(address bankAddress) external;

    /**
     * @dev Check if address is authorized banking partner
     * @param bankAddress Address to check
     * @return isAuthorized True if authorized
     */
    function isAuthorizedBank(address bankAddress) external view returns (bool isAuthorized);

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

    /**
     * @dev Convert USD amount to ETB
     * @param usdAmount Amount in USD
     * @return etbAmount Amount in ETB
     */
    function convertUSDToETB(uint256 usdAmount) external view returns (uint256 etbAmount);

    /* -------------------------------------------------------------------------- */
    /*                              UTILITY FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Resolve SWIFT code to Ethereum address
     * @param swiftCode Bank's SWIFT code
     * @return bankAddress Bank's Ethereum address
     */
    function resolveBankAddress(bytes11 swiftCode) external view returns (address bankAddress);

    /**
     * @dev Resolve Ethereum address to SWIFT code
     * @param bankAddress Bank's Ethereum address
     * @return swiftCode Bank's SWIFT code
     */
    function resolveSwiftCode(address bankAddress) external view returns (bytes11 swiftCode);

    /* -------------------------------------------------------------------------- */
    /*                            SWIFT VALIDATION FUNCTIONS                      */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add supported country code for SWIFT validation
     * @param countryCode ISO 3166-1 alpha-2 country code
     */
    function addSupportedCountryCode(bytes2 countryCode) external;

    /**
     * @dev Remove supported country code
     * @param countryCode ISO 3166-1 alpha-2 country code
     */
    function removeSupportedCountryCode(bytes2 countryCode) external;

    /**
     * @dev Add recognized bank code for validation
     * @param bankCode 4-character bank identifier
     */
    function addRecognizedBankCode(bytes4 bankCode) external;

    /**
     * @dev Remove recognized bank code
     * @param bankCode 4-character bank identifier
     */
    function removeRecognizedBankCode(bytes4 bankCode) external;

    /**
     * @dev Validate and cache a SWIFT code
     * @param swiftCode SWIFT code to validate and cache
     */
    function validateAndCacheSWIFTCode(bytes11 swiftCode) external;

    /**
     * @dev Check if country code is supported
     * @param countryCode ISO 3166-1 alpha-2 country code
     * @return isSupported Whether the country is supported
     */
    function isCountryCodeSupported(bytes2 countryCode) external view returns (bool isSupported);

    /**
     * @dev Check if bank code is recognized
     * @param bankCode 4-character bank identifier
     * @return isRecognized Whether the bank code is recognized
     */
    function isBankCodeRecognized(bytes4 bankCode) external view returns (bool isRecognized);

    /**
     * @dev Check if SWIFT code is cached as validated
     * @param swiftCode SWIFT code to check
     * @return isValidated Whether the SWIFT code is cached as validated
     */
    function isSWIFTCodeValidated(bytes11 swiftCode) external view returns (bool isValidated);

    /**
     * @dev Extract country code from SWIFT code
     * @param swiftCode SWIFT code
     * @return countryCode Extracted country code
     */
    function extractCountryCode(bytes11 swiftCode) external pure returns (bytes2 countryCode);

    /**
     * @dev Extract bank code from SWIFT code
     * @param swiftCode SWIFT code
     * @return bankCode Extracted bank code
     */
    function extractBankCode(bytes11 swiftCode) external pure returns (bytes4 bankCode);
}