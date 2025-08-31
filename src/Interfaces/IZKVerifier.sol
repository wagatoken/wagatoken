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
        PRICE_COMPETITIVENESS,    // Prove price is competitive without revealing actual price
        QUALITY_STANDARDS,        // Prove quality meets standards without revealing scores  
        SUPPLY_CHAIN_PROVENANCE   // Prove origin/traceability without revealing sensitive details
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

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify price competitiveness without revealing actual price
     * @param batchId Batch identifier
     * @param zkProofData ZK proof that price is competitive
     * @param publicClaim Public claim text (e.g., "Competitively Priced", "Premium Value")
     * @return verified Whether proof is valid
     */
    function verifyPriceCompetitiveness(
        uint256 batchId,
        bytes calldata zkProofData,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify quality standards without revealing exact scores
     * @param batchId Batch identifier  
     * @param zkProofData ZK proof that quality meets standards
     * @param publicClaim Public claim text (e.g., "Premium Quality", "SCA 85+")
     * @return verified Whether proof is valid
     */
    function verifyQualityStandards(
        uint256 batchId,
        bytes calldata zkProofData,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Verify supply chain provenance without revealing sensitive details
     * @param batchId Batch identifier
     * @param zkProofData ZK proof of origin and traceability  
     * @param publicClaim Public claim text (e.g., "Single-Origin Ethiopian", "Farm-Traceable")
     * @return verified Whether proof is valid
     */
    function verifySupplyChainProvenance(
        uint256 batchId,
        bytes calldata zkProofData,
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
}
