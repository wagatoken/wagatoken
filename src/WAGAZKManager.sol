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
        require(msg.sender == address(COFFEE_TOKEN), "Only coffee token can configure privacy");
        
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
        bool verified = false;
        if (proofType == IZKVerifier.ProofType.PRICE_COMPETITIVENESS) {
            verified = ZK_VERIFIER.verifyPriceCompetitiveness(batchId, zkProofData, new uint256[](0), publicClaim);
        } else if (proofType == IZKVerifier.ProofType.QUALITY_STANDARDS) {
            verified = ZK_VERIFIER.verifyQualityStandards(batchId, zkProofData, new uint256[](0), publicClaim);
        } else if (proofType == IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE) {
            verified = ZK_VERIFIER.verifySupplyChainProvenance(batchId, zkProofData, new uint256[](0), publicClaim);
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
        bool verified = false;
        if (proofType == IZKVerifier.ProofType.PRICE_COMPETITIVENESS) {
            verified = ZK_VERIFIER.verifyPriceCompetitiveness(batchId, zkProofData, new uint256[](0), publicClaim);
        } else if (proofType == IZKVerifier.ProofType.QUALITY_STANDARDS) {
            verified = ZK_VERIFIER.verifyQualityStandards(batchId, zkProofData, new uint256[](0), publicClaim);
        } else if (proofType == IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE) {
            verified = ZK_VERIFIER.verifySupplyChainProvenance(batchId, zkProofData, new uint256[](0), publicClaim);
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
    /*                         ETHIOPIAN COMPLIANCE ZK FUNCTIONS                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set Ethiopian compliance contract (admin only)
     */
    function setEthiopianCompliance(address _ethiopianCompliance) external {
        _checkCallerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE, msg.sender);
        require(_ethiopianCompliance != address(0), "Invalid Ethiopian compliance address");
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
    }

    /**
     * @dev Add ZK proof for Ethiopian compliance (ECTA permit, quality cert, or origin)
     * @param batchId Batch identifier
     * @param complianceType Type of compliance ("ECTA_PERMIT", "QUALITY_CERT", "ORIGIN_VERIFICATION")
     * @param zkProofData ZK proof data proving compliance without revealing sensitive details
     * @param publicClaim Public claim about compliance (e.g., "ECTA Compliant", "Premium Ethiopian Quality")
     */
    function addEthiopianComplianceZKProof(
        uint256 batchId,
        string calldata complianceType,
        bytes calldata zkProofData,
        string calldata publicClaim
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!COFFEE_TOKEN.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist_addZKProof();
        }

        // Verify that underlying compliance exists
        require(address(ethiopianCompliance) != address(0), "Ethiopian compliance not configured");
        
        // Verify ZK proof (using supply chain verification as it's most appropriate for compliance)
        bool verified = ZK_VERIFIER.verifySupplyChainProvenance(
            batchId, 
            zkProofData, 
            new uint256[](0), 
            publicClaim
        );

        if (!verified) {
            revert WAGAZKManager__ZKProofVerificationFailed_addZKProof();
        }

        // Store Ethiopian compliance ZK proof
        bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, complianceType, block.timestamp));
        ethiopianComplianceProofs[batchId][complianceType] = ZKProof({
            proofHash: proofHash,
            proofData: zkProofData,
            proofTimestamp: block.timestamp,
            proofGenerator: msg.sender,
            isValid: true,
            proofType: IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE,
            publicClaim: publicClaim,
            isEthiopianCompliance: true
        });

        zkProofExists[proofHash] = true;

        // Check if all Ethiopian compliance proofs are now complete
        _updateEthiopianZKComplianceStatus(batchId);

        emit EthiopianComplianceProofAdded(batchId, complianceType, proofHash, publicClaim);
    }

    /**
     * @dev Validate Ethiopian compliance with ZK privacy protection
     * @param batchId Batch identifier
     * @return isCompliant Whether batch meets Ethiopian compliance with ZK protection
     */
    function validateEthiopianZKCompliance(uint256 batchId) external view returns (bool isCompliant) {
        if (address(ethiopianCompliance) == address(0)) {
            return false;
        }

        // Check if batch has upstream compliance
        bool hasUpstreamCompliance = ethiopianCompliance.validateUpstreamCompliance(batchId);
        
        // Check if batch has ZK privacy protection for compliance data
        bool hasZKProtection = hasEthiopianZKCompliance[batchId];

        return hasUpstreamCompliance && hasZKProtection;
    }

    /**
     * @dev Get Ethiopian compliance ZK proof
     * @param batchId Batch identifier
     * @param complianceType Type of compliance proof
     * @return proof ZK proof data
     */
    function getEthiopianComplianceZKProof(
        uint256 batchId,
        string calldata complianceType
    ) external view returns (ZKProof memory proof) {
        return ethiopianComplianceProofs[batchId][complianceType];
    }

    /**
     * @dev Get all Ethiopian compliance ZK status
     * @param batchId Batch identifier
     * @return hasECTA Has ECTA permit ZK proof
     * @return hasQuality Has quality certificate ZK proof
     * @return hasOrigin Has origin verification ZK proof
     * @return hasFullCompliance Has complete Ethiopian ZK compliance
     */
    function getEthiopianZKComplianceStatus(uint256 batchId) external view returns (
        bool hasECTA,
        bool hasQuality,
        bool hasOrigin,
        bool hasFullCompliance
    ) {
        hasECTA = ethiopianComplianceProofs[batchId]["ECTA_PERMIT"].isValid;
        hasQuality = ethiopianComplianceProofs[batchId]["QUALITY_CERT"].isValid;
        hasOrigin = ethiopianComplianceProofs[batchId]["ORIGIN_VERIFICATION"].isValid;
        hasFullCompliance = hasEthiopianZKCompliance[batchId];
    }

    /* -------------------------------------------------------------------------- */
    /*                         INTERNAL ETHIOPIAN FUNCTIONS                       */
    /* -------------------------------------------------------------------------- */

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
}
