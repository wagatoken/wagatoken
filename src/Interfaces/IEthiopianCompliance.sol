// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IEthiopianCompliance
 * @dev Interface for Ethiopian coffee export compliance and Bank of Ethiopia integration
 */
interface IEthiopianCompliance {
    /* -------------------------------------------------------------------------- */
    /*                                  STRUCTS                                   */
    /* -------------------------------------------------------------------------- */

    struct ECTAPermit {
        string permitNumber;
        string exporterName;
        string exporterLicense;
        uint256 issueDate;
        uint256 expiryDate;
        bool isValid;
        string permitDocumentHash;
    }

    struct QualityCertificate {
        string certificateNumber;
        string gradingResult;
        uint256 moistureContent;
        uint256 screenSize;
        bool scaeCompliant;
        uint256 issueDate;
        string certificateHash;
        string inspectorId;
    }

    struct OriginVerification {
        string region;
        string woreda;
        string kebele;
        string cooperativeName;
        string cooperativeLicense;
        bool verified;
        uint256 verificationDate;
        string verificationDocumentHash;
    }

    struct BoETradeRegistration {
        uint256 batchId;
        address buyer;
        address seller;
        uint256 quantity;
        uint256 valueUSD;
        uint256 valueETB;
        string ectaPermitNumber;
        string qualityCertificate;
        string exportDocuments;
        uint256 registrationTimestamp;
        bool boERegistered;
        bool fiatTransferInitiated;
        bool fiatTransferCompleted;
        string bankTransactionId;
        address bankingPartner;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event ECTAPermitAdded(uint256 indexed batchId, string permitNumber);
    event QualityCertificateAdded(uint256 indexed batchId, string certificateNumber);
    event OriginVerified(uint256 indexed batchId, string region, string cooperativeName);
    event TradeRegisteredWithBoE(uint256 indexed batchId, address indexed buyer, uint256 tradeId);
    event FiatTransferRequested(
        uint256 indexed batchId,
        address indexed buyer,
        address indexed seller,
        uint256 valueUSD,
        uint256 valueETB,
        string buyerBankDetails,
        string ectaPermitNumber
    );
    event FiatTransferCompleted(uint256 indexed batchId, address indexed buyer, string bankTransactionId);
    event BankingPartnerAdded(address indexed bankAddress, string bankName);
    event BankingPartnerRemoved(address indexed bankAddress);
    event PhysicalShipmentAuthorized(uint256 indexed batchId, address indexed buyer);

    /* -------------------------------------------------------------------------- */
    /*                              COMPLIANCE FUNCTIONS                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add ECTA permit information for a batch
     * @param batchId Batch identifier
     * @param permit ECTA permit details
     */
    function addECTAPermit(uint256 batchId, ECTAPermit memory permit) external;

    /**
     * @dev Add quality certificate for a batch
     * @param batchId Batch identifier
     * @param certificate Quality certificate details
     */
    function addQualityCertificate(uint256 batchId, QualityCertificate memory certificate) external;

    /**
     * @dev Add origin verification for a batch
     * @param batchId Batch identifier
     * @param origin Origin verification details
     */
    function addOriginVerification(uint256 batchId, OriginVerification memory origin) external;

    /**
     * @dev Validate all upstream compliance for a batch
     * @param batchId Batch identifier
     * @return isCompliant True if all compliance requirements are met
     */
    function validateUpstreamCompliance(uint256 batchId) external view returns (bool isCompliant);

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
     * @param seller Seller address
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

    /* -------------------------------------------------------------------------- */
    /*                                VIEW FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get ECTA permit information for a batch
     * @param batchId Batch identifier
     * @return permit ECTA permit details
     */
    function getECTAPermit(uint256 batchId) external view returns (ECTAPermit memory permit);

    /**
     * @dev Get quality certificate for a batch
     * @param batchId Batch identifier
     * @return certificate Quality certificate details
     */
    function getQualityCertificate(uint256 batchId) external view returns (QualityCertificate memory certificate);

    /**
     * @dev Get origin verification for a batch
     * @param batchId Batch identifier
     * @return origin Origin verification details
     */
    function getOriginVerification(uint256 batchId) external view returns (OriginVerification memory origin);

    /**
     * @dev Get BoE trade registration details
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @return registration BoE trade registration details
     */
    function getBoETradeRegistration(
        uint256 batchId,
        address buyer
    ) external view returns (BoETradeRegistration memory registration);

    /**
     * @dev Get compliance status summary for a batch
     * @param batchId Batch identifier
     * @return hasECTA Has valid ECTA permit
     * @return hasQuality Has valid quality certificate
     * @return hasOrigin Has verified origin
     * @return isFullyCompliant All compliance requirements met
     */
    function getComplianceStatus(uint256 batchId) external view returns (
        bool hasECTA,
        bool hasQuality,
        bool hasOrigin,
        bool isFullyCompliant
    );

    /**
     * @dev Convert USD amount to ETB
     * @param usdAmount Amount in USD
     * @return etbAmount Amount in ETB
     */
    function convertUSDToETB(uint256 usdAmount) external view returns (uint256 etbAmount);
}
