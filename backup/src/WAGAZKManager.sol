// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Interfaces/IWAGACoffeeToken.sol";
import "./Interfaces/IZKVerifier.sol";
import "./WAGAViewFunctions.sol";

/**
 * @title WAGAZKManager
 * @dev Manages ZK proof verification for the Real ZK MVP system
 * @dev Handles 3 core proof types: Price, Quality, Supply Chain
 */
contract WAGAZKManager is WAGAViewFunctions {
    /* -------------------------------------------------------------------------- */
    /*                                   Constants                                */
    /* -------------------------------------------------------------------------- */
    
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error WAGAZKManager__CallerDoesNotHaveRequiredRole_callerHasRoleFromCoffeeToken();
    error WAGAZKManager__BatchDoesNotExist_addZKProof();
    error WAGAZKManager__ZKProofVerificationFailed_addZKProof();
    error WAGAZKManager__BatchDoesNotExist_getZKProof();
    error WAGAZKManager__ZKProofNotFound_getZKProof();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    struct ZKProof {
        bytes32 proofHash;
        bytes proofData;
        uint256 proofTimestamp;
        address proofGenerator;
        bool isValid;
        IZKVerifier.ProofType proofType;
        string publicClaim;
    }

    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    IWAGACoffeeToken public immutable coffeeToken;
    IZKVerifier public immutable zkVerifier;

    // ZK proof storage
    mapping(uint256 => ZKProof) public batchZKProofs;
    mapping(bytes32 => bool) public zkProofExists;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ZKProofAdded(
        uint256 indexed batchId,
        bytes32 indexed proofHash,
        IZKVerifier.ProofType proofType,
        string publicClaim,
        address indexed generator
    );

    event ZKProofVerified(
        uint256 indexed batchId,
        bytes32 indexed proofHash,
        bool isValid
    );

    /* -------------------------------------------------------------------------- */
    /*                                Modifiers                                   */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        // Use a try-catch or low-level call since interface might not have hasRole
        (bool success, bytes memory result) = address(coffeeToken).staticcall(
            abi.encodeWithSignature("hasRole(bytes32,address)", roleType, msg.sender)
        );
        
        if (!success || result.length == 0 || !abi.decode(result, (bool))) {
            revert WAGAZKManager__CallerDoesNotHaveRequiredRole_callerHasRoleFromCoffeeToken();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _coffeeToken,
        address _zkVerifier
    ) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
        zkVerifier = IZKVerifier(_zkVerifier);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add and verify ZK proof for a batch
     */
    function addZKProof(
        uint256 batchId,
        bytes calldata zkProofData,
        IZKVerifier.ProofType proofType,
        string calldata publicClaim
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist_addZKProof();
        }

        // Verify ZK proof based on type
        bool verified = false;
        if (proofType == IZKVerifier.ProofType.PRICE_COMPETITIVENESS) {
            verified = zkVerifier.verifyPriceCompetitiveness(batchId, zkProofData, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.QUALITY_STANDARDS) {
            verified = zkVerifier.verifyQualityStandards(batchId, zkProofData, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE) {
            verified = zkVerifier.verifySupplyChainProvenance(batchId, zkProofData, publicClaim);
        }

        if (!verified) {
            revert WAGAZKManager__ZKProofVerificationFailed_addZKProof();
        }

        // Store ZK proof
        bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, uint256(proofType), block.timestamp));
        batchZKProofs[batchId] = ZKProof({
            proofHash: proofHash,
            proofData: zkProofData,
            proofTimestamp: block.timestamp,
            proofGenerator: msg.sender,
            isValid: true,
            proofType: proofType,
            publicClaim: publicClaim
        });
        zkProofExists[proofHash] = true;

        emit ZKProofAdded(batchId, proofHash, proofType, publicClaim, msg.sender);
        emit ZKProofVerified(batchId, proofHash, true);
    }

    /**
     * @dev Get ZK proof for a batch
     */
    function getZKProof(uint256 batchId) external view returns (
        bytes32 proofHash,
        bytes memory proofData,
        uint256 proofTimestamp,
        address proofGenerator,
        bool isValid,
        string memory publicClaim
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist_getZKProof();
        }
        
        ZKProof memory proof = batchZKProofs[batchId];
        if (proof.proofHash == bytes32(0)) {
            revert WAGAZKManager__ZKProofNotFound_getZKProof();
        }

        return (
            proof.proofHash,
            proof.proofData,
            proof.proofTimestamp,
            proof.proofGenerator,
            proof.isValid,
            proof.publicClaim
        );
    }

    /**
     * @dev Check if batch has ZK proof
     */
    function hasZKProof(uint256 batchId) external view returns (bool) {
        return batchZKProofs[batchId].proofHash != bytes32(0);
    }

    /**
     * @dev Get batch proof status from ZK verifier
     */
    function getBatchProofStatus(uint256 batchId) external view returns (
        IZKVerifier.BatchProofStatus memory
    ) {
        return zkVerifier.getBatchProofStatus(batchId);
    }

    /**
     * @dev Check if batch has all required proofs
     */
    function hasAllRequiredProofs(uint256 batchId) external view returns (bool) {
        return zkVerifier.hasAllRequiredProofs(batchId);
    }
}
