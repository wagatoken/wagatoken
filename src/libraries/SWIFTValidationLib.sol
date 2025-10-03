// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SWIFTValidationLib
 * @dev Library for SWIFT code validation and parsing
 * @notice Extracted from WAGAEthiopianBanking to reduce contract size
 */
library SWIFTValidationLib {
    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error InvalidSWIFTCode();
    error InvalidSWIFTCodeFormat();
    error InvalidSWIFTCountryCode();
    error InvalidSWIFTBankCode();
    error UnsupportedSWIFTCountry();

    /* -------------------------------------------------------------------------- */
    /*                                CONSTANTS                                   */
    /* -------------------------------------------------------------------------- */

    // Common supported country codes for validation
    bytes2 private constant ET_CODE = "ET"; // Ethiopia
    bytes2 private constant US_CODE = "US"; // United States
    bytes2 private constant GB_CODE = "GB"; // United Kingdom
    bytes2 private constant DE_CODE = "DE"; // Germany
    bytes2 private constant FR_CODE = "FR"; // France
    bytes2 private constant NL_CODE = "NL"; // Netherlands
    bytes2 private constant CH_CODE = "CH"; // Switzerland
    bytes2 private constant JP_CODE = "JP"; // Japan
    bytes2 private constant SG_CODE = "SG"; // Singapore
    bytes2 private constant AE_CODE = "AE"; // UAE
    bytes2 private constant KE_CODE = "KE"; // Kenya
    bytes2 private constant ZA_CODE = "ZA"; // South Africa

    /* -------------------------------------------------------------------------- */
    /*                            VALIDATION FUNCTIONS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates SWIFT code format and checks against supported countries
     * @param swiftCode The SWIFT code to validate
     * @param supportedCountryCodes Mapping of supported country codes
     * @param recognizedBankCodes Mapping of recognized bank codes
     */
    function validateSWIFTCode(
        bytes11 swiftCode,
        mapping(bytes2 => bool) storage supportedCountryCodes,
        mapping(bytes4 => bool) storage recognizedBankCodes
    ) external view {
        if (!isValidSWIFTFormat(swiftCode)) {
            revert InvalidSWIFTCodeFormat();
        }

        bytes2 countryCode = extractCountryCode(swiftCode);
        if (!supportedCountryCodes[countryCode]) {
            revert UnsupportedSWIFTCountry();
        }

        bytes4 bankCode = extractBankCode(swiftCode);
        if (!recognizedBankCodes[bankCode]) {
            revert InvalidSWIFTBankCode();
        }
    }

    /**
     * @dev Checks if SWIFT code has valid format (8 or 11 characters)
     * @param swiftCode The SWIFT code to check
     * @return isValid True if format is valid
     */
    function isValidSWIFTFormat(bytes11 swiftCode) public pure returns (bool isValid) {
        // SWIFT codes are either 8 or 11 characters
        // Check if it's exactly 8 characters (rest should be null)
        bool isEightChar = true;
        for (uint i = 8; i < 11; i++) {
            if (swiftCode[i] != 0) {
                isEightChar = false;
                break;
            }
        }
        
        if (isEightChar) {
            // Validate 8-character format: 4 letters (bank) + 2 letters (country) + 2 alphanumeric (location)
            for (uint i = 0; i < 4; i++) {
                if (!_isLetter(swiftCode[i])) return false;
            }
            for (uint i = 4; i < 6; i++) {
                if (!_isLetter(swiftCode[i])) return false;
            }
            for (uint i = 6; i < 8; i++) {
                if (!_isAlphanumeric(swiftCode[i])) return false;
            }
            return true;
        } else {
            // Validate 11-character format: 8 chars + 3 alphanumeric (branch)
            // First validate 8-character part
            for (uint i = 0; i < 4; i++) {
                if (!_isLetter(swiftCode[i])) return false;
            }
            for (uint i = 4; i < 6; i++) {
                if (!_isLetter(swiftCode[i])) return false;
            }
            for (uint i = 6; i < 8; i++) {
                if (!_isAlphanumeric(swiftCode[i])) return false;
            }
            // Validate branch code (3 characters)
            for (uint i = 8; i < 11; i++) {
                if (!_isAlphanumeric(swiftCode[i])) return false;
            }
            return true;
        }
    }

    /**
     * @dev Extracts country code from SWIFT code
     * @param swiftCode The SWIFT code
     * @return countryCode The 2-character country code
     */
    function extractCountryCode(bytes11 swiftCode) public pure returns (bytes2 countryCode) {
        // Country code is characters 5-6 (0-indexed: 4-5)
        assembly {
            countryCode := and(shl(192, swiftCode), 0xFFFF000000000000000000000000000000000000000000000000000000000000)
        }
    }

    /**
     * @dev Extracts bank code from SWIFT code
     * @param swiftCode The SWIFT code
     * @return bankCode The 4-character bank code
     */
    function extractBankCode(bytes11 swiftCode) public pure returns (bytes4 bankCode) {
        // Bank code is characters 1-4 (0-indexed: 0-3)
        assembly {
            bankCode := and(swiftCode, 0xFFFFFFFF00000000000000000000000000000000000000000000000000000000)
        }
    }

    /**
     * @dev Initializes supported country codes
     * @param supportedCountryCodes Mapping to initialize
     */
    function initializeSupportedCountries(mapping(bytes2 => bool) storage supportedCountryCodes) external {
        supportedCountryCodes[ET_CODE] = true; // Ethiopia
        supportedCountryCodes[US_CODE] = true; // United States
        supportedCountryCodes[GB_CODE] = true; // United Kingdom
        supportedCountryCodes[DE_CODE] = true; // Germany
        supportedCountryCodes[FR_CODE] = true; // France
        supportedCountryCodes[NL_CODE] = true; // Netherlands
        supportedCountryCodes[CH_CODE] = true; // Switzerland
        supportedCountryCodes[JP_CODE] = true; // Japan
        supportedCountryCodes[SG_CODE] = true; // Singapore
        supportedCountryCodes[AE_CODE] = true; // UAE
        supportedCountryCodes[KE_CODE] = true; // Kenya
        supportedCountryCodes[ZA_CODE] = true; // South Africa
    }

    /**
     * @dev Initializes recognized bank codes for major Ethiopian and international banks
     * @param recognizedBankCodes Mapping to initialize
     */
    function initializeRecognizedBanks(mapping(bytes4 => bool) storage recognizedBankCodes) external {
        // Ethiopian Banks (first 4 characters of SWIFT codes)
        recognizedBankCodes["CBET"] = true; // Commercial Bank of Ethiopia
        recognizedBankCodes["DASH"] = true; // Dashen Bank
        recognizedBankCodes["ABAY"] = true; // Bank of Abyssinia
        recognizedBankCodes["AWAS"] = true; // Awash Bank
        recognizedBankCodes["UNIB"] = true; // United Bank
        recognizedBankCodes["NIBE"] = true; // Nib International Bank
        recognizedBankCodes["COOP"] = true; // Cooperative Bank of Oromia
        recognizedBankCodes["LIBE"] = true; // Lion International Bank
        recognizedBankCodes["ORIB"] = true; // Oromia International Bank
        recognizedBankCodes["WEGB"] = true; // Wegagen Bank
        
        // Major International Banks
        recognizedBankCodes["CHAS"] = true; // JPMorgan Chase
        recognizedBankCodes["CITI"] = true; // Citibank
        recognizedBankCodes["BOFA"] = true; // Bank of America
        recognizedBankCodes["WELL"] = true; // Wells Fargo
        recognizedBankCodes["HSBC"] = true; // HSBC
        recognizedBankCodes["BARC"] = true; // Barclays
        recognizedBankCodes["DEUT"] = true; // Deutsche Bank
        recognizedBankCodes["CRED"] = true; // Credit Suisse
        recognizedBankCodes["UBSW"] = true; // UBS
        recognizedBankCodes["SOCG"] = true; // Société Générale
        recognizedBankCodes["BNPA"] = true; // BNP Paribas
        recognizedBankCodes["RABO"] = true; // Rabobank
        recognizedBankCodes["MUFG"] = true; // MUFG Bank
        recognizedBankCodes["MIZU"] = true; // Mizuho Bank
        recognizedBankCodes["SMBC"] = true; // Sumitomo Mitsui Banking Corporation
    }

    /* -------------------------------------------------------------------------- */
    /*                               HELPER FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Checks if a byte is a letter (A-Z)
     * @param b The byte to check
     * @return True if it's a letter
     */
    function _isLetter(bytes1 b) private pure returns (bool) {
        return (b >= 0x41 && b <= 0x5A); // A-Z
    }

    /**
     * @dev Checks if a byte is alphanumeric (A-Z or 0-9)
     * @param b The byte to check
     * @return True if it's alphanumeric
     */
    function _isAlphanumeric(bytes1 b) private pure returns (bool) {
        return (b >= 0x41 && b <= 0x5A) || (b >= 0x30 && b <= 0x39); // A-Z or 0-9
    }
}