// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MockCircomVerifier
 * @dev Mock implementation of IZKVerifier for testing purposes
 * @notice This contract provides simplified ZK verification for testing the integration
 * @notice It validates basic proof structure without cryptographic verification
 */
contract MockCircomVerifier is IZKVerifier, AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event MockProofVerified(
        uint256 indexed batchId,
        ProofType indexed proofType,
        string publicClaim,
        bool success
    );

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Track verified proofs for testing
    mapping(uint256 => BatchProofStatus) public batchProofStatuses;

    /* -------------------------------------------------------------------------- */
    /*                                 Constructor                                */
    /* -------------------------------------------------------------------------- */

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Mock verification for price competitiveness
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data (must not be "invalid_proof")
     * @param publicSignals Public signals (validated for length)
     * @param publicClaim Public claim text
     * @return verified Always returns true for valid mock data
     */
    function verifyPriceCompetitiveness(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external onlyRole(VERIFIER_ROLE) returns (bool verified) {
        // Basic validation for testing
        require(zkProofData.length > 0, "Empty proof data");
        require(bytes(publicClaim).length > 0, "Empty public claim");
        require(publicSignals.length >= 0, "Invalid public signals length");

        // Reject obviously invalid test data
        require(
            keccak256(zkProofData) != keccak256("invalid_proof"),
            "Mock verification: Invalid proof data"
        );

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasPriceProof = true;
        batchProofStatuses[batchId].priceClaimText = publicClaim;

        emit MockProofVerified(batchId, ProofType.PRICE_COMPETITIVENESS, publicClaim, true);
        emit ProofVerified(batchId, ProofType.PRICE_COMPETITIVENESS, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for quality standards
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals
     * @param publicClaim Public claim text
     * @return verified Always returns true for valid mock data
     */
    function verifyQualityStandards(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external onlyRole(VERIFIER_ROLE) returns (bool verified) {
        // Basic validation
        require(zkProofData.length > 0, "Empty proof data");
        require(bytes(publicClaim).length > 0, "Empty public claim");
        require(publicSignals.length >= 0, "Invalid public signals length");

        // Reject invalid test data
        require(
            keccak256(zkProofData) != keccak256("invalid_proof"),
            "Mock verification: Invalid proof data"
        );

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasQualityProof = true;
        batchProofStatuses[batchId].qualityClaimText = publicClaim;

        emit MockProofVerified(batchId, ProofType.QUALITY_STANDARDS, publicClaim, true);
        emit ProofVerified(batchId, ProofType.QUALITY_STANDARDS, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for supply chain provenance
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals
     * @param publicClaim Public claim text
     * @return verified Always returns true for valid mock data
     */
    function verifySupplyChainProvenance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external onlyRole(VERIFIER_ROLE) returns (bool verified) {
        // Basic validation
        require(zkProofData.length > 0, "Empty proof data");
        require(bytes(publicClaim).length > 0, "Empty public claim");
        require(publicSignals.length >= 0, "Invalid public signals length");

        // Reject invalid test data
        require(
            keccak256(zkProofData) != keccak256("invalid_proof"),
            "Mock verification: Invalid proof data"
        );

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasSupplyChainProof = true;
        batchProofStatuses[batchId].supplyChainClaimText = publicClaim;

        emit MockProofVerified(batchId, ProofType.SUPPLY_CHAIN_PROVENANCE, publicClaim, true);
        emit ProofVerified(batchId, ProofType.SUPPLY_CHAIN_PROVENANCE, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Get proof status for a batch
     * @param batchId Batch identifier
     * @return proofStatus Status of all three proof types
     */
    function getBatchProofStatus(
        uint256 batchId
    ) external view returns (BatchProofStatus memory proofStatus) {
        return batchProofStatuses[batchId];
    }

    /**
     * @dev Check if batch has all required proofs
     * @param batchId Batch identifier
     * @return hasAllProofs Whether all three proof types are verified
     */
    function hasAllRequiredProofs(
        uint256 batchId
    ) external view returns (bool hasAllProofs) {
        BatchProofStatus memory status = batchProofStatuses[batchId];
        return status.hasPriceProof && status.hasQualityProof && status.hasSupplyChainProof;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Admin Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Grant VERIFIER_ROLE to an address (for testing)
     * @param verifier Address to grant verifier role to
     */
    function grantVerifierRole(address verifier) external onlyRole(ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, verifier);
    }

    /**
     * @dev Reset proof status for a batch (for testing)
     * @param batchId Batch identifier
     */
    function resetBatchProofStatus(uint256 batchId) external onlyRole(ADMIN_ROLE) {
        delete batchProofStatuses[batchId];
    }

    /**
     * @dev Get verification statistics
     * @return totalBatches Total batches with any proofs
     */
    function getVerificationStats() external view returns (uint256 totalBatches) {
        // This is a simplified implementation
        // In a real implementation, you'd track this more efficiently
        return 0;
    }
}
