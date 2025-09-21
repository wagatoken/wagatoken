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
        uint64 sellerId;              // Digital seller ID (8 bytes vs 20 bytes)
        address buyer;
        uint256 quantity;
        uint256 valueUSD;
        string ectaPermitNumber;
        string qualityCertificate;
        string exportDocuments;
        uint256 registrationTimestamp;
        bool boERegistered;
        bytes11 assignedOfframpPartner; // SWIFT code for offramp partner
        bytes11 assignedBankingPartner; // SWIFT code for banking partner
        OfframpPartnerType offrampType;
        bool fiatTransferInitiated;
        bool fiatTransferCompleted;
        string bankTransactionId;
        uint256 sellerPaymentConfirmed; // USD equivalent received by seller
    }

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE STRUCTS                      */
    /* -------------------------------------------------------------------------- */

    struct EUDRCertificate {
        string certificateId;
        string issuer;               // "Rainforest Alliance", "Fair Trade", etc.
        uint256 issueDate;
        uint256 expiryDate;
        bool isValid;
        string geoDataHash;          // Hash of geolocation data for privacy
        string complianceLevel;      // "Gold", "Silver", "Bronze"
        string deforestationRisk;    // "Low", "Medium", "High"
    }

    struct GeolocationData {
        string plotType;             // "point" or "polygon"
        string coordinates;          // GeoJSON format hash for privacy
        uint256 plotSize;            // in hectares
        string verificationMethod;   // "GPS", "Satellite", "Survey"
    }

    /* -------------------------------------------------------------------------- */
    /*                              SWIFT BANKING STRUCTS                        */
    /* -------------------------------------------------------------------------- */

    enum OfframpPartnerType {
        DIRECT_BANK,      // Bank that handles both offramp and BoE
        NON_BANK_FINTECH, // Fintech/payment processor needing bank connection
        CRYPTO_EXCHANGE   // Crypto exchange needing bank connection
    }

    struct BankingCapabilities {
        bytes11 swiftCode;           // Primary identifier (11 bytes vs 20 bytes)
        string bankName;
        bool canActAsOfframp;        // Can receive USD funds directly
        bool canHandleForexSurrender; // Can surrender forex to BoE
        OfframpPartnerType partnerType;
        bytes11 connectedBankSwift;  // For non-bank partners
        uint256 maxTransactionAmount;
        bool isActive;
    }

    /* -------------------------------------------------------------------------- */
    /*                           MULTI-STAGE TRANSFER STRUCTS                    */
    /* -------------------------------------------------------------------------- */

    enum TransferStage {
        USDC_SENT_TO_OFFRAMP,          // Treasury -> Offramp Partner (USDC)
        USDC_CONFIRMED_BY_OFFRAMP,     // Offramp confirms USDC receipt
        FIAT_CONVERTED_AND_SENT,       // Offramp -> Bank (USD converted)
        FIAT_CONFIRMED_BY_BANK,        // Bank confirms fiat receipt from offramp
        BOE_FOREX_SURRENDERED,         // Bank -> BoE forex surrender completed
        SELLER_PAYMENT_INITIATED,      // Bank -> Seller payment initiated
        SELLER_PAYMENT_CONFIRMED       // Seller confirms USD equivalent receipt
    }

    struct FiatTransfer {
        uint256 batchId;
        uint64 sellerId;             // Digital seller ID
        bytes11 offrampBankSwift;    // SWIFT code for offramp partner
        bytes11 receivingBankSwift;  // SWIFT code for banking partner
        uint256 usdAmountPaid;
        uint256 usdAmountReceivedBySeller;
        TransferStage currentStage;
        mapping(TransferStage => bool) stageCompleted;
        mapping(TransferStage => string) stageTransactionIds;
        mapping(TransferStage => uint256) stageTimestamps;
        bool sellerPaymentConfirmed;
    }

    struct OfframpTransfer {
        bytes11 offrampPartner;      // SWIFT code of offramp partner
        uint256 usdAmount;           // USD amount transferred
        uint256 transferTimestamp;   // When transfer was initiated
        bool transferCompleted;      // Whether offramp confirmed receipt
        string transferTxHash;       // Transaction hash from offramp
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
    /*                              EUDR COMPLIANCE EVENTS                        */
    /* -------------------------------------------------------------------------- */

    event EUDRCertificateAdded(uint256 indexed batchId, string certificateId, string issuer);
    event GeolocationDataAdded(uint256 indexed batchId, string plotType, uint256 plotSize);
    event EUDRComplianceValidated(uint256 indexed batchId, bool isCompliant);

    /* -------------------------------------------------------------------------- */
    /*                              SWIFT BANKING EVENTS                          */
    /* -------------------------------------------------------------------------- */

    event BankingPartnerRegistered(bytes11 indexed swiftCode, address indexed bankAddress, string bankName);
    event OfframpPartnerAssigned(uint256 indexed batchId, bytes11 indexed offrampSwift, OfframpPartnerType partnerType);

    /* -------------------------------------------------------------------------- */
    /*                           MULTI-STAGE TRANSFER EVENTS                      */
    /* -------------------------------------------------------------------------- */

    event FiatTransferStageConfirmed(uint256 indexed batchId, address indexed buyer, TransferStage stage, string transactionId);
    event SellerPaymentInitiated(uint256 indexed batchId, address indexed buyer, uint64 indexed sellerId, uint256 usdAmount, string transactionId);
    event SellerPaymentConfirmed(uint256 indexed batchId, address indexed buyer, uint64 indexed sellerId, uint256 usdAmountReceived, string transactionId);
    event OfframpTransferExecuted(uint256 indexed batchId, address indexed buyer, bytes11 indexed offrampSwift, uint256 usdAmount, uint256 timestamp);

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

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add EUDR certificate for a batch
     * @param batchId Batch identifier
     * @param certificate EUDR certificate details
     */
    function addEUDRCertificate(uint256 batchId, EUDRCertificate calldata certificate) external;

    /**
     * @dev Add geolocation data for a batch
     * @param batchId Batch identifier
     * @param geoData Geolocation data for EUDR compliance
     */
    function addGeolocationData(uint256 batchId, GeolocationData calldata geoData) external;

    /**
     * @dev Validate EUDR compliance for a batch
     * @param batchId Batch identifier
     * @return isCompliant Whether batch meets EUDR requirements
     */
    function validateEUDRCompliance(uint256 batchId) external view returns (bool isCompliant);

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
        BankingCapabilities memory capabilities
    ) external;

    /**
     * @dev Get banking partner capabilities by SWIFT code
     * @param swiftCode Bank's SWIFT code
     * @return capabilities Banking capabilities struct
     */
    function getBankingCapabilities(bytes11 swiftCode) external view returns (BankingCapabilities memory capabilities);

    /**
     * @dev Assign offramp partner for a batch
     * @param batchId Batch identifier
     * @return offrampSwift Assigned offramp partner SWIFT code
     * @return partnerType Type of offramp partner
     */
    function assignOfframpPartner(uint256 batchId) external returns (bytes11 offrampSwift, OfframpPartnerType partnerType);

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
        TransferStage stage,
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
        TransferStage currentStage,
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
        TransferStage stage
    ) external view returns (bool completed, string memory transactionId, uint256 timestamp);

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
}
