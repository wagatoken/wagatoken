// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGABankingCore} from "./Interfaces/IWAGABankingCore.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {SWIFTValidationLib} from "./libraries/SWIFTValidationLib.sol";
import {BankingWorkflowLib} from "./libraries/BankingWorkflowLib.sol";

/**
 * @title WAGABankingCore
 * @dev Core banking infrastructure and SWIFT management for WAGA system
 * @notice Uses Central Authority pattern - queries WAGAConfigManager for all access control
 * @author WAGA Team
 */
contract WAGABankingCore is IWAGABankingCore, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error InvalidSWIFTCode();
    error InvalidSWIFTCodeFormat();
    error InvalidSWIFTCountryCode();
    error InvalidSWIFTBankCode();
    error UnsupportedSWIFTCountry();
    error BankAlreadyRegistered();
    error SWIFTCodeAlreadyUsed();
    error BankNotFound();
    error CallerDoesNotHaveRequiredRole();
    error InvalidAccessControlAddress();
    error InvalidBankAddress();
    error InvalidBankName();
    error InvalidRate();

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // Central Authority
    WAGAConfigManager public immutable authority;

    // Banking integration
    mapping(address => bool) private authorizedBanks;
    mapping(address => string) private bankNames;
    
    // USD to ETB conversion rate (stored as rate * 10^8 for precision)
    uint256 private usdToEtbRate = 5650000000; // 56.50 ETB per USD (example rate)
    uint256 private constant RATE_PRECISION = 10**8;

    // SWIFT-based banking system
    mapping(bytes11 => IEthiopianCompliance.BankingCapabilities) private bankCapabilitiesBySwift;
    mapping(bytes11 => address) private swiftToAddress;
    mapping(address => bytes11) private addressToSwift;
    bytes11[] private registeredSwiftCodes; // Track all registered SWIFT codes for iteration
    
    // SWIFT validation system
    mapping(bytes2 => bool) private supportedCountryCodes; // ISO 3166-1 alpha-2 country codes
    mapping(bytes4 => bool) private recognizedBankCodes; // Known bank identifier codes
    mapping(bytes11 => bool) private validatedSWIFTCodes; // Cache for validated SWIFT codes

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event BankingPartnerRegistered(bytes11 indexed swiftCode, address indexed bankAddress, string bankName);
    event BankingPartnerAdded(address indexed bankAddress, string bankName);
    event BankingPartnerRemoved(address indexed bankAddress);
    event USDToETBRateUpdated(uint256 oldRate, uint256 newRate);

    /* -------------------------------------------------------------------------- */
    /*                                 MODIFIERS                                  */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRole(bytes32 role) {
        if (!authority.hasRole(role, msg.sender)) {
            revert CallerDoesNotHaveRequiredRole();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor(address _authority) {
        if (_authority == address(0)) {
            revert InvalidAccessControlAddress();
        }
        authority = WAGAConfigManager(_authority);
        
        // Initialize supported countries for SWIFT validation
        SWIFTValidationLib.initializeSupportedCountries(supportedCountryCodes);
        SWIFTValidationLib.initializeRecognizedBanks(recognizedBankCodes);
    }

    /* -------------------------------------------------------------------------- */
    /*                          BANKING PARTNER MANAGEMENT                        */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IWAGABankingCore
     */
    function registerBankingPartner(
        bytes11 swiftCode,
        address bankAddress,
        string memory bankName,
        IEthiopianCompliance.BankingCapabilities memory capabilities
    ) external override callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        if (bankAddress == address(0)) {
            revert InvalidBankAddress();
        }
        if (bytes(bankName).length == 0) {
            revert InvalidBankName();
        }
        if (swiftToAddress[swiftCode] != address(0)) {
            revert SWIFTCodeAlreadyUsed();
        }
        if (addressToSwift[bankAddress] != bytes11(0)) {
            revert BankAlreadyRegistered();
        }

        // Validate SWIFT code using library
        _validateSWIFTCode(swiftCode);

        // Register the banking partner
        bankCapabilitiesBySwift[swiftCode] = capabilities;
        swiftToAddress[swiftCode] = bankAddress;
        addressToSwift[bankAddress] = swiftCode;
        authorizedBanks[bankAddress] = true;
        bankNames[bankAddress] = bankName;
        registeredSwiftCodes.push(swiftCode);

        emit BankingPartnerRegistered(swiftCode, bankAddress, bankName);
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function getBankingCapabilities(bytes11 swiftCode) external view override returns (IEthiopianCompliance.BankingCapabilities memory capabilities) {
        return bankCapabilitiesBySwift[swiftCode];
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function getBankingPartner(address partner) external view override returns (bytes11 swiftCode, string memory bankName, bool canOfframp) {
        swiftCode = addressToSwift[partner];
        bankName = bankNames[partner];
        
        if (swiftCode != bytes11(0)) {
            IEthiopianCompliance.BankingCapabilities memory capabilities = bankCapabilitiesBySwift[swiftCode];
            canOfframp = capabilities.canActAsOfframp;
        }
        
        return (swiftCode, bankName, canOfframp);
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function assignOfframpPartner(uint256 batchId) external view override callerHasRole(keccak256("COMPLIANCE_MANAGER_ROLE")) returns (bytes11 offrampSwift, IEthiopianCompliance.OfframpPartnerType partnerType) {
        // Simple round-robin assignment for MVP
        uint256 partnerIndex = batchId % registeredSwiftCodes.length;
        offrampSwift = registeredSwiftCodes[partnerIndex];
        
        // Check if the selected partner can handle offramp
        IEthiopianCompliance.BankingCapabilities memory capabilities = bankCapabilitiesBySwift[offrampSwift];
        
        if (capabilities.canActAsOfframp) {
            partnerType = capabilities.partnerType;
        } else {
            // Fallback to first available offramp partner
            for (uint256 i = 0; i < registeredSwiftCodes.length; i++) {
                bytes11 candidateSwift = registeredSwiftCodes[i];
                IEthiopianCompliance.BankingCapabilities memory candidateCapabilities = bankCapabilitiesBySwift[candidateSwift];
                
                if (candidateCapabilities.canActAsOfframp) {
                    offrampSwift = candidateSwift;
                    partnerType = candidateCapabilities.partnerType;
                    break;
                }
            }
        }
        
        return (offrampSwift, partnerType);
    }

    /* -------------------------------------------------------------------------- */
    /*                            BANKING INTEGRATION                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IWAGABankingCore
     */
    function addBankingPartner(
        address bankAddress,
        string memory bankName
    ) external override callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        if (bankAddress == address(0)) {
            revert InvalidBankAddress();
        }
        if (bytes(bankName).length == 0) {
            revert InvalidBankName();
        }

        authorizedBanks[bankAddress] = true;
        bankNames[bankAddress] = bankName;

        emit BankingPartnerAdded(bankAddress, bankName);
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function removeBankingPartner(address bankAddress) external override callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        if (!authorizedBanks[bankAddress]) {
            revert BankNotFound();
        }

        // Remove from authorized banks
        authorizedBanks[bankAddress] = false;
        delete bankNames[bankAddress];

        // Remove SWIFT mapping if exists
        bytes11 swiftCode = addressToSwift[bankAddress];
        if (swiftCode != bytes11(0)) {
            delete swiftToAddress[swiftCode];
            delete addressToSwift[bankAddress];
            delete bankCapabilitiesBySwift[swiftCode];
            
            // Remove from registered SWIFT codes array
            for (uint256 i = 0; i < registeredSwiftCodes.length; i++) {
                if (registeredSwiftCodes[i] == swiftCode) {
                    registeredSwiftCodes[i] = registeredSwiftCodes[registeredSwiftCodes.length - 1];
                    registeredSwiftCodes.pop();
                    break;
                }
            }
        }

        emit BankingPartnerRemoved(bankAddress);
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function isAuthorizedBank(address bankAddress) external view override returns (bool isAuthorized) {
        return authorizedBanks[bankAddress];
    }

    /* -------------------------------------------------------------------------- */
    /*                               RATE MANAGEMENT                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IWAGABankingCore
     */
    function convertUSDToETB(uint256 usdAmount) external view override returns (uint256 etbAmount) {
        return (usdAmount * usdToEtbRate) / 10**8; // RATE_PRECISION = 10**8
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function updateUSDToETBRate(uint256 newRate) external override callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        if (newRate == 0) {
            revert InvalidRate();
        }
        
        uint256 oldRate = usdToEtbRate;
        usdToEtbRate = newRate;
        
        emit USDToETBRateUpdated(oldRate, newRate);
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function getUSDToETBRate() external view override returns (uint256 rate) {
        return usdToEtbRate;
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function getRegisteredBankingPartnersCount() external view override returns (uint256 count) {
        return registeredSwiftCodes.length;
    }

    /* -------------------------------------------------------------------------- */
    /*                              UTILITY FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IWAGABankingCore
     */
    function resolveBankAddress(bytes11 swiftCode) external view override returns (address bankAddress) {
        return swiftToAddress[swiftCode];
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function resolveSwiftCode(address bankAddress) external view override returns (bytes11 swiftCode) {
        return addressToSwift[bankAddress];
    }

    /* -------------------------------------------------------------------------- */
    /*                            SWIFT VALIDATION FUNCTIONS                      */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validate SWIFT code format and content
     * @param swiftCode SWIFT code to validate
     */
    function _validateSWIFTCode(bytes11 swiftCode) internal view {
        if (swiftCode == bytes11(0)) {
            revert InvalidSWIFTCode();
        }
        
        // Check if already validated (cache)
        if (validatedSWIFTCodes[swiftCode]) {
            return;
        }
        
        // Use library for validation
        SWIFTValidationLib.validateSWIFTCode(swiftCode, supportedCountryCodes, recognizedBankCodes);
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function addSupportedCountryCode(bytes2 countryCode) external override callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        supportedCountryCodes[countryCode] = true;
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function removeSupportedCountryCode(bytes2 countryCode) external override callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        supportedCountryCodes[countryCode] = false;
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function addRecognizedBankCode(bytes4 bankCode) external override callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        recognizedBankCodes[bankCode] = true;
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function removeRecognizedBankCode(bytes4 bankCode) external override callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        recognizedBankCodes[bankCode] = false;
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function validateAndCacheSWIFTCode(bytes11 swiftCode) external override callerHasRole(keccak256("COMPLIANCE_MANAGER_ROLE")) {
        _validateSWIFTCode(swiftCode);
        validatedSWIFTCodes[swiftCode] = true;
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function isCountryCodeSupported(bytes2 countryCode) external view override returns (bool isSupported) {
        return supportedCountryCodes[countryCode];
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function isBankCodeRecognized(bytes4 bankCode) external view override returns (bool isRecognized) {
        return recognizedBankCodes[bankCode];
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function isSWIFTCodeValidated(bytes11 swiftCode) external view override returns (bool isValidated) {
        return validatedSWIFTCodes[swiftCode];
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function extractCountryCode(bytes11 swiftCode) external pure override returns (bytes2 countryCode) {
        return SWIFTValidationLib.extractCountryCode(swiftCode);
    }

    /**
     * @inheritdoc IWAGABankingCore
     */
    function extractBankCode(bytes11 swiftCode) external pure override returns (bytes4 bankCode) {
        return SWIFTValidationLib.extractBankCode(swiftCode);
    }
}