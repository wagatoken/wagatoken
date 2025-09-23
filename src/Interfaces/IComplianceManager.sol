// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IComplianceManager
 * @dev Unified interface for all compliance management across different coffee origins
 * @notice Supports Ethiopian, non-Ethiopian, and EUDR compliance requirements
 */
interface IComplianceManager {
    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event ComplianceProofAdded(
        uint256 indexed batchId,
        string indexed complianceType,
        bytes32 indexed proofHash,
        string publicClaim,
        address submitter
    );

    event ComplianceValidated(
        uint256 indexed batchId,
        string complianceFramework,
        bool isCompliant
    );

    /* -------------------------------------------------------------------------- */
    /*                              COMPLIANCE TYPES                             */
    /* -------------------------------------------------------------------------- */

    // Ethiopian compliance types
    // "ECTA_PERMIT" - Ethiopian Coffee & Tea Authority permit
    // "QUALITY_CERT" - Quality certificate
    // "ORIGIN_VERIFICATION" - Origin verification certificate
    // "BOE_FOREX" - Bank of Ethiopia forex compliance
    
    // EUDR compliance types (for all origins exporting to EU)
    // "EUDR_DEFORESTATION" - Deforestation-free compliance
    // "EUDR_GEOLOCATION" - Geolocation verification
    
    // Future extensible types for other origins
    // "BRAZIL_CECAFE" - Brazilian CECAFE certification
    // "COLOMBIA_FNC" - Colombian FNC certification
    // etc.

    /* -------------------------------------------------------------------------- */
    /*                              CORE FUNCTIONS                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add compliance proof for any origin
     * @param batchId Batch identifier
     * @param complianceType Type of compliance (see compliance types above)
     * @param zkProofData ZK proof data
     * @param publicClaim Public claim text
     * @return verified Whether proof verification succeeded
     */
    function addComplianceZKProof(
        uint256 batchId,
        string calldata complianceType,
        bytes calldata zkProofData,
        string calldata publicClaim
    ) external returns (bool verified);

    /**
     * @dev Validate compliance for specific framework
     * @param batchId Batch identifier
     * @param complianceFramework Framework to validate ("ETHIOPIAN", "EUDR", "GLOBAL")
     * @return isCompliant Whether compliance requirements are met
     */
    function validateCompliance(
        uint256 batchId,
        string calldata complianceFramework
    ) external view returns (bool isCompliant);

    /**
     * @dev Check if specific compliance type is satisfied
     * @param batchId Batch identifier
     * @param complianceType Type of compliance to check
     * @return hasCompliance Whether specific compliance is satisfied
     */
    function hasComplianceProof(
        uint256 batchId,
        string calldata complianceType
    ) external view returns (bool hasCompliance);

    /**
     * @dev Get compliance proof details
     * @param batchId Batch identifier
     * @param complianceType Type of compliance
     * @return proofHash Hash of the proof
     * @return isVerified Whether proof is verified
     * @return timestamp When proof was submitted
     * @return publicClaim Public claim text
     */
    function getComplianceProof(
        uint256 batchId,
        string calldata complianceType
    ) external view returns (
        bytes32 proofHash,
        bool isVerified,
        uint256 timestamp,
        string memory publicClaim
    );

    /**
     * @dev Get required compliance types for origin
     * @param origin Coffee origin string
     * @param isEUDestination Whether coffee is destined for EU market
     * @return requiredTypes Array of required compliance types
     */
    function getRequiredComplianceTypes(
        string calldata origin,
        bool isEUDestination
    ) external view returns (string[] memory requiredTypes);
}