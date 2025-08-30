// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";
import {IComplianceVerifier} from "./Interfaces/IComplianceVerifier.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {WAGACoffeeToken} from "../WAGACoffeeToken.sol";

/**
 * @title CircomVerifier
 * @dev ZK proof verification using Circom circuits
 * @dev Supports multiple proof types: price, quality, supply chain, compliance
 * @dev Integrates with privacy layer and compliance verifier
 */
contract CircomVerifier is IZKVerifier, AccessControl, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                   */
    /* -------------------------------------------------------------------------- */
    error CircomVerifier__InvalidProofType_verifyProof();
    error CircomVerifier__ProofVerificationFailed_verifyProof();
    error CircomVerifier__InvalidPublicInputs_verifyProof();
    error CircomVerifier__ProofAlreadyVerified_verifyProof();
    error CircomVerifier__AccessControlUnauthorizedAccount_verifyProof();
    error CircomVerifier__InvalidCircuitParameters_verifyProof();
    error CircomVerifier__ProofExpired_verifyProof();
    error CircomVerifier__InvalidVerificationKey_verifyProof();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    // ZK Proof verification result
    struct VerificationResult {
        bool isValid;
        uint256 verificationTimestamp;
        address verifier;
        string proofType;
        bytes32 proofHash;
        mapping(string => string) verificationDetails;
    }

    // Circuit configuration for different proof types
    struct CircuitConfig {
        bytes32 verificationKey;
        uint256 maxProofAge;
        bool isActive;
        string circuitName;
    }







    /* -------------------------------------------------------------------------- */
    /*                              State Variables                               */
    /* -------------------------------------------------------------------------- */

    // Mapping from proof hash to verification result
    mapping(bytes32 => VerificationResult) private s_verificationResults;
    
    // Mapping from proof type to circuit configuration
    mapping(string => CircuitConfig) private s_circuitConfigs;
    
    // Mapping from proof hash to proof data
    mapping(bytes32 => bytes) private s_proofData;
    
    // Mapping from proof hash to public inputs
    mapping(bytes32 => bytes) private s_publicInputs;
    
    // Set of verified proof hashes
    mapping(bytes32 => bool) private s_verifiedProofs;
    
    // Verification statistics
    uint256 private s_totalProofsVerified;
    uint256 private s_successfulVerifications;
    uint256 private s_failedVerifications;
    
    // Reference to WAGACoffeeToken for role checking
    WAGACoffeeToken public coffeeToken;

    /* -------------------------------------------------------------------------- */
    /*                                 Events                                     */
    /* -------------------------------------------------------------------------- */
    event ProofVerified(
        bytes32 indexed proofHash,
        string indexed proofType,
        bool isValid,
        address indexed verifier,
        uint256 timestamp
    );
    
    event ProofRegistered(
        bytes32 indexed proofHash,
        string indexed proofType,
        string metadata
    );
    
    event ProofRevoked(
        bytes32 indexed proofHash
    );
    
    event CircuitConfigUpdated(
        string indexed proofType,
        bytes32 verificationKey,
        uint256 maxProofAge,
        bool isActive
    );
    
    event VerificationKeyUpdated(
        string indexed proofType,
        bytes32 oldKey,
        bytes32 newKey
    );

    /* -------------------------------------------------------------------------- */
    /*                                 Constructor                                */
    /* -------------------------------------------------------------------------- */

    constructor(address coffeeTokenAddress) {
        if (coffeeTokenAddress != address(0)) {
            coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        }
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Initialize default circuit configurations
        _initializeDefaultCircuits();
    }

    /* -------------------------------------------------------------------------- */
    /*                              Access Control                                */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Update the coffee token reference (only admin)
     */
    function setCoffeeTokenAddress(address coffeeTokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(coffeeTokenAddress != address(0), "Invalid coffee token address");
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
    }

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        if (address(coffeeToken) != address(0) && !coffeeToken.hasRole(roleType, msg.sender)) {
            revert CircomVerifier__AccessControlUnauthorizedAccount_verifyProof();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                              ZK Verification                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify a ZK proof using Circom circuits
     * @param proofType Type of proof (price, quality, supply_chain, compliance)
     * @param proofData Raw proof data from Circom
     * @param publicInputs Public inputs for verification
     * @param verificationKey Verification key for the circuit
     * @return isValid Whether the proof is valid
     * @return verificationDetails Additional verification details
     */
    function verifyProof(
        string calldata proofType,
        bytes calldata proofData,
        bytes calldata publicInputs,
        bytes32 verificationKey
    ) external override callerHasRoleFromCoffeeToken(coffeeToken.VERIFIER_ROLE()) nonReentrant returns (
        bool isValid,
        string memory verificationDetails
    ) {
        
        // Validate proof type
        if (!_isValidProofType(proofType)) {
            revert CircomVerifier__InvalidProofType_verifyProof();
        }

        // Validate circuit configuration
        CircuitConfig storage config = s_circuitConfigs[proofType];
        if (!config.isActive) {
            revert CircomVerifier__InvalidCircuitParameters_verifyProof();
        }

        // Validate verification key
        if (config.verificationKey != verificationKey) {
            revert CircomVerifier__InvalidVerificationKey_verifyProof();
        }

        // Generate proof hash
        bytes32 proofHash = keccak256(abi.encodePacked(
            proofType,
            proofData,
            publicInputs,
            verificationKey,
            block.timestamp
        ));

        // Check if proof already verified
        if (s_verifiedProofs[proofHash]) {
            revert CircomVerifier__ProofAlreadyVerified_verifyProof();
        }

        // Store proof data
        s_proofData[proofHash] = proofData;
        s_publicInputs[proofHash] = publicInputs;

        // Perform ZK proof verification based on type
        bool verificationSuccess = _performZKVerification(
            proofType,
            proofData,
            publicInputs,
            verificationKey
        );

        // Store verification result
        VerificationResult storage result = s_verificationResults[proofHash];
        result.isValid = verificationSuccess;
        result.verificationTimestamp = block.timestamp;
        result.verifier = msg.sender;
        result.proofType = proofType;
        result.proofHash = proofHash;

        // Mark proof as verified
        s_verifiedProofs[proofHash] = true;

        // Update statistics
        s_totalProofsVerified++;
        if (verificationSuccess) {
            s_successfulVerifications++;
            verificationDetails = "Proof verified successfully";
        } else {
            s_failedVerifications++;
            verificationDetails = "Proof verification failed";
        }

        emit ProofVerified(
            proofHash,
            proofType,
            verificationSuccess,
            msg.sender,
            block.timestamp
        );

        return (verificationSuccess, verificationDetails);
    }

    /**
     * @dev Get verification result for a proof hash
     * @param proofHash Hash of the proof
     * @return isValid Whether the proof is valid
     * @return verificationTimestamp When the proof was verified
     * @return verifier Who verified the proof
     * @return proofType Type of proof
     */
    function getVerificationResult(
        bytes32 proofHash
    ) external view override returns (
        bool isValid,
        uint256 verificationTimestamp,
        address verifier,
        string memory proofType
    ) {
        VerificationResult storage result = s_verificationResults[proofHash];
        return (
            result.isValid,
            result.verificationTimestamp,
            result.verifier,
            result.proofType
        );
    }

    /**
     * @dev Check if a proof hash has been verified
     * @param proofHash Hash of the proof
     * @return isVerified Whether the proof has been verified
     */
    function isProofVerified(
        bytes32 proofHash
    ) external view override returns (bool isVerified) {
        return s_verifiedProofs[proofHash];
    }

    /* -------------------------------------------------------------------------- */
    /*                              Circuit Management                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update circuit configuration for a proof type
     * @param proofType Type of proof
     * @param verificationKey New verification key
     * @param maxProofAge Maximum age of proofs in seconds
     * @param isActive Whether the circuit is active
     */
    function updateCircuitConfig(
        string calldata proofType,
        bytes32 verificationKey,
        uint256 maxProofAge,
        bool isActive
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_isValidProofType(proofType), "Invalid proof type");
        require(maxProofAge > 0, "Max proof age must be positive");

        bytes32 oldKey = s_circuitConfigs[proofType].verificationKey;
        
        s_circuitConfigs[proofType] = CircuitConfig({
            verificationKey: verificationKey,
            maxProofAge: maxProofAge,
            isActive: isActive,
            circuitName: proofType
        });

        emit CircuitConfigUpdated(proofType, verificationKey, maxProofAge, isActive);
        
        if (oldKey != verificationKey) {
            emit VerificationKeyUpdated(proofType, oldKey, verificationKey);
        }
    }

    /**
     * @dev Get circuit configuration for a proof type
     * @param proofType Type of proof
     * @return verificationKey Verification key
     * @return maxProofAge Maximum proof age
     * @return isActive Whether circuit is active
     * @return circuitName Name of the circuit
     */
    function getCircuitConfig(
        string calldata proofType
    ) external view returns (
        bytes32 verificationKey,
        uint256 maxProofAge,
        bool isActive,
        string memory circuitName
    ) {
        CircuitConfig storage config = s_circuitConfigs[proofType];
        return (
            config.verificationKey,
            config.maxProofAge,
            config.isActive,
            config.circuitName
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              Statistics                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get verification statistics
     * @return totalProofs Total proofs verified
     * @return successfulVerifications Successful verifications
     * @return failedVerifications Failed verifications
     */
    function getVerificationStats() external view returns (
        uint256 totalProofs,
        uint256 successfulVerifications,
        uint256 failedVerifications
    ) {
        return (
            s_totalProofsVerified,
            s_successfulVerifications,
            s_failedVerifications
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              Internal Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Initialize default circuit configurations
     */
    function _initializeDefaultCircuits() internal {
        // Price privacy circuit
        s_circuitConfigs["price"] = CircuitConfig({
            verificationKey: keccak256("price_privacy_circuit_v1"),
            maxProofAge: 1 days,
            isActive: true,
            circuitName: "PricePrivacyCircuit"
        });

        // Quality tier circuit
        s_circuitConfigs["quality"] = CircuitConfig({
            verificationKey: keccak256("quality_tier_circuit_v1"),
            maxProofAge: 7 days,
            isActive: true,
            circuitName: "QualityTierCircuit"
        });

        // Supply chain privacy circuit
        s_circuitConfigs["supply_chain"] = CircuitConfig({
            verificationKey: keccak256("supply_chain_privacy_circuit_v1"),
            maxProofAge: 30 days,
            isActive: true,
            circuitName: "SupplyChainPrivacyCircuit"
        });

        // Compliance verification circuit
        s_circuitConfigs["compliance"] = CircuitConfig({
            verificationKey: keccak256("compliance_verification_circuit_v1"),
            maxProofAge: 90 days,
            isActive: true,
            circuitName: "ComplianceVerificationCircuit"
        });
    }

    /**
     * @dev Validate proof type
     * @param proofType Type of proof to validate
     * @return isValid Whether the proof type is valid
     */
    function _isValidProofType(
        string memory proofType
    ) internal pure returns (bool isValid) {
        bytes memory typeBytes = bytes(proofType);
        if (typeBytes.length == 0) return false;

        // Check against valid proof types
        return (
            keccak256(typeBytes) == keccak256("price") ||
            keccak256(typeBytes) == keccak256("quality") ||
            keccak256(typeBytes) == keccak256("supply_chain") ||
            keccak256(typeBytes) == keccak256("compliance")
        );
    }

    /**
     * @dev Perform ZK proof verification using Circom circuits
     * @param proofType Type of proof
     * @param proofData Raw proof data
     * @param publicInputs Public inputs
     * @param verificationKey Verification key
     * @return isValid Whether verification succeeded
     */
    function _performZKVerification(
        string memory proofType,
        bytes memory proofData,
        bytes memory publicInputs,
        bytes32 verificationKey
    ) internal pure returns (bool isValid) {
        // This is a simplified implementation
        // In production, this would integrate with actual Circom verification
        
        // Validate inputs
        if (proofData.length == 0 || publicInputs.length == 0) {
            return false;
        }

        // Simulate different verification logic based on proof type
        if (keccak256(bytes(proofType)) == keccak256("price")) {
            return _verifyPriceProof(proofData, publicInputs, verificationKey);
        } else if (keccak256(bytes(proofType)) == keccak256("quality")) {
            return _verifyQualityProof(proofData, publicInputs, verificationKey);
        } else if (keccak256(bytes(proofType)) == keccak256("supply_chain")) {
            return _verifySupplyChainProof(proofData, publicInputs, verificationKey);
        } else if (keccak256(bytes(proofType)) == keccak256("compliance")) {
            return _verifyComplianceProof(proofData, publicInputs, verificationKey);
        }

        return false;
    }

    /**
     * @dev Verify price privacy proof
     */
    function _verifyPriceProof(
        bytes memory proofData,
        bytes memory publicInputs,
        bytes32 verificationKey
    ) internal pure returns (bool isValid) {
        // Simulate price proof verification
        // In production, this would use actual Circom verification
        return proofData.length > 32 && publicInputs.length > 0;
    }

    /**
     * @dev Verify quality tier proof
     */
    function _verifyQualityProof(
        bytes memory proofData,
        bytes memory publicInputs,
        bytes32 verificationKey
    ) internal pure returns (bool isValid) {
        // Simulate quality proof verification
        return proofData.length > 32 && publicInputs.length > 0;
    }

    /**
     * @dev Verify supply chain privacy proof
     */
    function _verifySupplyChainProof(
        bytes memory proofData,
        bytes memory publicInputs,
        bytes32 verificationKey
    ) internal pure returns (bool isValid) {
        // Simulate supply chain proof verification
        return proofData.length > 32 && publicInputs.length > 0;
    }

    /**
     * @dev Verify compliance proof
     */
    function _verifyComplianceProof(
        bytes memory proofData,
        bytes memory publicInputs,
        bytes32 verificationKey
    ) internal pure returns (bool isValid) {
        // Simulate compliance proof verification
        return proofData.length > 32 && publicInputs.length > 0;
    }
}
