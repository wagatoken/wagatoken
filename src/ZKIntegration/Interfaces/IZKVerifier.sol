// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title IZKVerifier
 * @dev Interface for Zero-Knowledge proof verification
 * @dev Supports multiple proof types for maximum privacy
 */
interface IZKVerifier {
    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                   */
    /* -------------------------------------------------------------------------- */
    error IZKVerifier__InvalidProofType_verifyProof();
    error IZKVerifier__ProofVerificationFailed_verifyProof();
    error IZKVerifier__InvalidProofData_verifyProof();
    error IZKVerifier__ProofExpired_verifyProof();
    error IZKVerifier__UnauthorizedCaller_verifyProof();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    enum ProofType {
        PRICE_COMPETITIVENESS,    // Verify price is competitive without revealing actual price
        QUALITY_COMPLIANCE,       // Verify quality meets standards without revealing scores
        SUPPLY_CHAIN_COMPLIANCE,  // Verify supply chain compliance without revealing details
        INVENTORY_VERIFICATION,   // Verify inventory exists without revealing exact quantities
        COMPETITIVE_POSITIONING,  // Verify competitive positioning without revealing strategy
        MARKET_ANALYSIS,          // Verify market analysis without revealing insights
        COMPLIANCE_AUDIT,         // Verify compliance audit without revealing findings
        CUSTOM_PROOF             // Custom proof type for specific use cases
    }

    struct ProofMetadata {
        bytes32 proofHash;
        uint256 proofTimestamp;
        address proofGenerator;
        ProofType proofType;
        bool isValid;
        string proofDescription;
        bytes32 verificationKey;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ProofVerified(
        bytes32 indexed proofHash,
        ProofType indexed proofType,
        address indexed generator,
        bool isValid
    );

    event ProofRegistered(
        bytes32 indexed proofHash,
        ProofType indexed proofType,
        address indexed generator,
        uint256 timestamp
    );

    event VerificationKeyUpdated(
        bytes32 indexed oldKey,
        bytes32 indexed newKey,
        address indexed updater
    );

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify a ZK proof
     * @param proofData Raw proof data
     * @param proofType Type of proof to verify
     * @return isValid Whether the proof is valid
     */
    function verifyProof(
        bytes calldata proofData,
        string calldata proofType
    ) external returns (bool isValid);

    /**
     * @dev Verify a ZK proof with metadata
     * @param proofData Raw proof data
     * @param proofType Type of proof to verify
     * @param metadata Additional metadata for verification
     * @return isValid Whether the proof is valid
     */
    function verifyProofWithMetadata(
        bytes calldata proofData,
        ProofType proofType,
        bytes calldata metadata
    ) external returns (bool isValid);

    /**
     * @dev Register a new proof
     * @param proofHash Hash of the proof
     * @param proofType Type of proof
     * @param proofDescription Description of the proof
     * @return success Whether registration was successful
     */
    function registerProof(
        bytes32 proofHash,
        ProofType proofType,
        string calldata proofDescription
    ) external returns (bool success);

    /**
     * @dev Get proof metadata
     * @param proofHash Hash of the proof
     * @return metadata Proof metadata
     */
    function getProofMetadata(
        bytes32 proofHash
    ) external view returns (ProofMetadata memory metadata);

    /**
     * @dev Check if proof exists
     * @param proofHash Hash of the proof
     * @return exists Whether the proof exists
     */
    function proofExists(bytes32 proofHash) external view returns (bool exists);

    /**
     * @dev Get verification key for a proof type
     * @param proofType Type of proof
     * @return key Verification key
     */
    function getVerificationKey(
        ProofType proofType
    ) external view returns (bytes32 key);

    /**
     * @dev Update verification key for a proof type
     * @param proofType Type of proof
     * @param newKey New verification key
     */
    function updateVerificationKey(
        ProofType proofType,
        bytes32 newKey
    ) external;

    /* -------------------------------------------------------------------------- */
    /*                              Batch Verification                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify multiple proofs in a batch
     * @param proofData Array of proof data
     * @param proofTypes Array of proof types
     * @return results Array of verification results
     */
    function verifyBatchProofs(
        bytes[] calldata proofData,
        ProofType[] calldata proofTypes
    ) external returns (bool[] memory results);

    /**
     * @dev Verify batch validity without revealing individual details
     * @param batchProofData Batch proof data
     * @return isValid Whether the batch is valid
     */
    function verifyBatchValidity(
        bytes calldata batchProofData
    ) external returns (bool isValid);

    /* -------------------------------------------------------------------------- */
    /*                              Privacy Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify price competitiveness without revealing actual price
     * @param priceProof Price proof data
     * @param marketData Market data for comparison
     * @return isCompetitive Whether the price is competitive
     */
    function verifyPriceCompetitiveness(
        bytes calldata priceProof,
        bytes calldata marketData
    ) external returns (bool isCompetitive);

    /**
     * @dev Verify quality compliance without revealing quality scores
     * @param qualityProof Quality proof data
     * @param standardsData Quality standards data
     * @return isCompliant Whether quality is compliant
     */
    function verifyQualityCompliance(
        bytes calldata qualityProof,
        bytes calldata standardsData
    ) external returns (bool isCompliant);

    /**
     * @dev Verify supply chain compliance without revealing details
     * @param supplyChainProof Supply chain proof data
     * @param complianceData Compliance requirements data
     * @return isCompliant Whether supply chain is compliant
     */
    function verifySupplyChainCompliance(
        bytes calldata supplyChainProof,
        bytes calldata complianceData
    ) external returns (bool isCompliant);

    /* -------------------------------------------------------------------------- */
    /*                              Admin Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set verification key for a proof type (admin only)
     * @param proofType Type of proof
     * @param verificationKey Verification key
     */
    function setVerificationKey(
        ProofType proofType,
        bytes32 verificationKey
    ) external;

    /**
     * @dev Revoke a proof (admin only)
     * @param proofHash Hash of the proof to revoke
     */
    function revokeProof(bytes32 proofHash) external;

    /**
     * @dev Get proof statistics
     * @return totalProofs Total number of proofs
     * @return validProofs Number of valid proofs
     * @return revokedProofs Number of revoked proofs
     */
    function getProofStatistics() external view returns (
        uint256 totalProofs,
        uint256 validProofs,
        uint256 revokedProofs
    );
}
