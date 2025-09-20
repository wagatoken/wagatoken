// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";

/**
 * @title WAGAEthiopianCompliance
 * @dev Manages Ethiopian coffee export compliance and Bank of Ethiopia integration
 * @author WAGA Team
 */
contract WAGAEthiopianCompliance is IEthiopianCompliance, AccessControl, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                  ROLES                                     */
    /* -------------------------------------------------------------------------- */

    bytes32 public constant COMPLIANCE_MANAGER_ROLE = keccak256("COMPLIANCE_MANAGER_ROLE");
    bytes32 public constant BANKING_PARTNER_ROLE = keccak256("BANKING_PARTNER_ROLE");
    bytes32 public constant ORIGIN_VERIFIER_ROLE = keccak256("ORIGIN_VERIFIER_ROLE");
    bytes32 public constant QUALITY_INSPECTOR_ROLE = keccak256("QUALITY_INSPECTOR_ROLE");

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

    /* -------------------------------------------------------------------------- */
    /*                                 MODIFIERS                                  */
    /* -------------------------------------------------------------------------- */

    modifier onlyComplianceManager() {
        require(hasRole(COMPLIANCE_MANAGER_ROLE, msg.sender), "Not compliance manager");
        _;
    }

    modifier onlyAuthorizedBank() {
        require(authorizedBanks[msg.sender], "Not authorized banking partner");
        _;
    }

    modifier onlyOriginVerifier() {
        require(hasRole(ORIGIN_VERIFIER_ROLE, msg.sender), "Not origin verifier");
        _;
    }

    modifier onlyQualityInspector() {
        require(hasRole(QUALITY_INSPECTOR_ROLE, msg.sender), "Not quality inspector");
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_MANAGER_ROLE, msg.sender);
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
        require(bytes(permit.permitNumber).length > 0, "Invalid permit number");
        require(permit.expiryDate > block.timestamp, "Permit expired");
        
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
        require(bytes(certificate.certificateNumber).length > 0, "Invalid certificate number");
        require(certificate.moistureContent <= 12, "Moisture content too high"); // Max 12% for export
        require(certificate.screenSize >= 14, "Screen size too small"); // Min screen 14 for export
        
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
        require(bytes(origin.region).length > 0, "Invalid region");
        require(bytes(origin.cooperativeName).length > 0, "Invalid cooperative name");
        require(bytes(origin.cooperativeLicense).length > 0, "Invalid cooperative license");
        
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
    /*                            BANKING INTEGRATION                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function addBankingPartner(
        address bankAddress,
        string memory bankName
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bankAddress != address(0), "Invalid bank address");
        require(bytes(bankName).length > 0, "Invalid bank name");
        
        authorizedBanks[bankAddress] = true;
        bankNames[bankAddress] = bankName;
        _grantRole(BANKING_PARTNER_ROLE, bankAddress);
        
        emit BankingPartnerAdded(bankAddress, bankName);
    }

    /**
     * @inheritdoc IEthiopianCompliance
     */
    function removeBankingPartner(address bankAddress) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedBanks[bankAddress] = false;
        delete bankNames[bankAddress];
        _revokeRole(BANKING_PARTNER_ROLE, bankAddress);
        
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
        require(registration.batchId == batchId, "Trade registration not found");
        require(registration.fiatTransferInitiated, "Fiat transfer not initiated");
        require(!registration.fiatTransferCompleted, "Fiat transfer already completed");
        
        registration.fiatTransferCompleted = true;
        registration.bankTransactionId = bankTransactionId;
        registration.bankingPartner = msg.sender;
        
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
     * @param seller Seller address
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
    ) external onlyRole(COMPLIANCE_MANAGER_ROLE) {
        require(this.validateUpstreamCompliance(batchId), "Upstream compliance not met");
        
        ECTAPermit memory permit = ectaPermits[batchId];
        QualityCertificate memory certificate = qualityCertificates[batchId];
        
        uint256 valueETB = (valueUSD * usdToEtbRate) / RATE_PRECISION;
        
        BoETradeRegistration memory registration = BoETradeRegistration({
            batchId: batchId,
            buyer: buyer,
            seller: seller,
            quantity: quantity,
            valueUSD: valueUSD,
            valueETB: valueETB,
            ectaPermitNumber: permit.permitNumber,
            qualityCertificate: certificate.certificateNumber,
            exportDocuments: permit.permitDocumentHash,
            registrationTimestamp: block.timestamp,
            boERegistered: true,
            fiatTransferInitiated: true,
            fiatTransferCompleted: false,
            bankTransactionId: "",
            bankingPartner: address(0)
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
    function updateUSDToETBRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate > 0, "Invalid rate");
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
}
