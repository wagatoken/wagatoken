// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title ICircomVerifier
 * @dev Interface for real ZK verification using Circom circuits
 * @dev Optimized for WAGA MVP: Price, Quality, Supply Chain
 */
interface ICircomVerifier {
    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    enum ProofType {
        PRICE_COMPETITIVENESS,    // Prove price is competitive without revealing actual price
        QUALITY_STANDARDS,        // Prove quality meets standards without revealing scores  
        SUPPLY_CHAIN_PROVENANCE   // Prove origin/traceability without revealing sensitive details
    }

    struct ZKProof {
        bytes32 proofHash;
        ProofType proofType;
        bool isVerified;
        uint256 timestamp;
        string publicClaim;       // What we can publicly claim
        bytes proofData;          // Raw ZK proof data
        uint256[] publicSignals;  // Public inputs to the circuit
    }

    struct BatchProofStatus {
        bool hasPriceProof;
        bool hasQualityProof;
        bool hasSupplyChainProof;
        string priceClaimText;     // e.g., "Competitively Priced"
        string qualityClaimText;   // e.g., "Premium Quality - SCA 85+"
        string supplyChainClaimText; // e.g., "Single-Origin Ethiopian - Traceable"
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

    event CircuitProofGenerated(
        uint256 indexed batchId,
        ProofType indexed proofType,
        uint256[] publicSignals
    );

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify price competitiveness using real ZK circuit
     * @param batchId Batch identifier
     * @param zkProofData ZK proof from PricePrivacyCircuit
     * @param publicSignals Public inputs: [marketSegment, priceRange, isCompetitive]
     * @param publicClaim Public claim text (e.g., "Competitively Priced")
     * @return verified Whether proof is valid
     */
    function verifyPriceCompetitiveness(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify quality standards using real ZK circuit
     * @param batchId Batch identifier  
     * @param zkProofData ZK proof from QualityTierCircuit
     * @param publicSignals Public inputs: [qualityTier, minScore, meetsTierRequirements]
     * @param publicClaim Public claim text (e.g., "Premium Quality - SCA 85+")
     * @return verified Whether proof is valid
     */
    function verifyQualityStandards(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify supply chain provenance using real ZK circuit
     * @param batchId Batch identifier
     * @param zkProofData ZK proof from SupplyChainPrivacyCircuit
     * @param publicSignals Public inputs: [originRegion, originCountry, altitudeRange, processType, complianceType]
     * @param publicClaim Public claim text (e.g., "Single-Origin Ethiopian - Traceable")
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

    /**
     * @dev Get individual proof for a batch and type
     * @param batchId Batch identifier
     * @param proofType Type of proof to retrieve
     * @return proof Complete proof data
     */
    function getProof(
        uint256 batchId,
        ProofType proofType
    ) external view returns (ZKProof memory proof);

    /**
     * @dev Get public claims for a batch (what can be shown to users)
     * @param batchId Batch identifier
     * @return priceClaim Public price claim
     * @return qualityClaim Public quality claim  
     * @return supplyChainClaim Public supply chain claim
     */
    function getPublicClaims(
        uint256 batchId
    ) external view returns (
        string memory priceClaim,
        string memory qualityClaim,
        string memory supplyChainClaim
    );
}
