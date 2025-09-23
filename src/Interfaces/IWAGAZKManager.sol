// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IZKVerifier} from "./IZKVerifier.sol";
import {IComplianceManager} from "./IComplianceManager.sol";

/**
 * @title IWAGAZKManager
 * @dev Unified interface for WAGAZKManager contract with compliance management
 * @notice Extends IComplianceManager for unified compliance handling
 */
interface IWAGAZKManager is IComplianceManager {
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
    /*                              LEGACY FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Legacy ZK proof addition (for backward compatibility)
     * @param batchId Batch identifier
     * @param zkProofData ZK proof data
     * @param proofType Type of proof being submitted
     * @param publicClaim Public claim text
     * @return verified Whether proof verification succeeded
     */
    function addZKProof(
        uint256 batchId,
        bytes calldata zkProofData,
        IZKVerifier.ProofType proofType,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Legacy EUDR validation function (for backward compatibility)
     * @param batchId Batch identifier
     * @return deforestationCompliant Whether deforestation compliance is met
     * @return geolocationVerified Whether geolocation is verified
     * @return fullyCompliant Whether all EUDR requirements are met
     */
    function validateEUDRZKCompliance(uint256 batchId)
        external
        view
        returns (
            bool deforestationCompliant,
            bool geolocationVerified,
            bool fullyCompliant
        );

    /* -------------------------------------------------------------------------- */
    /*                               VIEW FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if batch has all required proofs (legacy)
     * @param batchId Batch identifier
     * @return hasAllProofs Whether all required proofs are present
     */
    function hasAllRequiredProofs(uint256 batchId)
        external
        view
        returns (bool hasAllProofs);

    /**
     * @dev Get ZK proof details (legacy)
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
