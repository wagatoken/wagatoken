// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title IComplianceVerifier
 * @dev Interface for compliance verification with privacy protection
 * @dev Supports regulatory, quality, and supply chain compliance verification
 */
interface IComplianceVerifier {
    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                   */
    /* -------------------------------------------------------------------------- */
    error IComplianceVerifier__InvalidComplianceType_verifyCompliance();
    error IComplianceVerifier__ComplianceVerificationFailed_verifyCompliance();
    error IComplianceVerifier__InvalidProofData_verifyCompliance();
    error IComplianceVerifier__ComplianceExpired_verifyCompliance();
    error IComplianceVerifier__UnauthorizedCaller_verifyCompliance();
    error IComplianceVerifier__ComplianceNotFound_getComplianceStatus();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    enum ComplianceType {
        QUALITY_STANDARDS,        // Quality compliance (ISO, organic, etc.)
        SUPPLY_CHAIN_TRACEABILITY, // Supply chain traceability compliance
        REGULATORY_REQUIREMENTS,  // Regulatory compliance (FDA, EU, etc.)
        ENVIRONMENTAL_STANDARDS,  // Environmental compliance (carbon footprint, etc.)
        FAIR_TRADE_CERTIFICATION, // Fair trade certification
        ORGANIC_CERTIFICATION,   // Organic certification
        SUSTAINABILITY_STANDARDS, // Sustainability compliance
        CUSTOM_COMPLIANCE        // Custom compliance requirements
    }

    struct ComplianceProof {
        bytes32 proofHash;
        uint256 proofTimestamp;
        address proofGenerator;
        ComplianceType complianceType;
        bool isValid;
        string complianceDescription;
        bytes32 verificationKey;
        uint256 expiryTimestamp;
    }

    struct ComplianceRequirement {
        ComplianceType complianceType;
        string requirementDescription;
        bool isRequired;
        uint256 validityPeriod;
        bytes32 verificationKey;
    }

    struct ComplianceStatus {
        uint256 batchId;
        ComplianceType complianceType;
        bool isCompliant;
        uint256 lastVerifiedTimestamp;
        uint256 expiryTimestamp;
        string complianceDetails;
        bytes32 proofHash;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ComplianceVerified(
        uint256 indexed batchId,
        ComplianceType indexed complianceType,
        address indexed verifier,
        bool isCompliant
    );

    event ComplianceProofRegistered(
        uint256 indexed batchId,
        ComplianceType indexed complianceType,
        bytes32 indexed proofHash,
        address generator
    );

    event ComplianceRequirementUpdated(
        ComplianceType indexed complianceType,
        string requirementDescription,
        bool isRequired,
        uint256 validityPeriod
    );

    event ComplianceExpired(
        uint256 indexed batchId,
        ComplianceType indexed complianceType,
        uint256 expiryTimestamp
    );

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify compliance for a batch
     * @param batchId Batch identifier
     * @param complianceType Type of compliance to verify
     * @param proofData Compliance proof data
     * @return isCompliant Whether the batch is compliant
     */
    function verifyCompliance(
        uint256 batchId,
        ComplianceType complianceType,
        bytes calldata proofData
    ) external returns (bool isCompliant);

    /**
     * @dev Verify compliance with metadata
     * @param batchId Batch identifier
     * @param complianceType Type of compliance to verify
     * @param proofData Compliance proof data
     * @param metadata Additional metadata for verification
     * @return isCompliant Whether the batch is compliant
     */
    function verifyComplianceWithMetadata(
        uint256 batchId,
        ComplianceType complianceType,
        bytes calldata proofData,
        bytes calldata metadata
    ) external returns (bool isCompliant);

    /**
     * @dev Register a compliance proof
     * @param batchId Batch identifier
     * @param complianceType Type of compliance
     * @param proofHash Hash of the compliance proof
     * @param complianceDescription Description of compliance
     * @return success Whether registration was successful
     */
    function registerComplianceProof(
        uint256 batchId,
        ComplianceType complianceType,
        bytes32 proofHash,
        string calldata complianceDescription
    ) external returns (bool success);

    /**
     * @dev Get compliance status for a batch
     * @param batchId Batch identifier
     * @param complianceType Type of compliance
     * @return complianceStatus Compliance status
     */
    function getComplianceStatus(
        uint256 batchId,
        ComplianceType complianceType
    ) external view returns (ComplianceStatus memory complianceStatus);

    /**
     * @dev Check if batch is compliant
     * @param batchId Batch identifier
     * @param complianceType Type of compliance
     * @return isCompliant Whether the batch is compliant
     */
    function isCompliant(
        uint256 batchId,
        ComplianceType complianceType
    ) external view returns (bool isCompliant);

    /* -------------------------------------------------------------------------- */
    /*                              Quality Compliance                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify quality standards compliance
     * @param batchId Batch identifier
     * @param qualityProof Quality proof data
     * @param standardsData Quality standards data
     * @return isCompliant Whether quality is compliant
     */
    function verifyQualityCompliance(
        uint256 batchId,
        bytes calldata qualityProof,
        bytes calldata standardsData
    ) external returns (bool isCompliant);

    /**
     * @dev Verify organic certification
     * @param batchId Batch identifier
     * @param organicProof Organic certification proof
     * @param certificationData Certification requirements
     * @return isOrganic Whether batch is organic certified
     */
    function verifyOrganicCertification(
        uint256 batchId,
        bytes calldata organicProof,
        bytes calldata certificationData
    ) external returns (bool isOrganic);

    /**
     * @dev Verify fair trade certification
     * @param batchId Batch identifier
     * @param fairTradeProof Fair trade proof data
     * @param certificationData Certification requirements
     * @return isFairTrade Whether batch is fair trade certified
     */
    function verifyFairTradeCertification(
        uint256 batchId,
        bytes calldata fairTradeProof,
        bytes calldata certificationData
    ) external returns (bool isFairTrade);

    /* -------------------------------------------------------------------------- */
    /*                              Supply Chain Compliance                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify supply chain traceability
     * @param batchId Batch identifier
     * @param traceabilityProof Traceability proof data
     * @param traceabilityData Traceability requirements
     * @return isTraceable Whether supply chain is traceable
     */
    function verifySupplyChainTraceability(
        uint256 batchId,
        bytes calldata traceabilityProof,
        bytes calldata traceabilityData
    ) external returns (bool isTraceable);

    /**
     * @dev Verify supply chain compliance
     * @param batchId Batch identifier
     * @param supplyChainProof Supply chain proof data
     * @param complianceData Compliance requirements
     * @return isCompliant Whether supply chain is compliant
     */
    function verifySupplyChainCompliance(
        uint256 batchId,
        bytes calldata supplyChainProof,
        bytes calldata complianceData
    ) external returns (bool isCompliant);

    /* -------------------------------------------------------------------------- */
    /*                              Regulatory Compliance                         */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify regulatory requirements
     * @param batchId Batch identifier
     * @param regulatoryProof Regulatory proof data
     * @param regulatoryData Regulatory requirements
     * @return isCompliant Whether batch meets regulatory requirements
     */
    function verifyRegulatoryCompliance(
        uint256 batchId,
        bytes calldata regulatoryProof,
        bytes calldata regulatoryData
    ) external returns (bool isCompliant);

    /**
     * @dev Verify FDA compliance
     * @param batchId Batch identifier
     * @param fdaProof FDA compliance proof
     * @param fdaData FDA requirements
     * @return isFDACompliant Whether batch is FDA compliant
     */
    function verifyFDACompliance(
        uint256 batchId,
        bytes calldata fdaProof,
        bytes calldata fdaData
    ) external returns (bool isFDACompliant);

    /**
     * @dev Verify EU compliance
     * @param batchId Batch identifier
     * @param euProof EU compliance proof
     * @param euData EU requirements
     * @return isEUCompliant Whether batch is EU compliant
     */
    function verifyEUCompliance(
        uint256 batchId,
        bytes calldata euProof,
        bytes calldata euData
    ) external returns (bool isEUCompliant);

    /* -------------------------------------------------------------------------- */
    /*                              Environmental Compliance                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify environmental standards
     * @param batchId Batch identifier
     * @param environmentalProof Environmental proof data
     * @param environmentalData Environmental requirements
     * @return isCompliant Whether batch meets environmental standards
     */
    function verifyEnvironmentalCompliance(
        uint256 batchId,
        bytes calldata environmentalProof,
        bytes calldata environmentalData
    ) external returns (bool isCompliant);

    /**
     * @dev Verify carbon footprint compliance
     * @param batchId Batch identifier
     * @param carbonProof Carbon footprint proof
     * @param carbonData Carbon footprint requirements
     * @return isCarbonCompliant Whether batch meets carbon footprint requirements
     */
    function verifyCarbonFootprintCompliance(
        uint256 batchId,
        bytes calldata carbonProof,
        bytes calldata carbonData
    ) external returns (bool isCarbonCompliant);

    /* -------------------------------------------------------------------------- */
    /*                              Batch Compliance                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get all compliance statuses for a batch
     * @param batchId Batch identifier
     * @return complianceStatuses Array of compliance statuses
     */
    function getBatchComplianceStatuses(
        uint256 batchId
    ) external view returns (ComplianceStatus[] memory complianceStatuses);

    /**
     * @dev Check if batch meets all required compliance standards
     * @param batchId Batch identifier
     * @return isFullyCompliant Whether batch meets all requirements
     */
    function isFullyCompliant(
        uint256 batchId
    ) external view returns (bool isFullyCompliant);

    /**
     * @dev Get compliance requirements for a compliance type
     * @param complianceType Type of compliance
     * @return requirement Compliance requirement
     */
    function getComplianceRequirement(
        ComplianceType complianceType
    ) external view returns (ComplianceRequirement memory requirement);

    /* -------------------------------------------------------------------------- */
    /*                              Admin Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set compliance requirement (admin only)
     * @param complianceType Type of compliance
     * @param requirement Compliance requirement
     */
    function setComplianceRequirement(
        ComplianceType complianceType,
        ComplianceRequirement calldata requirement
    ) external;

    /**
     * @dev Revoke compliance status (admin only)
     * @param batchId Batch identifier
     * @param complianceType Type of compliance
     */
    function revokeComplianceStatus(
        uint256 batchId,
        ComplianceType complianceType
    ) external;

    /**
     * @dev Get compliance statistics
     * @return totalCompliance Total number of compliance verifications
     * @return compliantBatches Number of compliant batches
     * @return nonCompliantBatches Number of non-compliant batches
     */
    function getComplianceStatistics() external view returns (
        uint256 totalCompliance,
        uint256 compliantBatches,
        uint256 nonCompliantBatches
    );
}
