// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";

/**
 * @title WAGAEthiopianCompliance
 * @dev Manages Ethiopian coffee export compliance and Bank of Ethiopia integration
 * @author WAGA Team
 */
contract WAGAEthiopianCompliance is IEthiopianCompliance, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error WAGAEthiopianCompliance__EUDRCertificateExpired_addEUDRCertificate();
    error WAGAEthiopianCompliance__InvalidGeolocationData_addGeolocationData();
    error WAGAEthiopianCompliance__EUDRComplianceNotMet_validateEUDRCompliance();
    error WAGAEthiopianCompliance__InvalidSWIFTCode_registerBankingPartner();
    error WAGAEthiopianCompliance__BankAlreadyRegistered_registerBankingPartner();
    error WAGAEthiopianCompliance__SWIFTCodeAlreadyUsed_registerBankingPartner();
    error WAGAEthiopianCompliance__BankNotFound_getBankingCapabilities();
    error WAGAEthiopianCompliance__OfframpPartnerNotAssigned_assignOfframpPartner();
    error WAGAEthiopianCompliance__UnauthorizedOfframpConfirmation_confirmFiatTransferStage();
    error WAGAEthiopianCompliance__UnauthorizedBankConfirmation_confirmFiatTransferStage();
    error WAGAEthiopianCompliance__InvalidTransferStage_confirmFiatTransferStage();
    error WAGAEthiopianCompliance__UnauthorizedSellerConfirmation_confirmSellerPayment();
    error WAGAEthiopianCompliance__SellerNotRegistered_confirmSellerPayment();
    error WAGAEthiopianCompliance__PaymentAlreadyConfirmed_confirmSellerPayment();
    error WAGAEthiopianCompliance__TransferNotFound_recordOfframpTransferInitiated();
    error WAGAEthiopianCompliance__TransferAlreadyExists_recordOfframpTransferInitiated();
    error WAGAEthiopianCompliance__InvalidSellerId_getFiatTransfer();
    error WAGAEthiopianCompliance__TransferNotFound_getTransferStageStatus();
    error WAGAEthiopianCompliance__NotComplianceManager_addEUDRCertificate();
    error WAGAEthiopianCompliance__NotAuthorizedBankingPartner_addECTAPermit();
    error WAGAEthiopianCompliance__NotOriginVerifier_addOriginVerification();
    error WAGAEthiopianCompliance__NotQualityInspector_addQualityCertificate();
    error WAGAEthiopianCompliance__InvalidAccessControlAddress_constructor();
    error WAGAEthiopianCompliance__InvalidPermitNumber_addECTAPermit();
    error WAGAEthiopianCompliance__PermitExpired_addECTAPermit();
    error WAGAEthiopianCompliance__InvalidCertificateNumber_addQualityCertificate();
    error WAGAEthiopianCompliance__MoistureContentTooHigh_addQualityCertificate();
    error WAGAEthiopianCompliance__ScreenSizeTooSmall_addQualityCertificate();
    error WAGAEthiopianCompliance__InvalidRegion_addOriginVerification();
    error WAGAEthiopianCompliance__InvalidCooperativeName_addOriginVerification();
    error WAGAEthiopianCompliance__InvalidCooperativeLicense_addOriginVerification();
    error WAGAEthiopianCompliance__InvalidBankAddress_addBankingPartner();
    error WAGAEthiopianCompliance__InvalidBankName_addBankingPartner();
    error WAGAEthiopianCompliance__TradeRegistrationNotFound_registerTradeWithBoE();
    error WAGAEthiopianCompliance__FiatTransferAlreadyInitiated_registerTradeWithBoE();
    error WAGAEthiopianCompliance__FiatTransferAlreadyCompleted_registerTradeWithBoE();
    error WAGAEthiopianCompliance__UpstreamComplianceNotMet_registerTradeWithBoE();
    error WAGAEthiopianCompliance__InvalidRate_setExchangeRate();

    /* -------------------------------------------------------------------------- */
    /*                                  ROLE CONSTANTS                            */
    /* -------------------------------------------------------------------------- */

    // Role constants - use ConfigManager definitions instead of duplicating
    bytes32 private constant COMPLIANCE_MANAGER_ROLE = keccak256("COMPLIANCE_MANAGER_ROLE");
    bytes32 private constant ORIGIN_VERIFIER_ROLE = keccak256("ORIGIN_VERIFIER_ROLE");
    bytes32 private constant QUALITY_INSPECTOR_ROLE = keccak256("QUALITY_INSPECTOR_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // Compliance data mappings
    mapping(uint256 => ECTAPermit) private ectaPermits;
    mapping(uint256 => QualityCertificate) private qualityCertificates;
    mapping(uint256 => OriginVerification) private originVerifications;
    
    // Banking integration
    mapping(address => bool) private authorizedBanks;
    mapping(address => string) private bankNames;
    mapping(uint256 => mapping(address => BoETradeRegistration)) private tradeRegistrations;
    
    // USD to ETB conversion rate (stored as rate * 10^8 for precision)
    uint256 private usdToEtbRate = 5650000000; // 56.50 ETB per USD (example rate)
    uint256 private constant RATE_PRECISION = 10**8;

    // EUDR compliance data
    mapping(uint256 => EUDRCertificate) private eudrCertificates;
    mapping(uint256 => GeolocationData) private geolocationData;

    // SWIFT-based banking system
    mapping(bytes11 => BankingCapabilities) private bankCapabilitiesBySwift;
    mapping(bytes11 => address) private swiftToAddress;
    mapping(address => bytes11) private addressToSwift;
    bytes11[] private registeredSwiftCodes; // Track all registered SWIFT codes for iteration

    // Multi-stage fiat transfer tracking
    mapping(uint256 => mapping(uint64 => FiatTransfer)) private fiatTransfers;
    mapping(uint256 => mapping(uint64 => OfframpTransfer)) private offrampTransfers;

    // Contract dependencies
    IWAGACoffeeToken public coffeeToken;

    /* -------------------------------------------------------------------------- */
    /*                                 MODIFIERS                                  */
    /* -------------------------------------------------------------------------- */

    modifier onlyComplianceManager() {
        if (!coffeeToken.hasRole(COMPLIANCE_MANAGER_ROLE, msg.sender)) {
            revert WAGAEthiopianCompliance__NotComplianceManager_addEUDRCertificate();
        }
        _;
    }

    modifier onlyAuthorizedBank() {
        bytes32 bankingRole = keccak256("BANKING_PARTNER_ROLE");
        if (!coffeeToken.hasRole(bankingRole, msg.sender)) {
            revert WAGAEthiopianCompliance__NotAuthorizedBankingPartner_addECTAPermit();
        }
        _;
    }

    modifier onlyOriginVerifier() {
        if (!coffeeToken.hasRole(ORIGIN_VERIFIER_ROLE, msg.sender)) {
            revert WAGAEthiopianCompliance__NotOriginVerifier_addOriginVerification();
        }
        _;
    }

    modifier onlyQualityInspector() {
        if (!coffeeToken.hasRole(QUALITY_INSPECTOR_ROLE, msg.sender)) {
            revert WAGAEthiopianCompliance__NotQualityInspector_addQualityCertificate();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor() {
        // No role initialization needed - roles managed by coffee token
    }

    /**
     * @dev Set the coffee token contract for seller ID resolution
     * @param _coffeeToken Address of the WAGACoffeeTokenCore contract
     */
    function setCoffeeToken(address _coffeeToken) external {
        // Only allow setting if not already set or called by admin
        if (address(coffeeToken) != address(0)) {
            bytes32 adminRole = keccak256("ADMIN_ROLE");
            if (!coffeeToken.hasRole(adminRole, msg.sender)) {
                revert WAGAEthiopianCompliance__NotComplianceManager_addEUDRCertificate();
            }
        }
        if (_coffeeToken == address(0)) {
            revert WAGAEthiopianCompliance__InvalidAccessControlAddress_constructor();
        }
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
    }

    /* -------------------------------------------------------------------------- */
    /*                            COMPLIANCE FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function addECTAPermit(
        uint256 batchId,
        ECTAPermit memory permit
    ) external override onlyComplianceManager {
        if (bytes(permit.permitNumber).length == 0) {
            revert WAGAEthiopianCompliance__InvalidPermitNumber_addECTAPermit();
        }
        if (permit.expiryDate <= block.timestamp) {
            revert WAGAEthiopianCompliance__PermitExpired_addECTAPermit();
        }

        ectaPermits[batchId] = permit;
        emit ECTAPermitAdded(batchId, permit.permitNumber);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function addQualityCertificate(
        uint256 batchId,
        QualityCertificate memory certificate
    ) external override onlyQualityInspector {
        if (bytes(certificate.certificateNumber).length == 0) {
            revert WAGAEthiopianCompliance__InvalidCertificateNumber_addQualityCertificate();
        }
        if (certificate.moistureContent > 12) {
            revert WAGAEthiopianCompliance__MoistureContentTooHigh_addQualityCertificate();
        }
        if (certificate.screenSize < 14) {
            revert WAGAEthiopianCompliance__ScreenSizeTooSmall_addQualityCertificate();
        }

        qualityCertificates[batchId] = certificate;
        emit QualityCertificateAdded(batchId, certificate.certificateNumber);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function addOriginVerification(
        uint256 batchId,
        OriginVerification memory origin
    ) external override onlyOriginVerifier {
        if (bytes(origin.region).length == 0) {
            revert WAGAEthiopianCompliance__InvalidRegion_addOriginVerification();
        }
        if (bytes(origin.cooperativeName).length == 0) {
            revert WAGAEthiopianCompliance__InvalidCooperativeName_addOriginVerification();
        }
        if (bytes(origin.cooperativeLicense).length == 0) {
            revert WAGAEthiopianCompliance__InvalidCooperativeLicense_addOriginVerification();
        }

        originVerifications[batchId] = origin;
        emit OriginVerified(batchId, origin.region, origin.cooperativeName);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function validateUpstreamCompliance(uint256 batchId) external view override returns (bool isCompliant) {
        ECTAPermit memory permit = ectaPermits[batchId];
        QualityCertificate memory certificate = qualityCertificates[batchId];
        OriginVerification memory origin = originVerifications[batchId];

        return (
            permit.isValid &&
            permit.expiryDate > block.timestamp &&
            certificate.scaeCompliant &&
            origin.verified
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function addEUDRCertificate(uint256 batchId, EUDRCertificate calldata certificate) external override onlyQualityInspector {
        if (certificate.expiryDate <= block.timestamp) {
            revert WAGAEthiopianCompliance__EUDRCertificateExpired_addEUDRCertificate();
        }
        eudrCertificates[batchId] = certificate;
        emit EUDRCertificateAdded(batchId, certificate.certificateId, certificate.issuer);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function addGeolocationData(uint256 batchId, GeolocationData calldata geoData) external override onlyOriginVerifier {
        if (bytes(geoData.coordinates).length == 0) {
            revert WAGAEthiopianCompliance__InvalidGeolocationData_addGeolocationData();
        }
        geolocationData[batchId] = geoData;
        emit GeolocationDataAdded(batchId, geoData.plotType, geoData.plotSize);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function validateEUDRCompliance(uint256 batchId) external view override returns (bool isCompliant) {
        EUDRCertificate memory cert = eudrCertificates[batchId];
        GeolocationData memory geo = geolocationData[batchId];

        if (!cert.isValid || cert.expiryDate <= block.timestamp) {
            revert WAGAEthiopianCompliance__EUDRComplianceNotMet_validateEUDRCompliance();
        }

        return bytes(geo.coordinates).length > 0 && geo.plotSize > 0;
    }

    /* -------------------------------------------------------------------------- */
    /*                              SWIFT BANKING FUNCTIONS                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function registerBankingPartner(
        bytes11 swiftCode,
        address bankAddress,
        string memory bankName,
        BankingCapabilities memory capabilities
    ) external override {
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        if (!coffeeToken.hasRole(adminRole, msg.sender)) {
            revert WAGAEthiopianCompliance__NotComplianceManager_addEUDRCertificate();
        }
        if (swiftCode == bytes11(0)) {
            revert WAGAEthiopianCompliance__InvalidSWIFTCode_registerBankingPartner();
        }
        if (bankAddress == address(0)) {
            revert WAGAEthiopianCompliance__BankAlreadyRegistered_registerBankingPartner();
        }
        if (swiftToAddress[swiftCode] != address(0)) {
            revert WAGAEthiopianCompliance__SWIFTCodeAlreadyUsed_registerBankingPartner();
        }
        if (addressToSwift[bankAddress] != bytes11(0)) {
            revert WAGAEthiopianCompliance__BankAlreadyRegistered_registerBankingPartner();
        }

        capabilities.swiftCode = swiftCode;
        bankCapabilitiesBySwift[swiftCode] = capabilities;
        swiftToAddress[swiftCode] = bankAddress;
        addressToSwift[bankAddress] = swiftCode;
        registeredSwiftCodes.push(swiftCode); // Track for iteration

        // Grant banking partner role
        authorizedBanks[bankAddress] = true;
        bankNames[bankAddress] = bankName;
        // Banking partner role should be managed through coffee token

        emit BankingPartnerRegistered(swiftCode, bankAddress, bankName);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function getBankingCapabilities(bytes11 swiftCode) external view override returns (BankingCapabilities memory capabilities) {
        capabilities = bankCapabilitiesBySwift[swiftCode];
        if (capabilities.swiftCode != swiftCode) {
            revert WAGAEthiopianCompliance__BankNotFound_getBankingCapabilities();
        }
        return capabilities;
    }

    /**
     * @dev Get banking partner details by address
     * @param partner The address of the banking partner
     * @return swiftCode The SWIFT code of the partner
     * @return bankName The name of the bank
     * @return canOfframp Whether the partner can act as offramp
     */
    function getBankingPartner(address partner) external view returns (bytes11 swiftCode, string memory bankName, bool canOfframp) {
        swiftCode = addressToSwift[partner];
        if (swiftCode == bytes11(0)) {
            revert WAGAEthiopianCompliance__BankNotFound_getBankingCapabilities();
        }
        BankingCapabilities memory capabilities = bankCapabilitiesBySwift[swiftCode];
        return (swiftCode, capabilities.bankName, capabilities.canActAsOfframp);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    /**
     * @inheritdoc IEthiopianCompliance
     */
    function assignOfframpPartner(uint256 batchId) external override onlyComplianceManager returns (bytes11 offrampSwift, OfframpPartnerType partnerType) {
        // Iterate through registered banking partners to find an active offramp-capable one
        for (uint256 i = 0; i < registeredSwiftCodes.length; i++) {
            bytes11 swift = registeredSwiftCodes[i];
            BankingCapabilities memory capabilities = bankCapabilitiesBySwift[swift];
            
            // Check if this partner can act as offramp and is active
            if (capabilities.canActAsOfframp && capabilities.isActive) {
                offrampSwift = swift;
                partnerType = capabilities.partnerType;
                
                // Emit assignment event
                emit OfframpPartnerAssigned(batchId, offrampSwift, partnerType);
                
                return (offrampSwift, partnerType);
            }
        }
        
        // If no offramp partner found, revert with specific error
        revert WAGAEthiopianCompliance__OfframpPartnerNotAssigned_assignOfframpPartner();
    }

    /* -------------------------------------------------------------------------- */
    /*                           MULTI-STAGE TRANSFER FUNCTIONS                   */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function confirmFiatTransferStage(
        uint256 batchId,
        address buyer,
        TransferStage stage,
        string memory transactionId
    ) external override {
        if (address(coffeeToken) == address(0)) {
            revert WAGAEthiopianCompliance__InvalidTransferStage_confirmFiatTransferStage();
        }

        uint64 sellerId = coffeeToken.getSellerId(buyer);
        if (sellerId == 0) {
            revert WAGAEthiopianCompliance__InvalidTransferStage_confirmFiatTransferStage();
        }

        FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];

        // Verify caller authorization based on stage
        if (stage == TransferStage.USDC_CONFIRMED_BY_OFFRAMP) {
            if (swiftToAddress[transfer.offrampBankSwift] != msg.sender) {
                revert WAGAEthiopianCompliance__UnauthorizedOfframpConfirmation_confirmFiatTransferStage();
            }
        } else if (stage >= TransferStage.FIAT_CONFIRMED_BY_BANK) {
            bytes32 bankingRole = keccak256("BANKING_PARTNER_ROLE");
            if (!coffeeToken.hasRole(bankingRole, msg.sender)) {
                revert WAGAEthiopianCompliance__UnauthorizedBankConfirmation_confirmFiatTransferStage();
            }
        } else {
            revert WAGAEthiopianCompliance__InvalidTransferStage_confirmFiatTransferStage();
        }

        // Update transfer stage
        transfer.currentStage = stage;
        transfer.stageCompleted[stage] = true;
        transfer.stageTransactionIds[stage] = transactionId;
        transfer.stageTimestamps[stage] = block.timestamp;

        emit FiatTransferStageConfirmed(batchId, buyer, stage, transactionId);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function confirmSellerPayment(
        uint256 batchId,
        address buyer,
        uint256 usdAmountReceived,
        string memory sellerTransactionId
    ) external override {
        if (address(coffeeToken) == address(0)) {
            revert WAGAEthiopianCompliance__UnauthorizedSellerConfirmation_confirmSellerPayment();
        }

        uint64 sellerId = coffeeToken.getSellerId(buyer);
        if (sellerId == 0) {
            revert WAGAEthiopianCompliance__SellerNotRegistered_confirmSellerPayment();
        }

        // Only the seller can confirm their payment
        if (msg.sender != buyer) {
            revert WAGAEthiopianCompliance__UnauthorizedSellerConfirmation_confirmSellerPayment();
        }

        FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];
        if (transfer.sellerPaymentConfirmed) {
            revert WAGAEthiopianCompliance__PaymentAlreadyConfirmed_confirmSellerPayment();
        }

        // Update transfer with seller payment confirmation
        transfer.currentStage = TransferStage.SELLER_PAYMENT_CONFIRMED;
        transfer.stageCompleted[TransferStage.SELLER_PAYMENT_CONFIRMED] = true;
        transfer.stageTransactionIds[TransferStage.SELLER_PAYMENT_CONFIRMED] = sellerTransactionId;
        transfer.stageTimestamps[TransferStage.SELLER_PAYMENT_CONFIRMED] = block.timestamp;
        transfer.usdAmountReceivedBySeller = usdAmountReceived;
        transfer.sellerPaymentConfirmed = true;

        emit SellerPaymentConfirmed(batchId, buyer, sellerId, usdAmountReceived, sellerTransactionId);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function recordOfframpTransferInitiated(
        uint256 batchId,
        address buyer,
        bytes11 offrampSwift,
        uint256 usdAmount
    ) external override {
        if (address(coffeeToken) == address(0)) {
            revert WAGAEthiopianCompliance__TransferNotFound_recordOfframpTransferInitiated();
        }

        uint64 sellerId = coffeeToken.getSellerId(buyer);
        if (sellerId == 0) {
            revert WAGAEthiopianCompliance__TransferNotFound_recordOfframpTransferInitiated();
        }

        if (offrampTransfers[batchId][sellerId].offrampPartner != bytes11(0)) {
            revert WAGAEthiopianCompliance__TransferAlreadyExists_recordOfframpTransferInitiated();
        }

        offrampTransfers[batchId][sellerId] = OfframpTransfer({
            offrampPartner: offrampSwift,
            usdAmount: usdAmount,
            transferTimestamp: block.timestamp,
            transferCompleted: false,
            transferTxHash: ""
        });

        emit OfframpTransferExecuted(batchId, buyer, offrampSwift, usdAmount, block.timestamp);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function getFiatTransfer(uint256 batchId, address buyer) external view override returns (
        uint64 sellerId,
        bytes11 offrampBankSwift,
        bytes11 receivingBankSwift,
        uint256 usdAmountPaid,
        uint256 usdAmountReceivedBySeller,
        TransferStage currentStage,
        bool sellerPaymentConfirmed
    ) {
        if (address(coffeeToken) == address(0)) {
            revert WAGAEthiopianCompliance__InvalidSellerId_getFiatTransfer();
        }

        sellerId = coffeeToken.getSellerId(buyer);
        if (sellerId == 0) {
            revert WAGAEthiopianCompliance__InvalidSellerId_getFiatTransfer();
        }

        FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];

        return (
            sellerId,
            transfer.offrampBankSwift,
            transfer.receivingBankSwift,
            transfer.usdAmountPaid,
            transfer.usdAmountReceivedBySeller,
            transfer.currentStage,
            transfer.sellerPaymentConfirmed
        );
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function getTransferStageStatus(
        uint256 batchId,
        address buyer,
        TransferStage stage
    ) external view override returns (bool completed, string memory transactionId, uint256 timestamp) {
        if (address(coffeeToken) == address(0)) {
            revert WAGAEthiopianCompliance__TransferNotFound_getTransferStageStatus();
        }

        uint64 sellerId = coffeeToken.getSellerId(buyer);
        if (sellerId == 0) {
            revert WAGAEthiopianCompliance__TransferNotFound_getTransferStageStatus();
        }

        FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];

        return (
            transfer.stageCompleted[stage],
            transfer.stageTransactionIds[stage],
            transfer.stageTimestamps[stage]
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              UTILITY FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function resolveBankAddress(bytes11 swiftCode) external view override returns (address bankAddress) {
        return swiftToAddress[swiftCode];
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function resolveSwiftCode(address bankAddress) external view override returns (bytes11 swiftCode) {
        return addressToSwift[bankAddress];
    }

    /* -------------------------------------------------------------------------- */
    /*                            BANKING INTEGRATION                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function addBankingPartner(
        address bankAddress,
        string memory bankName
    ) external override {
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        if (!coffeeToken.hasRole(adminRole, msg.sender)) {
            revert WAGAEthiopianCompliance__NotComplianceManager_addEUDRCertificate();
        }
        if (bankAddress == address(0)) {
            revert WAGAEthiopianCompliance__InvalidBankAddress_addBankingPartner();
        }
        if (bytes(bankName).length == 0) {
            revert WAGAEthiopianCompliance__InvalidBankName_addBankingPartner();
        }

        authorizedBanks[bankAddress] = true;
        bankNames[bankAddress] = bankName;
        // Banking partner role should be managed through coffee token

        emit BankingPartnerAdded(bankAddress, bankName);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function removeBankingPartner(address bankAddress) external override {
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        if (!coffeeToken.hasRole(adminRole, msg.sender)) {
            revert WAGAEthiopianCompliance__NotComplianceManager_addEUDRCertificate();
        }
        
        bytes11 swiftCode = addressToSwift[bankAddress];
        if (swiftCode != bytes11(0)) {
            // Remove from mappings
            delete bankCapabilitiesBySwift[swiftCode];
            delete swiftToAddress[swiftCode];
            delete addressToSwift[bankAddress];
            
            // Remove from array (find and remove)
            for (uint256 i = 0; i < registeredSwiftCodes.length; i++) {
                if (registeredSwiftCodes[i] == swiftCode) {
                    registeredSwiftCodes[i] = registeredSwiftCodes[registeredSwiftCodes.length - 1];
                    registeredSwiftCodes.pop();
                    break;
                }
            }
        }
        
        authorizedBanks[bankAddress] = false;
        delete bankNames[bankAddress];
        // Role revoking should be managed through coffee token
        
        emit BankingPartnerRemoved(bankAddress);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function isAuthorizedBank(address bankAddress) external view override returns (bool isAuthorized) {
        return authorizedBanks[bankAddress];
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function confirmFiatTransfer(
        uint256 batchId,
        address buyer,
        string memory bankTransactionId
    ) external override onlyAuthorizedBank nonReentrant {
        BoETradeRegistration storage registration = tradeRegistrations[batchId][buyer];
        if (registration.batchId != batchId) {
            revert WAGAEthiopianCompliance__TradeRegistrationNotFound_registerTradeWithBoE();
        }
        if (!registration.fiatTransferInitiated) {
            revert WAGAEthiopianCompliance__FiatTransferAlreadyInitiated_registerTradeWithBoE();
        }
        if (registration.fiatTransferCompleted) {
            revert WAGAEthiopianCompliance__FiatTransferAlreadyCompleted_registerTradeWithBoE();
        }
        
        registration.bankTransactionId = bankTransactionId;
        
        emit FiatTransferCompleted(batchId, buyer, bankTransactionId);
        emit PhysicalShipmentAuthorized(batchId, buyer);
    }

    /* -------------------------------------------------------------------------- */
    /*                            INTERNAL FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register trade with Bank of Ethiopia (internal function called by redemption contract)
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param seller Seller wallet address
     * @param quantity Quantity in bags
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
    ) external {
        if (!coffeeToken.hasRole(COMPLIANCE_MANAGER_ROLE, msg.sender)) {
            revert WAGAEthiopianCompliance__NotComplianceManager_addEUDRCertificate();
        }
        if (!this.validateUpstreamCompliance(batchId)) {
            revert WAGAEthiopianCompliance__UpstreamComplianceNotMet_registerTradeWithBoE();
        }
        
        ECTAPermit memory permit = ectaPermits[batchId];
        QualityCertificate memory certificate = qualityCertificates[batchId];
        
        uint256 valueETB = (valueUSD * usdToEtbRate) / RATE_PRECISION;
        
        // Convert seller address to sellerId for gas-efficient storage
        uint64 sellerId = coffeeToken.getSellerId(seller);

        // Assign offramp partner dynamically instead of hardcoding
        (bytes11 assignedOfframpSwift, OfframpPartnerType assignedPartnerType) = this.assignOfframpPartner(batchId);

        BoETradeRegistration memory registration = BoETradeRegistration({
            batchId: batchId,
            sellerId: sellerId,
            buyer: buyer,
            quantity: quantity,
            valueUSD: valueUSD,
            ectaPermitNumber: permit.permitNumber,
            qualityCertificate: certificate.certificateNumber,
            exportDocuments: permit.permitDocumentHash,
            registrationTimestamp: block.timestamp,
            boERegistered: true,
            assignedOfframpPartner: assignedOfframpSwift, // Dynamically assigned
            assignedBankingPartner: "CBETETAAXXX", // Default CBE Ethiopia
            offrampType: assignedPartnerType, // Use assigned partner type
            fiatTransferInitiated: true,
            fiatTransferCompleted: false,
            bankTransactionId: "",
            sellerPaymentConfirmed: 0
        });
        
        tradeRegistrations[batchId][buyer] = registration;
        
        uint256 tradeId = uint256(keccak256(abi.encodePacked(batchId, buyer, block.timestamp)));
        
        emit TradeRegisteredWithBoE(batchId, buyer, tradeId);
        emit FiatTransferRequested(
            batchId,
            buyer,
            seller,
            valueUSD,
            valueETB,
            buyerBankDetails,
            permit.permitNumber
        );
    }

    /**
     * @dev Update USD to ETB conversion rate
     * @param newRate New conversion rate (multiplied by 10^8 for precision)
     */
    function updateUSDToETBRate(uint256 newRate) external {
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        if (!coffeeToken.hasRole(adminRole, msg.sender)) {
            revert WAGAEthiopianCompliance__NotComplianceManager_addEUDRCertificate();
        }
        if (newRate == 0) {
            revert WAGAEthiopianCompliance__InvalidRate_setExchangeRate();
        }
        usdToEtbRate = newRate;
    }

    /* -------------------------------------------------------------------------- */
    /*                                VIEW FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function getECTAPermit(uint256 batchId) external view override returns (ECTAPermit memory permit) {
        return ectaPermits[batchId];
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function getQualityCertificate(uint256 batchId) external view override returns (QualityCertificate memory certificate) {
        return qualityCertificates[batchId];
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function getOriginVerification(uint256 batchId) external view override returns (OriginVerification memory origin) {
        return originVerifications[batchId];
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function getBoETradeRegistration(
        uint256 batchId,
        address buyer
    ) external view override returns (BoETradeRegistration memory registration) {
        return tradeRegistrations[batchId][buyer];
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function getComplianceStatus(uint256 batchId) external view override returns (
        bool hasECTA,
        bool hasQuality,
        bool hasOrigin,
        bool isFullyCompliant
    ) {
        ECTAPermit memory permit = ectaPermits[batchId];
        QualityCertificate memory certificate = qualityCertificates[batchId];
        OriginVerification memory origin = originVerifications[batchId];
        
        hasECTA = permit.isValid && permit.expiryDate > block.timestamp;
        hasQuality = certificate.scaeCompliant;
        hasOrigin = origin.verified;
        isFullyCompliant = hasECTA && hasQuality && hasOrigin;
    }

    /**
     * @dev Get current USD to ETB conversion rate
     * @return rate Current conversion rate (multiplied by 10^8)
     */
    function getUSDToETBRate() external view returns (uint256 rate) {
        return usdToEtbRate;
    }

    /**
     * @dev Convert USD amount to ETB
     * @param usdAmount Amount in USD
     * @return etbAmount Amount in ETB
     */
    function convertUSDToETB(uint256 usdAmount) external view returns (uint256 etbAmount) {
        return (usdAmount * usdToEtbRate) / RATE_PRECISION;
    }

    /**
     * @dev Get count of registered banking partners
     * @return count Number of registered banking partners
     */
    function getRegisteredBankingPartnersCount() external view returns (uint256 count) {
        return registeredSwiftCodes.length;
    }

    /**
     * @dev Get registered banking partner by index
     * @param index Index in the registered partners array
     * @return swiftCode SWIFT code of the banking partner
     * @return capabilities Banking capabilities of the partner
     */
    function getRegisteredBankingPartnerByIndex(uint256 index) external view returns (bytes11 swiftCode, BankingCapabilities memory capabilities) {
        require(index < registeredSwiftCodes.length, "Index out of bounds");
        swiftCode = registeredSwiftCodes[index];
        capabilities = bankCapabilitiesBySwift[swiftCode];
        return (swiftCode, capabilities);
    }
}
