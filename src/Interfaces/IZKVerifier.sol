// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title IZKVerifier
 * @dev ZK verification interface focusing on 3 core proof types
 * @dev Optimized for WAGA MVP: Price, Quality, Supply Chain
 */
interface IZKVerifier {
    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    enum ProofType {
        PRICE_COMPETITIVENESS,         // Prove price is competitive without revealing actual price
        QUALITY_STANDARDS,             // Prove quality meets standards without revealing scores
        SUPPLY_CHAIN_PROVENANCE,       // Prove origin/traceability without revealing sensitive details
        EUDR_DEFORESTATION_COMPLIANCE, // Prove deforestation-free status without revealing geolocation
        EUDR_GEOLOCATION_VERIFICATION, // Prove valid geolocation data without revealing coordinates
        ECTA_PERMIT_VALIDITY,          // Prove valid ECTA export permit without revealing details
        QUALITY_CERTIFICATE_AUTHENTICITY, // Prove authentic quality certificate without revealing scores
        ORIGIN_VERIFICATION_PROOF,     // Prove verified origin without revealing cooperative details
        BOE_FOREX_COMPLIANCE           // Prove forex compliance without revealing surrender details
    }

    struct ZKProof {
        bytes32 proofHash;
        ProofType proofType;
        bool isVerified;
        uint256 timestamp;
        string publicClaim;       // What we can publicly claim (e.g., "Premium Quality", "Competitively Priced")
    }

    struct BatchProofStatus {
        bool hasPriceProof;
        bool hasQualityProof;
        bool hasSupplyChainProof;
        bool hasEUDRDeforestationProof;
        bool hasEUDRGeolocationProof;
        bool hasEthiopianComplianceProof;
        string priceClaimText;     // e.g., "Competitively Priced"
        string qualityClaimText;   // e.g., "Premium Quality - SCA 85+"
        string supplyChainClaimText; // e.g., "Single-Origin Ethiopian - Traceable"
        string eudrDeforestationClaimText; // e.g., "Deforestation-Free - Verified"
        string eudrGeolocationClaimText; // e.g., "Geolocation Verified - GPS Confirmed"
        string ethiopianComplianceClaimText; // e.g., "ECTA Permit Valid - Export Approved"
    }

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ProofVerified(
        uint256 indexed batchId,
        ProofType indexed proofType,
        string publicClaim,
        bytes32 proofHash
    );

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify price competitiveness without revealing actual price
     * @param batchId Batch identifier
     * @param zkProofData ZK proof that price is competitive
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "Competitively Priced", "Premium Value")
     * @return verified Whether proof is valid
     */
    function verifyPriceCompetitiveness(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify quality standards without revealing exact scores
     * @param batchId Batch identifier
     * @param zkProofData ZK proof that quality meets standards
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "Premium Quality", "SCA 85+")
     * @return verified Whether proof is valid
     */
    function verifyQualityStandards(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify supply chain provenance without revealing sensitive details
     * @param batchId Batch identifier
     * @param zkProofData ZK proof of origin and traceability
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "Single-Origin Ethiopian", "Farm-Traceable")
     * @return verified Whether proof is valid
     */
    function verifySupplyChainProvenance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Get proof status for a batch
     * @param batchId Batch identifier
     * @return proofStatus Status of all three proof types
     */
    function getBatchProofStatus(
        uint256 batchId
    ) external view returns (BatchProofStatus memory proofStatus);

    /**
     * @dev Check if batch has all required proofs
     * @param batchId Batch identifier
     * @return hasAllProofs Whether all three proof types are verified
     */
    function hasAllRequiredProofs(
        uint256 batchId
    ) external view returns (bool hasAllProofs);

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify EUDR deforestation compliance without revealing geolocation
     * @param batchId Batch identifier
     * @param zkProofData ZK proof of deforestation-free status
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "Deforestation-free since 2020")
     * @return verified Whether proof is valid
     */
    function verifyEUDRDeforestationCompliance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify EUDR geolocation data without revealing coordinates
     * @param batchId Batch identifier
     * @param zkProofData ZK proof of valid geolocation data
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "Geolocated plot verified")
     * @return verified Whether proof is valid
     */
    function verifyEUDRGeolocation(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /* -------------------------------------------------------------------------- */
    /*                          ETHIOPIAN COMPLIANCE FUNCTIONS                   */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify ECTA permit validity without revealing permit details
     * @param batchId Batch identifier
     * @param zkProofData ZK proof of valid ECTA permit
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "Valid ECTA Export Permit")
     * @return verified Whether proof is valid
     */
    function verifyECTAPermitValidity(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify quality certificate authenticity without revealing scores
     * @param batchId Batch identifier
     * @param zkProofData ZK proof of authentic quality certificate
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "Authentic Quality Certificate - SCA 85+")
     * @return verified Whether proof is valid
     */
    function verifyQualityCertificateAuthenticity(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify origin without revealing cooperative details
     * @param batchId Batch identifier
     * @param zkProofData ZK proof of verified origin
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "Verified Ethiopian Origin - Cooperative Sourced")
     * @return verified Whether proof is valid
     */
    function verifyOrigin(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify BoE forex compliance without revealing surrender details
     * @param batchId Batch identifier
     * @param zkProofData ZK proof of forex compliance
     * @param publicSignals Public inputs for the ZK circuit
     * @param publicClaim Public claim text (e.g., "BoE Forex Compliant")
     * @return verified Whether proof is valid
     */
    function verifyBoEForexCompliance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);
}
