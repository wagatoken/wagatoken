// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Interfaces/IWAGACoffeeToken.sol";
import "./Interfaces/IZKVerifier.sol";
import "./WAGACoffeeTokenCore.sol";
import "./Interfaces/IEthiopianCompliance.sol";

/**
 * @title WAGAZKManager
 * @dev Manages ZK proof verification for the Real ZK MVP system
 * @dev Handles 3 core proof types: Price, Quality, Supply Chain
 * @dev No longer inherits WAGAViewFunctions to avoid state duplication
 */
contract WAGAZKManager {
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
    error WAGAZKManager__BatchDoesNotExist_addEUDRComplianceZKProof();
    error WAGAZKManager__ZKProofVerificationFailed_addEUDRComplianceZKProof();
    error WAGAZKManager__BatchDoesNotExist_addEthiopianComplianceZKProof();
    error WAGAZKManager__ZKProofVerificationFailed_addEthiopianComplianceZKProof();
    error WAGAZKManager__InvalidComplianceType_addEthiopianComplianceZKProof();
    error WAGAZKManager__EthiopianComplianceNotConfigured_validateEthiopianZKCompliance();
    error WAGAZKManager__ComplianceTypeNotFound_getEthiopianComplianceZKProof();
    error WAGAZKManager__OnlyCoffeeTokenCanConfigurePrivacy_setPrivacyManager();
    error WAGAZKManager__EthiopianComplianceNotConfigured_setEthiopianCompliance();
    error WAGAZKManager__InvalidEthiopianComplianceAddress_setEthiopianCompliance();
    error WAGAZKManager__EthiopianComplianceNotConfigured_addEthiopianComplianceZKProof();

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
        bool isEthiopianCompliance; // Flag for Ethiopian compliance proofs
    }

    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    IWAGACoffeeToken public immutable COFFEE_TOKEN;
    WAGACoffeeTokenCore public immutable COFFEE_TOKEN_CONTRACT;
    IZKVerifier public immutable ZK_VERIFIER;
    IEthiopianCompliance public ethiopianCompliance;

    // ZK proof storage
    mapping(uint256 => ZKProof) public batchZKProofs;
    mapping(bytes32 => bool) public zkProofExists;
    
    // Ethiopian compliance ZK proof storage
    mapping(uint256 => mapping(string => ZKProof)) public ethiopianComplianceProofs; // batchId => complianceType => proof
    mapping(uint256 => bool) public hasEthiopianZKCompliance;

    // EUDR compliance ZK proof storage
    mapping(uint256 => ZKProof) public eudrDeforestationProofs; // batchId => deforestation proof
    mapping(uint256 => ZKProof) public eudrGeolocationProofs;   // batchId => geolocation proof
    mapping(uint256 => bool) public hasEUDRZKCompliance;

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

    event EthiopianComplianceProofAdded(
        uint256 indexed batchId,
        string complianceType,
        bytes32 proofHash,
        string publicClaim
    );

    event EthiopianZKComplianceValidated(
        uint256 indexed batchId,
        bool isCompliant
    );

    event EUDRComplianceZKProofAdded(
        uint256 indexed batchId,
        IZKVerifier.ProofType proofType,
        bytes32 indexed proofHash,
        string publicClaim
    );

    event EUDRZKComplianceValidated(
        uint256 indexed batchId,
        bool isCompliant
    );

    /* -------------------------------------------------------------------------- */
    /*                                Modifiers                                   */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        _checkCallerHasRoleFromCoffeeToken(roleType, msg.sender);
        _;
    }

    function _checkCallerHasRoleFromCoffeeToken(bytes32 roleType, address caller) internal view {
        // Check if the caller has the specific role in the coffee token contract
        if (!COFFEE_TOKEN_CONTRACT.hasRole(roleType, caller)) {
            revert WAGAZKManager__CallerDoesNotHaveRequiredRole_callerHasRoleFromCoffeeToken();
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _coffeeToken,
        address _zkVerifier
    ) {
        COFFEE_TOKEN = IWAGACoffeeToken(_coffeeToken);
        COFFEE_TOKEN_CONTRACT = WAGACoffeeTokenCore(_coffeeToken);
        ZK_VERIFIER = IZKVerifier(_zkVerifier);
    }

    /**
     * @dev Configure default privacy settings for a batch
     * Called by WAGACoffeeTokenCore during batch creation
     */
    function configureDefaultPrivacy(uint256 batchId) external {
        // Only allow coffee token contract to call this
        if (msg.sender != address(COFFEE_TOKEN)) {
            revert WAGAZKManager__OnlyCoffeeTokenCanConfigurePrivacy_setPrivacyManager();
        }
        
        // Set default public privacy configuration
        // This is a placeholder - actual privacy configuration should be done through PrivacyLayer
        emit ZKProofAdded(batchId, bytes32(0), IZKVerifier.ProofType.PRICE_COMPETITIVENESS, "Default Public", msg.sender);
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
        if (!COFFEE_TOKEN.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist_addZKProof();
        }

        // Verify ZK proof based on type
        bool verified = _verifyZKProofByType(batchId, proofType, zkProofData, new uint256[](0), publicClaim);

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
            publicClaim: publicClaim,
            isEthiopianCompliance: false
        });
        zkProofExists[proofHash] = true;

        emit ZKProofAdded(batchId, proofHash, proofType, publicClaim, msg.sender);
        emit ZKProofVerified(batchId, proofHash, true);
    }

    /**
     * @dev Add and verify ZK proof for a batch with explicit caller
     * This function is used by tests to pass the original caller
     */
    function addZKProofWithCaller(
        address originalCaller,
        uint256 batchId,
        bytes calldata zkProofData,
        IZKVerifier.ProofType proofType,
        string calldata publicClaim
    ) external {
        // Check that the original caller has PROCESSOR_ROLE
        _checkCallerHasRoleFromCoffeeToken(PROCESSOR_ROLE, originalCaller);

        if (!COFFEE_TOKEN.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist_addZKProof();
        }

        // Verify ZK proof based on type
        bool verified = _verifyZKProofByType(batchId, proofType, zkProofData, new uint256[](0), publicClaim);

        if (!verified) {
            revert WAGAZKManager__ZKProofVerificationFailed_addZKProof();
        }

        // Store ZK proof
        bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, uint256(proofType), block.timestamp));
        batchZKProofs[batchId] = ZKProof({
            proofHash: proofHash,
            proofData: zkProofData,
            proofTimestamp: block.timestamp,
            proofGenerator: originalCaller, // Use original caller
            isValid: true,
            proofType: proofType,
            publicClaim: publicClaim,
            isEthiopianCompliance: false
        });
        zkProofExists[proofHash] = true;

        emit ZKProofAdded(batchId, proofHash, proofType, publicClaim, originalCaller);
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
        if (!COFFEE_TOKEN.isBatchCreated(batchId)) {
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
        return ZK_VERIFIER.getBatchProofStatus(batchId);
    }

    /**
     * @dev Check if batch has all required proofs
     */
    function hasAllRequiredProofs(uint256 batchId) external view returns (bool) {
        return ZK_VERIFIER.hasAllRequiredProofs(batchId);
    }

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE ZK FUNCTIONS                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add and verify EUDR compliance ZK proof
     * @param batchId Batch identifier
     * @param zkProofData ZK proof data
     * @param proofType Type of EUDR proof (DEFORESTATION_COMPLIANCE or GEOLOCATION_VERIFICATION)
     * @param publicClaim Public claim about EUDR compliance
     */
    function addEUDRComplianceZKProof(
        uint256 batchId,
        bytes calldata zkProofData,
        IZKVerifier.ProofType proofType,
        string calldata publicClaim
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!COFFEE_TOKEN.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist_addEUDRComplianceZKProof();
        }

        // Verify ZK proof based on type
        bool verified = _verifyZKProofByType(batchId, proofType, zkProofData, new uint256[](0), publicClaim);

        if (!verified) {
            revert WAGAZKManager__ZKProofVerificationFailed_addEUDRComplianceZKProof();
        }

        // Store EUDR compliance ZK proof
        bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, uint256(proofType), block.timestamp));

        if (proofType == IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE) {
            eudrDeforestationProofs[batchId] = ZKProof({
                proofHash: proofHash,
                proofData: zkProofData,
                proofTimestamp: block.timestamp,
                proofGenerator: msg.sender,
                isValid: true,
                proofType: proofType,
                publicClaim: publicClaim,
                isEthiopianCompliance: false
            });
        } else if (proofType == IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION) {
            eudrGeolocationProofs[batchId] = ZKProof({
                proofHash: proofHash,
                proofData: zkProofData,
                proofTimestamp: block.timestamp,
                proofGenerator: msg.sender,
                isValid: true,
                proofType: proofType,
                publicClaim: publicClaim,
                isEthiopianCompliance: false
            });
        }

        zkProofExists[proofHash] = true;

        // Update EUDR compliance status
        _updateEUDRZKComplianceStatus(batchId);

        emit EUDRComplianceZKProofAdded(batchId, proofType, proofHash, publicClaim);
    }

    /**
     * @dev Validate EUDR compliance with ZK privacy protection
     * @param batchId Batch identifier
     * @return isCompliant Whether batch meets EUDR compliance with ZK protection
     */
    function validateEUDRZKCompliance(uint256 batchId) external view returns (bool isCompliant) {
        // Check if batch has both required EUDR ZK proofs
        bool hasDeforestationProof = eudrDeforestationProofs[batchId].isValid;
        bool hasGeolocationProof = eudrGeolocationProofs[batchId].isValid;

        return hasDeforestationProof && hasGeolocationProof;
    }

    /**
     * @dev Get EUDR compliance ZK proof
     * @param batchId Batch identifier
     * @param proofType Type of EUDR proof
     * @return proof ZK proof data
     */
    function getEUDRComplianceZKProof(
        uint256 batchId,
        IZKVerifier.ProofType proofType
    ) external view returns (ZKProof memory proof) {
        if (proofType == IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE) {
            return eudrDeforestationProofs[batchId];
        } else if (proofType == IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION) {
            return eudrGeolocationProofs[batchId];
        }

        // Return empty proof if invalid type
        return ZKProof({
            proofHash: bytes32(0),
            proofData: "",
            proofTimestamp: 0,
            proofGenerator: address(0),
            isValid: false,
            proofType: proofType,
            publicClaim: "",
            isEthiopianCompliance: false
        });
    }

    /**
     * @dev Get EUDR ZK compliance status summary
     * @param batchId Batch identifier
     * @return hasDeforestation Has deforestation compliance proof
     * @return hasGeolocation Has geolocation verification proof
     * @return hasFullCompliance Has complete EUDR ZK compliance
     */
    function getEUDRZKComplianceStatus(uint256 batchId) external view returns (
        bool hasDeforestation,
        bool hasGeolocation,
        bool hasFullCompliance
    ) {
        hasDeforestation = eudrDeforestationProofs[batchId].isValid;
        hasGeolocation = eudrGeolocationProofs[batchId].isValid;
        hasFullCompliance = hasEUDRZKCompliance[batchId];
    }

    /* -------------------------------------------------------------------------- */
    /*                          ENHANCED ETHIOPIAN COMPLIANCE ZK FUNCTIONS       */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add enhanced ZK proof for Ethiopian compliance with specific proof types
     * @param batchId Batch identifier
     * @param complianceType Type of compliance ("ECTA_PERMIT", "QUALITY_CERT", "ORIGIN_VERIFICATION")
     * @param zkProofData ZK proof data proving compliance without revealing sensitive details
     * @param publicClaim Public claim about compliance
     */
    function addEthiopianComplianceZKProof(
        uint256 batchId,
        string calldata complianceType,
        bytes calldata zkProofData,
        string calldata publicClaim
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!COFFEE_TOKEN.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist_addEthiopianComplianceZKProof();
        }

        // Verify that underlying compliance exists
        if (address(ethiopianCompliance) == address(0)) {
            revert WAGAZKManager__EthiopianComplianceNotConfigured_setEthiopianCompliance();
        }

        // Determine the appropriate ZK proof type based on compliance type
        IZKVerifier.ProofType proofType;
        if (keccak256(abi.encodePacked(complianceType)) == keccak256(abi.encodePacked("ECTA_PERMIT"))) {
            proofType = IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY;
        } else if (keccak256(abi.encodePacked(complianceType)) == keccak256(abi.encodePacked("QUALITY_CERT"))) {
            proofType = IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY;
        } else if (keccak256(abi.encodePacked(complianceType)) == keccak256(abi.encodePacked("ORIGIN_VERIFICATION"))) {
            proofType = IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF;
        } else {
            revert WAGAZKManager__InvalidComplianceType_addEthiopianComplianceZKProof();
        }

        // Verify ZK proof
        bool verified = _verifyZKProofByType(batchId, proofType, zkProofData, new uint256[](0), publicClaim);

        if (!verified) {
            revert WAGAZKManager__ZKProofVerificationFailed_addEthiopianComplianceZKProof();
        }

        // Store Ethiopian compliance ZK proof
        bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, complianceType, block.timestamp));
        ethiopianComplianceProofs[batchId][complianceType] = ZKProof({
            proofHash: proofHash,
            proofData: zkProofData,
            proofTimestamp: block.timestamp,
            proofGenerator: msg.sender,
            isValid: true,
            proofType: proofType,
            publicClaim: publicClaim,
            isEthiopianCompliance: true
        });

        zkProofExists[proofHash] = true;

        // Check if all Ethiopian compliance proofs are now complete
        _updateEthiopianZKComplianceStatus(batchId);

        emit EthiopianComplianceProofAdded(batchId, complianceType, proofHash, publicClaim);
    }

    /**
     * @dev Update Ethiopian ZK compliance status after adding proofs
     */
    function _updateEthiopianZKComplianceStatus(uint256 batchId) internal {
        bool hasECTA = ethiopianComplianceProofs[batchId]["ECTA_PERMIT"].isValid;
        bool hasQuality = ethiopianComplianceProofs[batchId]["QUALITY_CERT"].isValid;
        bool hasOrigin = ethiopianComplianceProofs[batchId]["ORIGIN_VERIFICATION"].isValid;

        bool wasCompliant = hasEthiopianZKCompliance[batchId];
        bool isNowCompliant = hasECTA && hasQuality && hasOrigin;

        if (!wasCompliant && isNowCompliant) {
            hasEthiopianZKCompliance[batchId] = true;
            emit EthiopianZKComplianceValidated(batchId, true);
        }
    }

    /**
     * @dev Validate Ethiopian compliance with ZK privacy protection
     * @param batchId Batch identifier
     * @return isCompliant Whether batch meets Ethiopian compliance with ZK protection
     */
    function validateEthiopianZKCompliance(uint256 batchId) external view returns (bool isCompliant) {
        if (address(ethiopianCompliance) == address(0)) {
            revert WAGAZKManager__EthiopianComplianceNotConfigured_validateEthiopianZKCompliance();
        }

        // Check if batch has upstream compliance
        bool hasUpstreamCompliance = ethiopianCompliance.validateUpstreamCompliance(batchId);

        // Check if batch has ZK privacy protection for compliance data
        bool hasZKProtection = hasEthiopianZKCompliance[batchId];

        return hasUpstreamCompliance && hasZKProtection;
    }

    /**
     * @dev Generate Ethiopian compliance public claims with ZK privacy
     * @param batchId Batch identifier
     * @return complianceClaim Privacy-preserving compliance claim
     */
    function generateEthiopianComplianceClaim(uint256 batchId) external view returns (string memory complianceClaim) {
        if (!hasEthiopianZKCompliance[batchId]) {
            return "Compliance Status: Pending";
        }

        // Generate privacy-preserving compliance claim
        ZKProof memory ectaProof = ethiopianComplianceProofs[batchId]["ECTA_PERMIT"];
        ZKProof memory qualityProof = ethiopianComplianceProofs[batchId]["QUALITY_CERT"];
        ZKProof memory originProof = ethiopianComplianceProofs[batchId]["ORIGIN_VERIFICATION"];

        return string(abi.encodePacked(
            "Ethiopian Export Compliant - ",
            "ECTA: ", ectaProof.publicClaim, " | ",
            "Quality: ", qualityProof.publicClaim, " | ",
            "Origin: ", originProof.publicClaim
        ));
    }

    /* -------------------------------------------------------------------------- */
    /*                              PRIVACY-PRESERVING VALIDATION                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validate compliance with ZK privacy protection (supports both EUDR and Ethiopian)
     * @param batchId Batch identifier
     * @param complianceType Type of compliance to validate
     * @return isValid Whether compliance is valid
     * @return publicClaim Privacy-preserving public claim
     */
    function validateComplianceWithZK(
        uint256 batchId,
        string memory complianceType
    ) external view returns (bool isValid, string memory publicClaim) {
        bytes32 typeHash = keccak256(abi.encodePacked(complianceType));

        // EUDR compliance types
        if (typeHash == keccak256(abi.encodePacked("EUDR_DEFORESTATION"))) {
            ZKProof memory proof = eudrDeforestationProofs[batchId];
            return (proof.isValid, proof.publicClaim);
        } else if (typeHash == keccak256(abi.encodePacked("EUDR_GEOLOCATION"))) {
            ZKProof memory proof = eudrGeolocationProofs[batchId];
            return (proof.isValid, proof.publicClaim);
        }

        // Ethiopian compliance types
        ZKProof memory ethProof = ethiopianComplianceProofs[batchId][complianceType];
        return (ethProof.isValid, ethProof.publicClaim);
    }

    /**
     * @dev Generate comprehensive compliance claim with ZK privacy
     * @param batchId Batch identifier
     * @return complianceClaim Privacy-preserving compliance summary
     */
    function generateComplianceClaim(uint256 batchId) external view returns (string memory complianceClaim) {
        bool hasEUDR = hasEUDRZKCompliance[batchId];
        bool hasEthiopian = hasEthiopianZKCompliance[batchId];

        if (!hasEUDR && !hasEthiopian) {
            return "Compliance Status: Pending";
        }

        string memory eudrClaim = "";
        string memory ethClaim = "";

        if (hasEUDR) {
            ZKProof memory deforestationProof = eudrDeforestationProofs[batchId];
            ZKProof memory geolocationProof = eudrGeolocationProofs[batchId];
            eudrClaim = string(abi.encodePacked(
                "EUDR Compliant - ",
                deforestationProof.publicClaim, " | ",
                geolocationProof.publicClaim
            ));
        }

        if (hasEthiopian) {
            ZKProof memory ectaProof = ethiopianComplianceProofs[batchId]["ECTA_PERMIT"];
            ZKProof memory qualityProof = ethiopianComplianceProofs[batchId]["QUALITY_CERT"];
            ZKProof memory originProof = ethiopianComplianceProofs[batchId]["ORIGIN_VERIFICATION"];

            ethClaim = string(abi.encodePacked(
                "Ethiopian Export Compliant - ",
                "ECTA: ", ectaProof.publicClaim, " | ",
                "Quality: ", qualityProof.publicClaim, " | ",
                "Origin: ", originProof.publicClaim
            ));
        }

        if (hasEUDR && hasEthiopian) {
            return string(abi.encodePacked(eudrClaim, " | ", ethClaim));
        } else if (hasEUDR) {
            return eudrClaim;
        } else {
            return ethClaim;
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTERNAL FUNCTIONS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Internal function to verify ZK proof based on type
     */
    function _verifyZKProofByType(
        uint256 batchId,
        IZKVerifier.ProofType proofType,
        bytes calldata zkProofData,
        uint256[] memory publicSignals,
        string memory publicClaim
    ) internal returns (bool verified) {
        if (proofType == IZKVerifier.ProofType.PRICE_COMPETITIVENESS) {
            return ZK_VERIFIER.verifyPriceCompetitiveness(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.QUALITY_STANDARDS) {
            return ZK_VERIFIER.verifyQualityStandards(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE) {
            return ZK_VERIFIER.verifySupplyChainProvenance(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE) {
            return ZK_VERIFIER.verifyEUDRDeforestationCompliance(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION) {
            return ZK_VERIFIER.verifyEUDRGeolocation(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY) {
            return ZK_VERIFIER.verifyECTAPermitValidity(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY) {
            return ZK_VERIFIER.verifyQualityCertificateAuthenticity(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF) {
            return ZK_VERIFIER.verifyOrigin(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE) {
            return ZK_VERIFIER.verifyBoEForexCompliance(batchId, zkProofData, publicSignals, publicClaim);
        }

        return false;
    }

    /**
     * @dev Update EUDR ZK compliance status after adding proofs
     */
    function _updateEUDRZKComplianceStatus(uint256 batchId) internal {
        bool hasDeforestation = eudrDeforestationProofs[batchId].isValid;
        bool hasGeolocation = eudrGeolocationProofs[batchId].isValid;

        bool wasCompliant = hasEUDRZKCompliance[batchId];
        bool isNowCompliant = hasDeforestation && hasGeolocation;

        if (!wasCompliant && isNowCompliant) {
            hasEUDRZKCompliance[batchId] = true;
            emit EUDRZKComplianceValidated(batchId, true);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                         ETHIOPIAN COMPLIANCE ZK FUNCTIONS                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set Ethiopian compliance contract (admin only)
     */
    function setEthiopianCompliance(address _ethiopianCompliance) external {
        _checkCallerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE, msg.sender);
        if (_ethiopianCompliance == address(0)) {
            revert WAGAZKManager__InvalidEthiopianComplianceAddress_setEthiopianCompliance();
        }
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
    }

}
