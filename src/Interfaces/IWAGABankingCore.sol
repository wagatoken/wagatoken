// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEthiopianCompliance} from "./IEthiopianCompliance.sol";

/**
 * @title IWAGABankingCore
 * @dev Interface for core banking infrastructure and SWIFT management
 */
interface IWAGABankingCore {
    
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
     * @dev Convert USD amount to ETB
     * @param usdAmount Amount in USD
     * @return etbAmount Amount in ETB
     */
    function convertUSDToETB(uint256 usdAmount) external view returns (uint256 etbAmount);

    /**
     * @dev Update USD to ETB exchange rate
     * @param newRate New exchange rate (multiplied by RATE_PRECISION)
     */
    function updateUSDToETBRate(uint256 newRate) external;

    /**
     * @dev Get current USD to ETB exchange rate
     * @return rate Current exchange rate (multiplied by RATE_PRECISION)
     */
    function getUSDToETBRate() external view returns (uint256 rate);

    /**
     * @dev Get number of registered banking partners
     * @return count Number of registered partners
     */
    function getRegisteredBankingPartnersCount() external view returns (uint256 count);

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