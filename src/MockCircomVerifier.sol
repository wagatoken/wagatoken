// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";

/**
 * @title MockCircomVerifier
 * @dev Mock implementation of IZKVerifier for testing purposes
 * @notice This contract provides simplified ZK verification for testing the integration
 * @notice It validates basic proof structure without cryptographic verification
 */
contract MockCircomVerifier is IZKVerifier {
    // Role constants - defined in WAGAConfigManager
    bytes32 private constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Coffee token for role checks
    IWAGACoffeeToken public coffeeToken;

    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                    */
    /* -------------------------------------------------------------------------- */

    error MockCircomVerifier__EmptyProofData_verifyPriceCompetitiveness();
    error MockCircomVerifier__EmptyPublicClaim_verifyPriceCompetitiveness();
    error MockCircomVerifier__InvalidProofData_verifyPriceCompetitiveness();
    error MockCircomVerifier__EmptyProofData_verifyQualityStandards();
    error MockCircomVerifier__EmptyPublicClaim_verifyQualityStandards();
    error MockCircomVerifier__InvalidProofData_verifyQualityStandards();
    error MockCircomVerifier__EmptyProofData_verifySupplyChainProvenance();
    error MockCircomVerifier__EmptyPublicClaim_verifySupplyChainProvenance();
    error MockCircomVerifier__InvalidProofData_verifySupplyChainProvenance();
    error MockCircomVerifier__EmptyProofData_verifyEUDRDeforestationCompliance();
    error MockCircomVerifier__EmptyPublicClaim_verifyEUDRDeforestationCompliance();
    error MockCircomVerifier__InvalidProofData_verifyEUDRDeforestationCompliance();
    error MockCircomVerifier__EmptyProofData_verifyEUDRGeolocationVerification();
    error MockCircomVerifier__EmptyPublicClaim_verifyEUDRGeolocationVerification();
    error MockCircomVerifier__InvalidProofData_verifyEUDRGeolocationVerification();
    error MockCircomVerifier__EmptyProofData_verifyEthiopianCompliance();
    error MockCircomVerifier__EmptyPublicClaim_verifyEthiopianCompliance();
    error MockCircomVerifier__InvalidProofData_verifyEthiopianCompliance();

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event MockProofVerified(
        uint256 indexed batchId,
        IZKVerifier.ProofType indexed proofType,
        string publicClaim,
        bool success
    );

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Track verified proofs for testing
    mapping(uint256 => IZKVerifier.BatchProofStatus) public batchProofStatuses;

    /* -------------------------------------------------------------------------- */
    /*                                 Constructor                                */
    /* -------------------------------------------------------------------------- */

    constructor() {
        // No role initialization needed - roles managed by coffee token
    }
    
    /**
     * @dev Set the coffee token contract for role checks
     * @param _coffeeToken Address of the WAGACoffeeTokenCore contract
     */
    function setCoffeeToken(address _coffeeToken) external {
        // Only allow setting if not already set or called by admin
        if (address(coffeeToken) != address(0)) {
            if (!coffeeToken.hasRole(keccak256("ADMIN_ROLE"), msg.sender)) {
                revert();
            }
        }
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
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
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            return false;
        }
        // Basic validation for testing
        if (zkProofData.length == 0) {
            revert MockCircomVerifier__EmptyProofData_verifyPriceCompetitiveness();
        }
        if (bytes(publicClaim).length == 0) {
            revert MockCircomVerifier__EmptyPublicClaim_verifyPriceCompetitiveness();
        }

        // Reject obviously invalid test data
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            revert MockCircomVerifier__InvalidProofData_verifyPriceCompetitiveness();
        }

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasPriceProof = true;
        batchProofStatuses[batchId].priceClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, publicClaim, keccak256(zkProofData));
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
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            return false;
        }
        // Basic validation
        if (zkProofData.length == 0) {
            revert MockCircomVerifier__EmptyProofData_verifyQualityStandards();
        }
        if (bytes(publicClaim).length == 0) {
            revert MockCircomVerifier__EmptyPublicClaim_verifyQualityStandards();
        }

        // Reject invalid test data
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            revert MockCircomVerifier__InvalidProofData_verifyQualityStandards();
        }

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasQualityProof = true;
        batchProofStatuses[batchId].qualityClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.QUALITY_STANDARDS, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.QUALITY_STANDARDS, publicClaim, keccak256(zkProofData));
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
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            return false;
        }
        // Basic validation
        if (zkProofData.length == 0) {
            revert MockCircomVerifier__EmptyProofData_verifySupplyChainProvenance();
        }
        if (bytes(publicClaim).length == 0) {
            revert MockCircomVerifier__EmptyPublicClaim_verifySupplyChainProvenance();
        }

        // Reject invalid test data
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            revert MockCircomVerifier__InvalidProofData_verifySupplyChainProvenance();
        }

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasSupplyChainProof = true;
        batchProofStatuses[batchId].supplyChainClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for EUDR deforestation compliance
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals
     * @param publicClaim Public claim text
     * @return verified Always returns true for valid mock data
     */
    function verifyEUDRDeforestationCompliance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            return false;
        }
        // Basic validation
        if (zkProofData.length == 0) {
            revert MockCircomVerifier__EmptyProofData_verifyEUDRDeforestationCompliance();
        }
        if (bytes(publicClaim).length == 0) {
            revert MockCircomVerifier__EmptyPublicClaim_verifyEUDRDeforestationCompliance();
        }

        // Reject invalid test data
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            revert MockCircomVerifier__InvalidProofData_verifyEUDRDeforestationCompliance();
        }

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasEUDRDeforestationProof = true;
        batchProofStatuses[batchId].eudrDeforestationClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for EUDR geolocation
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals array
     * @param publicClaim Public claim
     * @return verified Whether proof is valid
     */
    function verifyEUDRGeolocation(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        // Simple mock verification - accept any proof that isn't "invalid_proof"
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            verified = false;
            emit MockProofVerified(batchId, IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION, publicClaim, false);
            return verified;
        }

        verified = true;
        batchProofStatuses[batchId].hasEUDRGeolocationProof = true;
        batchProofStatuses[batchId].eudrGeolocationClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for EUDR geolocation verification
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals
     * @param publicClaim Public claim text
     * @return verified Always returns true for valid mock data
     */
    function verifyEUDRGeolocationVerification(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            return false;
        }
        // Basic validation
        if (zkProofData.length == 0) {
            revert MockCircomVerifier__EmptyProofData_verifyEUDRGeolocationVerification();
        }
        if (bytes(publicClaim).length == 0) {
            revert MockCircomVerifier__EmptyPublicClaim_verifyEUDRGeolocationVerification();
        }

        // Reject invalid test data
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            revert MockCircomVerifier__InvalidProofData_verifyEUDRGeolocationVerification();
        }

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasEUDRGeolocationProof = true;
        batchProofStatuses[batchId].eudrGeolocationClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for Ethiopian compliance
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals
     * @param publicClaim Public claim text
     * @return verified Always returns true for valid mock data
     */
    function verifyEthiopianCompliance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            return false;
        }
        // Basic validation
        if (zkProofData.length == 0) {
            revert MockCircomVerifier__EmptyProofData_verifyEthiopianCompliance();
        }
        if (bytes(publicClaim).length == 0) {
            revert MockCircomVerifier__EmptyPublicClaim_verifyEthiopianCompliance();
        }

        // Reject invalid test data
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            revert MockCircomVerifier__InvalidProofData_verifyEthiopianCompliance();
        }

        // Mark as verified
        verified = true;
        batchProofStatuses[batchId].hasEthiopianComplianceProof = true;
        batchProofStatuses[batchId].ethiopianComplianceClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Get proof status for a batch
     * @param batchId Batch identifier
     * @return proofStatus Status of all proof types
     */
    function getBatchProofStatus(
        uint256 batchId
    ) external view returns (IZKVerifier.BatchProofStatus memory proofStatus) {
        return batchProofStatuses[batchId];
    }

    /**
     * @dev Check if batch has all required proofs (original three: price, quality, supply chain)
     * @param batchId Batch identifier
     * @return hasAllProofs Whether all three original proof types are verified
     */
    function hasAllRequiredProofs(
        uint256 batchId
    ) external view returns (bool hasAllProofs) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatuses[batchId];
        return status.hasPriceProof && status.hasQualityProof && status.hasSupplyChainProof;
    }

    /**
     * @dev Check if batch has EUDR compliance proofs
     * @param batchId Batch identifier
     * @return hasEUDRProofs Whether both EUDR proof types are verified
     */
    function hasEUDRComplianceProofs(
        uint256 batchId
    ) external view returns (bool hasEUDRProofs) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatuses[batchId];
        return status.hasEUDRDeforestationProof && status.hasEUDRGeolocationProof;
    }

    /**
     * @dev Check if batch has Ethiopian compliance proof
     * @param batchId Batch identifier
     * @return hasEthiopianProof Whether Ethiopian compliance proof is verified
     */
    function hasEthiopianComplianceProofs(
        uint256 batchId
    ) external view returns (bool hasEthiopianProof) {
        return batchProofStatuses[batchId].hasEthiopianComplianceProof;
    }

    /**
     * @dev Get EUDR compliance claims for a batch
     * @param batchId Batch identifier
     * @return deforestationClaim Deforestation compliance claim text
     * @return geolocationClaim Geolocation verification claim text
     */
    function getEUDRComplianceClaims(
        uint256 batchId
    ) external view returns (string memory deforestationClaim, string memory geolocationClaim) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatuses[batchId];
        return (status.eudrDeforestationClaimText, status.eudrGeolocationClaimText);
    }

    /**
     * @dev Get Ethiopian compliance claim for a batch
     * @param batchId Batch identifier
     * @return ethiopianClaim Ethiopian compliance claim text
     */
    function getEthiopianComplianceClaims(
        uint256 batchId
    ) external view returns (string memory ethiopianClaim) {
        return batchProofStatuses[batchId].ethiopianComplianceClaimText;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Admin Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Grant VERIFIER_ROLE to an address (for testing)
     * @param verifier Address to grant verifier role to
     */
    function grantVerifierRole(address verifier) external {
        if (!coffeeToken.hasRole(ADMIN_ROLE, msg.sender)) {
            return;
        }
        // Role granting should be done through coffee token contract
    }

    /**
     * @dev Reset proof status for a batch (for testing)
     * @param batchId Batch identifier
     */
    function resetBatchProofStatus(uint256 batchId) external {
        if (!coffeeToken.hasRole(ADMIN_ROLE, msg.sender)) {
            return;
        }
        delete batchProofStatuses[batchId];
    }

    /**
     * @dev Mock verification for ECTA permit validity
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals array
     * @param publicClaim Public claim
     * @return verified Whether proof is valid
     */
    function verifyECTAPermitValidity(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        // Simple mock verification - accept any proof that isn't "invalid_proof"
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            verified = false;
            emit MockProofVerified(batchId, IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY, publicClaim, false);
            return verified;
        }

        verified = true;
        batchProofStatuses[batchId].hasEthiopianComplianceProof = true;
        batchProofStatuses[batchId].ethiopianComplianceClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for quality certificate authenticity
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals array
     * @param publicClaim Public claim
     * @return verified Whether proof is valid
     */
    function verifyQualityCertificateAuthenticity(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        // Simple mock verification - accept any proof that isn't "invalid_proof"
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            verified = false;
            emit MockProofVerified(batchId, IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY, publicClaim, false);
            return verified;
        }

        verified = true;
        batchProofStatuses[batchId].hasEthiopianComplianceProof = true;
        batchProofStatuses[batchId].ethiopianComplianceClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for origin verification
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals array
     * @param publicClaim Public claim
     * @return verified Whether proof is valid
     */
    function verifyOrigin(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        // Simple mock verification - accept any proof that isn't "invalid_proof"
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            verified = false;
            emit MockProofVerified(batchId, IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF, publicClaim, false);
            return verified;
        }

        verified = true;
        batchProofStatuses[batchId].hasEthiopianComplianceProof = true;
        batchProofStatuses[batchId].ethiopianComplianceClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Mock verification for BoE forex compliance
     * @param batchId Batch identifier
     * @param zkProofData Mock proof data
     * @param publicSignals Public signals array
     * @param publicClaim Public claim
     * @return verified Whether proof is valid
     */
    function verifyBoEForexCompliance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        // Simple mock verification - accept any proof that isn't "invalid_proof"
        if (keccak256(zkProofData) == keccak256("invalid_proof")) {
            verified = false;
            emit MockProofVerified(batchId, IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE, publicClaim, false);
            return verified;
        }

        verified = true;
        batchProofStatuses[batchId].hasEthiopianComplianceProof = true;
        batchProofStatuses[batchId].ethiopianComplianceClaimText = publicClaim;

        emit MockProofVerified(batchId, IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE, publicClaim, true);
        emit ProofVerified(batchId, IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE, publicClaim, keccak256(zkProofData));
    }

    /**
     * @dev Get verification statistics
     * @return totalBatches Total batches with any proofs
     */
    function getVerificationStats() external pure returns (uint256 totalBatches) {
        // This is a simplified implementation
        // In a real implementation, you'd track this more efficiently
        return 0;
    }
}
