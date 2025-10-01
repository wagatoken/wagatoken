// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EthiopianComplianceLib
 * @dev Library for Ethiopian coffee export compliance operations
 * @notice Extracted from WAGAEthiopianCompliance to reduce contract size
 */
library EthiopianComplianceLib {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */
    
    event CertificateGenerated(uint256 indexed batchId, bytes32 certificateHash, address indexed issuer);
    event CertificateVerified(uint256 indexed batchId, bytes32 certificateHash, bool isValid);
    event BankingTransactionInitiated(uint256 indexed batchId, bytes32 transactionId, uint256 amount);
    event BankingTransactionCompleted(uint256 indexed batchId, bytes32 transactionId, bool success);
    event ComplianceStatusUpdated(uint256 indexed batchId, uint8 status);
    
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error EthiopianComplianceLib__InvalidBatchId();
    error EthiopianComplianceLib__InvalidCertificate();
    error EthiopianComplianceLib__InvalidBankingData();
    error EthiopianComplianceLib__UnauthorizedIssuer();
    error EthiopianComplianceLib__CertificateExpired();
    error EthiopianComplianceLib__InvalidComplianceStatus();
    error EthiopianComplianceLib__InsufficientDocumentation();

    /* -------------------------------------------------------------------------- */
    /*                                   Enums                                   */
    /* -------------------------------------------------------------------------- */

    enum ComplianceStatus {
        PENDING,           // Initial status
        DOCUMENTS_SUBMITTED, // All required documents submitted
        EUDR_VERIFIED,     // EUDR compliance verified
        BANK_APPROVED,     // Bank of Ethiopia approval received
        EXPORT_CLEARED,    // Ready for export
        REJECTED           // Compliance failed
    }

    enum CertificateType {
        EUDR_CERTIFICATE,
        ORIGIN_CERTIFICATE,
        QUALITY_CERTIFICATE,
        PHYTOSANITARY_CERTIFICATE,
        EXPORT_LICENSE
    }

    /* -------------------------------------------------------------------------- */
    /*                                  Structs                                  */
    /* -------------------------------------------------------------------------- */

    struct EUDRCertificate {
        bytes32 certificateHash;
        address issuer;
        uint256 issuanceDate;
        uint256 expiryDate;
        bool isValid;
        string ipfsHash;
        string geolocationData;
        string deforestationProof;
    }

    struct BankingTransaction {
        bytes32 transactionId;
        uint256 amount;
        string swiftCode;
        string beneficiaryAccount;
        string purposeCode;
        uint256 transactionDate;
        bool isCompleted;
        string bankReference;
    }

    struct ComplianceRecord {
        uint256 batchId;
        ComplianceStatus status;
        mapping(CertificateType => EUDRCertificate) certificates;
        BankingTransaction bankingInfo;
        uint256 lastUpdated;
        address lastUpdatedBy;
        string[] requiredDocuments;
        mapping(string => bool) documentSubmitted;
    }

    /* -------------------------------------------------------------------------- */
    /*                           Certificate Management                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Generates an EUDR certificate for a batch
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @param certificateType Type of certificate
     * @param ipfsHash IPFS hash of certificate document
     * @param geolocationData GPS coordinates of origin
     * @param deforestationProof Proof of no deforestation
     * @param issuer Address of certificate issuer
     * @return certificateHash Generated certificate hash
     */
    function generateCertificate(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId,
        CertificateType certificateType,
        string memory ipfsHash,
        string memory geolocationData,
        string memory deforestationProof,
        address issuer
    ) external returns (bytes32 certificateHash) {
        if (batchId == 0) revert EthiopianComplianceLib__InvalidBatchId();
        if (issuer == address(0)) revert EthiopianComplianceLib__UnauthorizedIssuer();

        // Generate certificate hash
        certificateHash = keccak256(
            abi.encodePacked(
                batchId,
                certificateType,
                ipfsHash,
                geolocationData,
                deforestationProof,
                block.timestamp,
                issuer
            )
        );

        // Store certificate
        records[batchId].certificates[certificateType] = EUDRCertificate({
            certificateHash: certificateHash,
            issuer: issuer,
            issuanceDate: block.timestamp,
            expiryDate: block.timestamp + 365 days, // Valid for 1 year
            isValid: true,
            ipfsHash: ipfsHash,
            geolocationData: geolocationData,
            deforestationProof: deforestationProof
        });

        emit CertificateGenerated(batchId, certificateHash, issuer);
        return certificateHash;
    }

    /**
     * @dev Verifies a certificate for a batch
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @param certificateType Type of certificate to verify
     * @param expectedHash Expected certificate hash
     * @return isValid True if certificate is valid
     */
    function verifyCertificate(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId,
        CertificateType certificateType,
        bytes32 expectedHash
    ) external view returns (bool isValid) {
        EUDRCertificate storage cert = records[batchId].certificates[certificateType];
        
        // Check if certificate exists and matches
        if (cert.certificateHash != expectedHash) return false;
        
        // Check if certificate is not expired
        if (block.timestamp > cert.expiryDate) return false;
        
        // Check if certificate is still valid
        if (!cert.isValid) return false;
        
        return true;
    }

    /* -------------------------------------------------------------------------- */
    /*                            Banking Integration                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Initiates a banking transaction for export
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @param amount Transaction amount in USD cents
     * @param swiftCode Bank SWIFT code
     * @param beneficiaryAccount Beneficiary account details
     * @param purposeCode Transaction purpose code
     * @return transactionId Generated transaction ID
     */
    function initiateBankingTransaction(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId,
        uint256 amount,
        string memory swiftCode,
        string memory beneficiaryAccount,
        string memory purposeCode
    ) external returns (bytes32 transactionId) {
        if (batchId == 0) revert EthiopianComplianceLib__InvalidBatchId();
        if (amount == 0) revert EthiopianComplianceLib__InvalidBankingData();
        if (bytes(swiftCode).length == 0) revert EthiopianComplianceLib__InvalidBankingData();

        // Generate transaction ID
        transactionId = keccak256(
            abi.encodePacked(
                batchId,
                amount,
                swiftCode,
                beneficiaryAccount,
                purposeCode,
                block.timestamp
            )
        );

        // Store banking transaction
        records[batchId].bankingInfo = BankingTransaction({
            transactionId: transactionId,
            amount: amount,
            swiftCode: swiftCode,
            beneficiaryAccount: beneficiaryAccount,
            purposeCode: purposeCode,
            transactionDate: block.timestamp,
            isCompleted: false,
            bankReference: ""
        });

        emit BankingTransactionInitiated(batchId, transactionId, amount);
        return transactionId;
    }

    /**
     * @dev Completes a banking transaction
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @param transactionId Transaction ID to complete
     * @param bankReference Bank reference number
     * @param success Whether transaction was successful
     */
    function completeBankingTransaction(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId,
        bytes32 transactionId,
        string memory bankReference,
        bool success
    ) external {
        BankingTransaction storage txn = records[batchId].bankingInfo;
        
        if (txn.transactionId != transactionId) {
            revert EthiopianComplianceLib__InvalidBankingData();
        }

        txn.isCompleted = true;
        txn.bankReference = bankReference;

        emit BankingTransactionCompleted(batchId, transactionId, success);
    }

    /* -------------------------------------------------------------------------- */
    /*                           Compliance Management                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Updates compliance status for a batch
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @param newStatus New compliance status
     * @param updatedBy Address updating the status
     */
    function updateComplianceStatus(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId,
        ComplianceStatus newStatus,
        address updatedBy
    ) external {
        if (batchId == 0) revert EthiopianComplianceLib__InvalidBatchId();
        if (updatedBy == address(0)) revert EthiopianComplianceLib__UnauthorizedIssuer();

        ComplianceRecord storage record = records[batchId];
        record.status = newStatus;
        record.lastUpdated = block.timestamp;
        record.lastUpdatedBy = updatedBy;

        emit ComplianceStatusUpdated(batchId, uint8(newStatus));
    }

    /**
     * @dev Checks if all required documents are submitted
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @return allSubmitted True if all documents are submitted
     */
    function checkDocumentCompleteness(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId
    ) external view returns (bool allSubmitted) {
        ComplianceRecord storage record = records[batchId];
        
        for (uint256 i = 0; i < record.requiredDocuments.length; i++) {
            if (!record.documentSubmitted[record.requiredDocuments[i]]) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Submits a required document
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @param documentType Type of document being submitted
     */
    function submitDocument(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId,
        string memory documentType
    ) external {
        if (batchId == 0) revert EthiopianComplianceLib__InvalidBatchId();
        
        records[batchId].documentSubmitted[documentType] = true;
    }

    /* -------------------------------------------------------------------------- */
    /*                              EUDR Validation                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates EUDR compliance for a batch
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @return isCompliant True if EUDR compliant
     */
    function validateEUDRCompliance(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId
    ) external view returns (bool isCompliant) {
        // Check if EUDR certificate exists and is valid
        EUDRCertificate storage eudrCert = records[batchId].certificates[CertificateType.EUDR_CERTIFICATE];
        
        if (eudrCert.certificateHash == bytes32(0)) return false;
        if (!eudrCert.isValid) return false;
        if (block.timestamp > eudrCert.expiryDate) return false;
        if (bytes(eudrCert.geolocationData).length == 0) return false;
        if (bytes(eudrCert.deforestationProof).length == 0) return false;
        
        return true;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Utility Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Gets compliance record for a batch
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @return status Current compliance status
     * @return lastUpdated Last update timestamp
     * @return lastUpdatedBy Last updater address
     */
    function getComplianceRecord(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId
    ) external view returns (
        ComplianceStatus status,
        uint256 lastUpdated,
        address lastUpdatedBy
    ) {
        ComplianceRecord storage record = records[batchId];
        return (record.status, record.lastUpdated, record.lastUpdatedBy);
    }

    /**
     * @dev Gets certificate information
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @param certificateType Type of certificate
     * @return certificate The certificate data
     */
    function getCertificate(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId,
        CertificateType certificateType
    ) external view returns (EUDRCertificate memory certificate) {
        return records[batchId].certificates[certificateType];
    }

    /**
     * @dev Gets banking transaction information
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @return transaction The banking transaction data
     */
    function getBankingTransaction(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId
    ) external view returns (BankingTransaction memory transaction) {
        return records[batchId].bankingInfo;
    }

    /**
     * @dev Initializes required documents for a batch
     * @param records Storage reference to compliance records
     * @param batchId The batch ID
     * @param requiredDocs Array of required document types
     */
    function initializeRequiredDocuments(
        mapping(uint256 => ComplianceRecord) storage records,
        uint256 batchId,
        string[] memory requiredDocs
    ) external {
        ComplianceRecord storage record = records[batchId];
        record.requiredDocuments = requiredDocs;
        record.batchId = batchId;
        record.status = ComplianceStatus.PENDING;
        record.lastUpdated = block.timestamp;
    }
}