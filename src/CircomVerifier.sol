// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";
import {Groth16Verifier as PricePrivacyCircuitVerifier} from "./verifiers/PricePrivacyCircuitVerifier.sol";
import {Groth16Verifier as QualityTierCircuitVerifier} from "./verifiers/QualityTierCircuitVerifier.sol";
import {Groth16Verifier as SupplyChainPrivacyCircuitVerifier} from "./verifiers/SupplyChainPrivacyCircuitVerifier.sol";
import {EUDRDeforestationCircuitVerifier} from "./verifiers/EUDRDeforestationCircuitVerifier.sol";
import {EUDRGeolocationCircuitVerifier} from "./verifiers/EUDRGeolocationCircuitVerifier.sol";
import {EthiopianComplianceCircuitVerifier} from "./verifiers/EthiopianComplianceCircuitVerifier.sol";

/**
 * @title CircomVerifier
 * @dev Real ZK verification using Circom circuits for WAGA MVP
 * @dev Focuses on 3 core proofs: Price, Quality, Supply Chain
 */
contract CircomVerifier is IZKVerifier {
    // Coffee token for role checks
    IWAGACoffeeToken public coffeeToken;
    // Role constants - defined in WAGAConfigManager
    bytes32 private constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    struct ZKProofInternal {
        bytes32 proofHash;
        IZKVerifier.ProofType proofType;
        bool isVerified;
        uint256 timestamp;
        string publicClaim;       // What we can publicly claim
        bytes proofData;          // Raw ZK proof data
        uint256[] publicSignals;  // Public inputs to the circuit
    }

    /* -------------------------------------------------------------------------- */
    /*                                  Storage                                   */
    /* -------------------------------------------------------------------------- */

    // Circuit verifier contracts
    PricePrivacyCircuitVerifier public immutable priceVerifier;
    QualityTierCircuitVerifier public immutable qualityVerifier;
    SupplyChainPrivacyCircuitVerifier public immutable supplyChainVerifier;
    EUDRDeforestationCircuitVerifier public immutable eudrDeforestationVerifier;
    EUDRGeolocationCircuitVerifier public immutable eudrGeolocationVerifier;
    EthiopianComplianceCircuitVerifier public immutable ethiopianComplianceVerifier;

    // Proof storage
    mapping(uint256 => mapping(IZKVerifier.ProofType => ZKProofInternal)) public batchProofs;
    mapping(uint256 => IZKVerifier.BatchProofStatus) public batchProofStatus;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event CircuitProofGenerated(
        uint256 indexed batchId,
        IZKVerifier.ProofType indexed proofType,
        uint256[] publicSignals
    );

    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                    */
    /* -------------------------------------------------------------------------- */

    error CircomVerifier__TooManyPublicSignals_verifyPriceCompetitiveness();
    error CircomVerifier__TooManyPublicSignals_verifyQualityStandards();
    error CircomVerifier__TooManyPublicSignals_verifySupplyChainProvenance();
    error CircomVerifier__TooManyPublicSignals_verifyEUDRDeforestationCompliance();
    error CircomVerifier__TooManyPublicSignals_verifyEUDRGeolocationVerification();
    error CircomVerifier__TooManyPublicSignals_verifyEthiopianCompliance();
    error CircomVerifier__InvalidProofLength__decodeGroth16Proof();

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor() {
        // Deploy circuit verifiers
        priceVerifier = new PricePrivacyCircuitVerifier();
        qualityVerifier = new QualityTierCircuitVerifier();
        supplyChainVerifier = new SupplyChainPrivacyCircuitVerifier();
        eudrDeforestationVerifier = new EUDRDeforestationCircuitVerifier();
        eudrGeolocationVerifier = new EUDRGeolocationCircuitVerifier();
        ethiopianComplianceVerifier = new EthiopianComplianceCircuitVerifier();
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
     * @dev Verify price competitiveness using real ZK circuit
     * @param batchId Batch identifier
     * @param zkProofData ZK proof from PricePrivacyCircuit (encoded Groth16 proof)
     * @param publicSignals Public inputs: [marketSegment, priceRange, isCompetitive]
     * @param publicClaim Public claim text (e.g., "Competitively Priced")
     */
    function verifyPriceCompetitiveness(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 5) {
            revert CircomVerifier__TooManyPublicSignals_verifyPriceCompetitiveness();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[5] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        // Verify ZK proof using circuit verifier
        verified = priceVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        
        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));
            
            batchProofs[batchId][IZKVerifier.ProofType.PRICE_COMPETITIVENESS] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.PRICE_COMPETITIVENESS,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });
            
            batchProofStatus[batchId].hasPriceProof = true;
            batchProofStatus[batchId].priceClaimText = publicClaim;
            
            emit ProofVerified(batchId, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, publicSignals);
        }
        
        return verified;
    }

    /**
     * @dev Verify quality standards using real ZK circuit
     * @param batchId Batch identifier
     * @param zkProofData ZK proof from QualityTierCircuit (encoded Groth16 proof)
     * @param publicSignals Public inputs: [qualityTier, minScore, meetsTierRequirements]
     * @param publicClaim Public claim text (e.g., "Premium Quality - SCA 85+")
     */
    function verifyQualityStandards(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 5) {
            revert CircomVerifier__TooManyPublicSignals_verifyQualityStandards();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[5] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        verified = qualityVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        
        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));
            
            batchProofs[batchId][IZKVerifier.ProofType.QUALITY_STANDARDS] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.QUALITY_STANDARDS,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });
            
            batchProofStatus[batchId].hasQualityProof = true;
            batchProofStatus[batchId].qualityClaimText = publicClaim;
            
            emit ProofVerified(batchId, IZKVerifier.ProofType.QUALITY_STANDARDS, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.QUALITY_STANDARDS, publicSignals);
        }
        
        return verified;
    }

    /**
     * @dev Verify supply chain provenance using real ZK circuit
     * @param batchId Batch identifier
     * @param zkProofData ZK proof from SupplyChainPrivacyCircuit (encoded Groth16 proof)
     * @param publicSignals Public inputs: [originRegion, originCountry, altitudeRange, processType, complianceType]
     * @param publicClaim Public claim text (e.g., "Single-Origin Ethiopian - Traceable")
     */
    function verifySupplyChainProvenance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 7) {
            revert CircomVerifier__TooManyPublicSignals_verifySupplyChainProvenance();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[7] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        verified = supplyChainVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        
        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));
            
            batchProofs[batchId][IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });
            
            batchProofStatus[batchId].hasSupplyChainProof = true;
            batchProofStatus[batchId].supplyChainClaimText = publicClaim;
            
            emit ProofVerified(batchId, IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, publicSignals);
        }
        
        return verified;
    }

    /**
     * @dev Verify EUDR deforestation compliance using real ZK circuit
     * @param batchId Batch identifier
     * @param zkProofData ZK proof from EUDRDeforestationCircuit (encoded Groth16 proof)
     * @param publicSignals Public inputs: [deforestationRisk, complianceLevel, plotSize, verificationTimestamp]
     * @param publicClaim Public claim text (e.g., "Deforestation-Free - EUDR Compliant")
     */
    function verifyEUDRDeforestationCompliance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 5) {
            revert CircomVerifier__TooManyPublicSignals_verifyEUDRDeforestationCompliance();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[5] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        // Verify ZK proof using circuit verifier
        verified = eudrDeforestationVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);

        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));

            batchProofs[batchId][IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });

            batchProofStatus[batchId].hasEUDRDeforestationProof = true;
            batchProofStatus[batchId].eudrDeforestationClaimText = publicClaim;

            emit ProofVerified(batchId, IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE, publicSignals);
        }

        return verified;
    }

    /**
     * @dev Verify EUDR geolocation verification using real ZK circuit
     * @param batchId Batch identifier
     * @param zkProofData ZK proof from EUDRGeolocationCircuit (encoded Groth16 proof)
     * @param publicSignals Public inputs: [plotType, plotSize, verificationMethod, complianceLevel, timestamp]
     * @param publicClaim Public claim text (e.g., "Geolocation Verified - Plot Size: 50ha")
     */
    function verifyEUDRGeolocation(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 7) {
            revert CircomVerifier__TooManyPublicSignals_verifyEUDRGeolocationVerification();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[7] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        // Verify ZK proof using circuit verifier
        verified = eudrGeolocationVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);

        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));

            batchProofs[batchId][IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });

            batchProofStatus[batchId].hasEUDRGeolocationProof = true;
            batchProofStatus[batchId].eudrGeolocationClaimText = publicClaim;

            emit ProofVerified(batchId, IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION, publicSignals);
        }

        return verified;
    }

    /**
     * @dev Verify Ethiopian compliance using real ZK circuit
     * @param batchId Batch identifier
     * @param zkProofData ZK proof from EthiopianComplianceCircuit (encoded Groth16 proof)
     * @param publicSignals Public inputs: [hasECTA, hasQuality, hasOrigin, regionCode, complianceLevel]
     * @param publicClaim Public claim text (e.g., "Ethiopian Export Compliant - ECTA Approved")
     */
    function verifyEthiopianCompliance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 6) {
            revert CircomVerifier__TooManyPublicSignals_verifyEthiopianCompliance();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[6] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        // Verify ZK proof using circuit verifier
        verified = ethiopianComplianceVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);

        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));

            batchProofs[batchId][IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });

            batchProofStatus[batchId].hasEthiopianComplianceProof = true;
            batchProofStatus[batchId].ethiopianComplianceClaimText = publicClaim;

            emit ProofVerified(batchId, IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY, publicSignals);
        }

        return verified;
    }

    /**
     * @dev Verify ECTA permit validity using real ZK circuit
     * Maps to verifyEthiopianCompliance for compatibility
     */
    function verifyECTAPermitValidity(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        return this.verifyEthiopianCompliance(batchId, zkProofData, publicSignals, publicClaim);
    }

    /**
     * @dev Verify quality certificate authenticity using real ZK circuit
     * Maps to verifyQualityStandards for compatibility
     */
    function verifyQualityCertificateAuthenticity(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 5) {
            revert CircomVerifier__TooManyPublicSignals_verifyQualityStandards();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[5] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        verified = qualityVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        
        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));
            
            batchProofs[batchId][IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });
            
            emit ProofVerified(batchId, IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY, publicSignals);
        }
        
        return verified;
    }

    /**
     * @dev Verify origin using real ZK circuit
     * Maps to verifySupplyChainProvenance for compatibility
     */
    function verifyOrigin(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 7) {
            revert CircomVerifier__TooManyPublicSignals_verifySupplyChainProvenance();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[7] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        verified = supplyChainVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        
        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));
            
            batchProofs[batchId][IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });
            
            emit ProofVerified(batchId, IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF, publicSignals);
        }
        
        return verified;
    }

    /**
     * @dev Verify BoE forex compliance using real ZK circuit
     * Maps to verifyEthiopianCompliance for compatibility
     */
    function verifyBoEForexCompliance(
        uint256 batchId,
        bytes calldata zkProofData,
        uint256[] calldata publicSignals,
        string calldata publicClaim
    ) external returns (bool verified) {
        if (!coffeeToken.hasRole(VERIFIER_ROLE, msg.sender)) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }
        if (publicSignals.length > 6) {
            revert CircomVerifier__TooManyPublicSignals_verifyEthiopianCompliance();
        }

        // Decode Groth16 proof from bytes
        (uint[2] memory _pA, uint[2][2] memory _pB, uint[2] memory _pC) = _decodeGroth16Proof(zkProofData);

        // Convert public signals to fixed-size array for verifier
        uint[6] memory _pubSignals;
        for (uint i = 0; i < publicSignals.length; i++) {
            _pubSignals[i] = publicSignals[i];
        }

        // Verify ZK proof using circuit verifier (reuse Ethiopian compliance for forex)
        verified = ethiopianComplianceVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);

        if (verified) {
            bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, block.timestamp));

            batchProofs[batchId][IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE] = ZKProofInternal({
                proofHash: proofHash,
                proofType: IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE,
                isVerified: true,
                timestamp: block.timestamp,
                publicClaim: publicClaim,
                proofData: zkProofData,
                publicSignals: publicSignals
            });

            emit ProofVerified(batchId, IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE, publicClaim, proofHash);
            emit CircuitProofGenerated(batchId, IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE, publicSignals);
        }

        return verified;
    }

    /* -------------------------------------------------------------------------- */
    /*                            Internal Functions                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Decode Groth16 proof from bytes to elliptic curve points
     * @param proofBytes Encoded proof bytes (256 bytes: A[2], B[4], C[2])
     * @return _pA Point A (G1)
     * @return _pB Point B (G2)
     * @return _pC Point C (G1)
     */
    function _decodeGroth16Proof(
        bytes memory proofBytes
    ) internal pure returns (
        uint[2] memory _pA,
        uint[2][2] memory _pB,
        uint[2] memory _pC
    ) {
        if (proofBytes.length != 256) {
            revert CircomVerifier__InvalidProofLength__decodeGroth16Proof();
        }

        // Decode point A (G1: x, y) - first 64 bytes
        assembly {
            mstore(_pA, mload(add(proofBytes, 32)))     // A.x
            mstore(add(_pA, 32), mload(add(proofBytes, 64))) // A.y
        }

        // Decode point B (G2: x1, x2, y1, y2) - next 128 bytes
        assembly {
            mstore(_pB, mload(add(proofBytes, 96)))       // B.x1
            mstore(add(_pB, 32), mload(add(proofBytes, 128)))  // B.x2
            mstore(add(_pB, 64), mload(add(proofBytes, 160)))  // B.y1
            mstore(add(_pB, 96), mload(add(proofBytes, 192)))  // B.y2
        }

        // Decode point C (G1: x, y) - last 64 bytes
        assembly {
            mstore(_pC, mload(add(proofBytes, 224)))     // C.x
            mstore(add(_pC, 32), mload(add(proofBytes, 256))) // C.y
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              View Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get proof status for a batch
     */
    function getBatchProofStatus(
        uint256 batchId
    ) external view returns (IZKVerifier.BatchProofStatus memory proofStatus) {
        return batchProofStatus[batchId];
    }

    /**
     * @dev Check if batch has all required proofs
     */
    function hasAllRequiredProofs(
        uint256 batchId
    ) external view returns (bool hasAllProofs) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatus[batchId];
        return status.hasPriceProof && status.hasQualityProof && status.hasSupplyChainProof;
    }

    /**
     * @dev Check if batch has EUDR compliance proofs
     */
    function hasEUDRComplianceProofs(
        uint256 batchId
    ) external view returns (bool hasEUDRProofs) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatus[batchId];
        return status.hasEUDRDeforestationProof && status.hasEUDRGeolocationProof;
    }

    /**
     * @dev Check if batch has Ethiopian compliance proofs
     */
    function hasEthiopianComplianceProofs(
        uint256 batchId
    ) external view returns (bool hasEthiopianProofs) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatus[batchId];
        return status.hasEthiopianComplianceProof;
    }

    /**
     * @dev Get individual proof for a batch and type
     */
    function getProof(
        uint256 batchId,
        IZKVerifier.ProofType proofType
    ) external view returns (ZKProofInternal memory proof) {
        return batchProofs[batchId][proofType];
    }

    /**
     * @dev Get public claims for a batch (what can be shown to users)
     */
    function getPublicClaims(
        uint256 batchId
    ) external view returns (
        string memory priceClaim,
        string memory qualityClaim,
        string memory supplyChainClaim
    ) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatus[batchId];
        return (status.priceClaimText, status.qualityClaimText, status.supplyChainClaimText);
    }

    /**
     * @dev Get EUDR compliance claims for a batch
     */
    function getEUDRComplianceClaims(
        uint256 batchId
    ) external view returns (
        string memory deforestationClaim,
        string memory geolocationClaim
    ) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatus[batchId];
        return (status.eudrDeforestationClaimText, status.eudrGeolocationClaimText);
    }

    /**
     * @dev Get Ethiopian compliance claims for a batch
     */
    function getEthiopianComplianceClaims(
        uint256 batchId
    ) external view returns (string memory ethiopianComplianceClaim) {
        IZKVerifier.BatchProofStatus memory status = batchProofStatus[batchId];
        return status.ethiopianComplianceClaimText;
    }    /**
     * @dev Get verifier contract addresses
     */
    function getVerifierAddresses() external view returns (
        address priceVerifierAddr,
        address qualityVerifierAddr,
        address supplyChainVerifierAddr,
        address eudrDeforestationVerifierAddr,
        address eudrGeolocationVerifierAddr,
        address ethiopianComplianceVerifierAddr
    ) {
        return (
            address(priceVerifier),
            address(qualityVerifier),
            address(supplyChainVerifier),
            address(eudrDeforestationVerifier),
            address(eudrGeolocationVerifier),
            address(ethiopianComplianceVerifier)
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              Admin Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Grant verifier role to address
     * @dev This is a placeholder - actual role management is done through coffee token contract
     */
    function grantVerifierRole(address) external view {
        if (!coffeeToken.hasRole(ADMIN_ROLE, msg.sender)) {
            revert("CircomVerifier: Not authorized");
        }
        // Role granting should be done through coffee token contract
        // This function exists for interface compatibility but doesn't perform actions
    }

    /**
     * @dev Revoke verifier role from address
     * @dev This is a placeholder - actual role management is done through coffee token contract
     */
    function revokeVerifierRole(address) external view {
        if (!coffeeToken.hasRole(ADMIN_ROLE, msg.sender)) {
            revert("CircomVerifier: Not authorized");
        }
        // Role revoking should be done through coffee token contract
        // This function exists for interface compatibility but doesn't perform actions
    }
}
