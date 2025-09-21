// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IZKVerifier} from "./IZKVerifier.sol";

/**
 * @title IWAGAZKManager
 * @dev Interface for WAGAZKManager contract
 * @notice Defines the interface for ZK proof management in the WAGA system
 */
interface IWAGAZKManager {
    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event ZKProofAdded(
        uint256 indexed batchId,
        bytes32 indexed proofHash,
        IZKVerifier.ProofType proofType,
        string publicClaim,
        address indexed submitter
    );

    event ZKProofValidated(
        uint256 indexed batchId,
        IZKVerifier.ProofType proofType,
        bool isValid
    );

    /* -------------------------------------------------------------------------- */
    /*                              EXTERNAL FUNCTIONS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add ZK proof for batch verification
     * @param batchId Batch identifier
     * @param zkProofData ZK proof data
     * @param proofType Type of proof being submitted
     * @param publicClaim Public claim text
     */
    function addZKProof(
        uint256 batchId,
        bytes calldata zkProofData,
        IZKVerifier.ProofType proofType,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Add EUDR compliance ZK proof
     * @param batchId Batch identifier
     * @param zkProofData ZK proof data
     * @param proofType EUDR proof type
     * @param publicClaim Public claim text
     */
    function addEUDRComplianceZKProof(
        uint256 batchId,
        bytes calldata zkProofData,
        IZKVerifier.ProofType proofType,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Add Ethiopian compliance ZK proof
     * @param batchId Batch identifier
     * @param complianceType Type of compliance
     * @param zkProofData ZK proof data
     * @param publicClaim Public claim text
     */
    function addEthiopianComplianceZKProof(
        uint256 batchId,
        string calldata complianceType,
        bytes calldata zkProofData,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Validate EUDR compliance for a batch
     * @param batchId Batch identifier
     * @return deforestationCompliant Whether deforestation compliance is met
     * @return geolocationVerified Whether geolocation is verified
     * @return fullyCompliant Whether batch is fully EUDR compliant
     */
    function validateEUDRZKCompliance(uint256 batchId)
        external
        view
        returns (
            bool deforestationCompliant,
            bool geolocationVerified,
            bool fullyCompliant
        );

    /**
     * @dev Validate Ethiopian compliance for a batch
     * @param batchId Batch identifier
     * @return compliant Whether batch is Ethiopian compliant
     */
    function validateEthiopianZKCompliance(uint256 batchId)
        external
        view
        returns (bool compliant);

    /* -------------------------------------------------------------------------- */
    /*                               VIEW FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if batch has all required proofs (original three)
     * @param batchId Batch identifier
     * @return hasAllProofs Whether all required proofs are present
     */
    function hasAllRequiredProofs(uint256 batchId)
        external
        view
        returns (bool hasAllProofs);

    /**
     * @dev Check if batch has EUDR compliance proofs
     * @param batchId Batch identifier
     * @return hasEUDRProofs Whether EUDR proofs are present
     */
    function hasEUDRComplianceProofs(uint256 batchId)
        external
        view
        returns (bool hasEUDRProofs);

    /**
     * @dev Check if batch has Ethiopian compliance proof
     * @param batchId Batch identifier
     * @return hasEthiopianProof Whether Ethiopian proof is present
     */
    function hasEthiopianComplianceProofs(uint256 batchId)
        external
        view
        returns (bool hasEthiopianProof);

    /**
     * @dev Get EUDR compliance claims
     * @param batchId Batch identifier
     * @return deforestationClaim Deforestation compliance claim
     * @return geolocationClaim Geolocation verification claim
     */
    function getEUDRComplianceClaims(uint256 batchId)
        external
        view
        returns (string memory deforestationClaim, string memory geolocationClaim);

    /**
     * @dev Get Ethiopian compliance claim
     * @param batchId Batch identifier
     * @return ethiopianClaim Ethiopian compliance claim
     */
    function getEthiopianComplianceClaims(uint256 batchId)
        external
        view
        returns (string memory ethiopianClaim);

    /**
     * @dev Get ZK proof details
     * @param batchId Batch identifier
     * @param proofType Type of proof
     * @return proofHash Hash of the proof
     * @return isVerified Whether proof is verified
     * @return timestamp When proof was submitted
     * @return publicClaim Public claim text
     */
    function getZKProof(uint256 batchId, IZKVerifier.ProofType proofType)
        external
        view
        returns (
            bytes32 proofHash,
            bool isVerified,
            uint256 timestamp,
            string memory publicClaim
        );
}
